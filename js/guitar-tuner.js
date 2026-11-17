
"use strict";

/*
 * Standalone guitar tuner.
 * No iframe, parent-window, overlay.js, or layer-visibility dependencies.
 * Standard tuning reference: A4 = 440 Hz.
 */

(() => {
  const STRINGS = [
    { note: "E2", frequency: 82.4069 },
    { note: "A2", frequency: 110.0000 },
    { note: "D3", frequency: 146.8324 },
    { note: "G3", frequency: 195.9977 },
    { note: "B3", frequency: 246.9417 },
    { note: "E4", frequency: 329.6276 }
  ];

  const A4 = 440;
  const MIN_HZ = 65;
  const MAX_HZ = 400;
  const YIN_THRESHOLD = 0.15;
  const ANALYSIS_INTERVAL_MS = 55;

  // Require repeated evidence before displaying a new pitch.
  const REQUIRED_STABLE_READINGS = 3;

  // Pitch stabilization.
  const MAX_WINDOW = 7;
  const MAX_ACCEPTED_JUMP_CENTS = 45;
  const MIN_PITCH_CLARITY = 0.60;

  // Meter and in-tune behavior.
  const IN_TUNE_CENTS = 3;
  const ZERO_DEADBAND_CENTS = 1.2;
  const STATUS_ENTER_CENTS = 3;
  const STATUS_LEAVE_CENTS = 5;
  const REQUIRED_IN_TUNE_READINGS = 3;

  // Adaptive smoothing: quicker for genuine changes, steadier for noise.
  const FAST_ALPHA = 0.45;
  const SLOW_ALPHA = 0.16;

  // Clear the display only after the signal has been absent this long.
  const SIGNAL_LOSS_MS = 1000;

  const el = {
    start: document.getElementById("start-button"),
    note: document.getElementById("detected-note"),
    octave: document.getElementById("detected-octave"),
    frequency: document.getElementById("detected-frequency"),
    status: document.getElementById("tuning-status"),
    cents: document.getElementById("cents-display"),
    meter: document.getElementById("meter-indicator"),
    mic: document.getElementById("microphone-status"),
    modeControls: document.getElementById("tuning-mode-controls"),
    stringButtons: Array.from(
      document.querySelectorAll(".string-button")
    )
  };

  // Stop safely if the expected tuner HTML is missing.
  if (
    !el.start || !el.note || !el.octave || !el.frequency ||
    !el.status || !el.cents || !el.meter || !el.mic
  ) {
    console.error("Guitar tuner: required HTML elements are missing.");
    return;
  }

  let audioContext = null;
  let mediaStream = null;
  let sourceNode = null;
  let analyser = null;
  let audioBuffer = null;

  let running = false;
  let starting = false;
  let animationFrame = 0;
  let lastAnalysisTime = 0;

  let mode = "auto";
  let selectedString = null;

  let recentFrequencies = [];
  let candidateNote = null;
  let candidateCount = 0;
  let lastGoodReadingAt = 0;
  let sessionToken = 0;

  let smoothedCents = null;
  let smoothingTargetNote = null;
  let lastRawCents = null;

  let inTuneCount = 0;
  let isInTune = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function median(values) {
    if (!values.length) return 0;

    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function centsBetween(frequency, target) {
    return 1200 * Math.log2(frequency / target);
  }

  function resetStabilization() {
    recentFrequencies = [];
    candidateNote = null;
    candidateCount = 0;
    smoothedCents = null;
    smoothingTargetNote = null;
    lastRawCents = null;
    inTuneCount = 0;
    isInTune = false;
  }

  function setStatus(message, className = "") {
    el.status.textContent = message;
    el.status.className =
      "tuning-status" + (className ? " " + className : "");
  }

  function resetDisplay(message = "Start the tuner to begin") {
    el.note.textContent = "—";
    el.octave.textContent = "Play a string";
    el.frequency.textContent = "-- Hz";
    el.cents.textContent = message;

    el.meter.style.left = "50%";
    el.meter.style.background = "#4aaee8";

    setStatus(running ? "Listening…" : "Ready");
  }

  function updateStringSelection() {
    el.stringButtons.forEach(button => {
      const isSelected =
        selectedString &&
        button.dataset.note === selectedString.note;

      button.classList.toggle("selected", Boolean(isSelected));
      button.setAttribute(
        "aria-pressed",
        isSelected ? "true" : "false"
      );
    });
  }

  function makeModeControls() {
    if (!el.modeControls) return;

    el.modeControls.innerHTML = "";

    [
      { mode: "auto", label: "Automatic" },
      { mode: "manual", label: "Manual" }
    ].forEach(item => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        "mode-button" + (item.mode === mode ? " active" : "");
      button.textContent = item.label;
      button.dataset.mode = item.mode;
      button.setAttribute(
        "aria-pressed",
        item.mode === mode ? "true" : "false"
      );

      button.addEventListener("click", () => {
        setMode(item.mode);
      });

      el.modeControls.appendChild(button);
    });
  }

  function updateModeButtons() {
    if (!el.modeControls) return;

    el.modeControls
      .querySelectorAll(".mode-button")
      .forEach(button => {
        const active = button.dataset.mode === mode;

        button.classList.toggle("active", active);
        button.setAttribute(
          "aria-pressed",
          active ? "true" : "false"
        );
      });
  }

  function setMode(nextMode) {
    mode = nextMode === "manual" ? "manual" : "auto";

    if (mode === "auto") {
      selectedString = null;
    }

    updateModeButtons();
    updateStringSelection();
    resetStabilization();

    resetDisplay(
      mode === "manual"
        ? "Choose a string, then play it"
        : "Play any open string"
    );
  }

  function chooseString(note) {
    const target = STRINGS.find(item => item.note === note);
    if (!target) return;

    selectedString = target;
    mode = "manual";

    updateModeButtons();
    updateStringSelection();
    resetStabilization();

    smoothingTargetNote = target.note;

    resetDisplay("Tuning target: " + target.note);
  }

  function findNearestString(frequency) {
    let best = STRINGS[0];
    let bestDistance = Infinity;

    for (const string of STRINGS) {
      const distance = Math.abs(
        centsBetween(frequency, string.frequency)
      );

      if (distance < bestDistance) {
        best = string;
        bestDistance = distance;
      }
    }

    return {
      string: best,
      cents: centsBetween(frequency, best.frequency),
      distance: bestDistance
    };
  }

  function frequencyToNote(frequency) {
    const midi = Math.round(
      69 + 12 * Math.log2(frequency / A4)
    );

    const names = [
      "C", "C♯", "D", "D♯", "E", "F",
      "F♯", "G", "G♯", "A", "A♯", "B"
    ];

    return {
      name: names[((midi % 12) + 12) % 12],
      octave: Math.floor(midi / 12) - 1,
      midi
    };
  }

  /*
   * YIN pitch detection.
   * The signal is decimated by two to reduce processing.
   */
  function detectPitchYIN(input, sampleRate) {
    const factor = 2;
    const length = Math.floor(input.length / factor);

    if (length < 1024) return null;

    const signal = new Float32Array(length);
    let mean = 0;

    for (let i = 0, j = 0; i < length; i++, j += factor) {
      signal[i] = input[j];
      mean += signal[i];
    }

    mean /= length;

    let energy = 0;

    for (let i = 0; i < length; i++) {
      signal[i] -= mean;
      energy += signal[i] * signal[i];
    }

    if (energy / length < 0.000012) return null;

    const effectiveRate = sampleRate / factor;

    const minLag = Math.max(
      2,
      Math.floor(effectiveRate / MAX_HZ)
    );

    const maxLag = Math.min(
      Math.floor(effectiveRate / MIN_HZ),
      Math.floor(length / 2)
    );

    if (maxLag <= minLag + 2) return null;

    const difference = new Float32Array(maxLag + 1);
    const cmnd = new Float32Array(maxLag + 1);

    cmnd[0] = 1;

    for (let lag = 1; lag <= maxLag; lag++) {
      let sum = 0;
      const limit = length - lag;

      for (let i = 0; i < limit; i++) {
        const delta = signal[i] - signal[i + lag];
        sum += delta * delta;
      }

      difference[lag] = sum;
    }

    let runningSum = 0;

    for (let lag = 1; lag <= maxLag; lag++) {
      runningSum += difference[lag];

      cmnd[lag] = runningSum > 0
        ? difference[lag] * lag / runningSum
        : 1;
    }

    let bestLag = -1;

    for (let lag = minLag; lag < maxLag; lag++) {
      if (cmnd[lag] < YIN_THRESHOLD) {
        while (
          lag + 1 < maxLag &&
          cmnd[lag + 1] < cmnd[lag]
        ) {
          lag++;
        }

        bestLag = lag;
        break;
      }
    }

    if (bestLag < 0) {
      let bestValue = Infinity;

      for (let lag = minLag; lag <= maxLag; lag++) {
        if (cmnd[lag] < bestValue) {
          bestValue = cmnd[lag];
          bestLag = lag;
        }
      }

      if (bestValue > 0.32) return null;
    }

    const left = Math.max(minLag, bestLag - 1);
    const right = Math.min(maxLag, bestLag + 1);

    const a = cmnd[left];
    const b = cmnd[bestLag];
    const c = cmnd[right];

    const denominator = 2 * (2 * b - a - c);

    const shift = Math.abs(denominator) > 1e-9
      ? clamp((a - c) / denominator, -1, 1)
      : 0;

    const refinedLag = bestLag + shift;
    const frequency = effectiveRate / refinedLag;
    const clarity = 1 - b;

    if (
      !Number.isFinite(frequency) ||
      frequency < MIN_HZ ||
      frequency > MAX_HZ ||
      clarity < 0.55
    ) {
      return null;
    }

    return { frequency, clarity };
  }

  /*
   * Reject isolated, implausible jumps, but allow a genuine pitch
   * change to be accepted after repeated matching readings.
   */
  function acceptReading(frequency, clarity) {
    if (clarity < MIN_PITCH_CLARITY) return null;

    const proposedMidi = frequencyToNote(frequency).midi;

    if (candidateNote === proposedMidi) {
      candidateCount++;
    } else {
      candidateNote = proposedMidi;
      candidateCount = 1;
    }

    if (candidateCount < REQUIRED_STABLE_READINGS) {
      return null;
    }

    if (recentFrequencies.length) {
      const previousMedian = median(recentFrequencies);
      const jump = Math.abs(
        centsBetween(frequency, previousMedian)
      );

      if (jump > MAX_ACCEPTED_JUMP_CENTS) {
        // Treat the jump as a new candidate instead of mixing it
        // with the old pitch. Repeated readings can confirm it.
        if (candidateCount < REQUIRED_STABLE_READINGS + 2) {
          return null;
        }

        recentFrequencies = [];
      }
    }

    recentFrequencies.push(frequency);

    if (recentFrequencies.length > MAX_WINDOW) {
      recentFrequencies.shift();
    }

    return median(recentFrequencies);
  }

  function updateMeter(cents) {
    const stableCents =
      Math.abs(cents) <= ZERO_DEADBAND_CENTS ? 0 : cents;

    const visualCents = clamp(stableCents, -50, 50);

    el.meter.style.left = (50 + visualCents) + "%";

    if (isInTune) {
      el.meter.style.background = "#32a568";
    } else if (stableCents < 0) {
      el.meter.style.background = "#4aaee8";
    } else {
      el.meter.style.background = "#d9534f";
    }
  }

  function showPitch(frequency) {
    const note = frequencyToNote(frequency);
    const nearest = findNearestString(frequency);

    const target =
      mode === "manual" && selectedString
        ? selectedString
        : nearest.string;

    if (mode === "auto") {
      selectedString = nearest.string;
      updateStringSelection();
    }

    const rawCents = centsBetween(frequency, target.frequency);

    if (
      smoothingTargetNote !== target.note ||
      smoothedCents === null
    ) {
      smoothingTargetNote = target.note;
      smoothedCents = rawCents;
      lastRawCents = rawCents;
    } else {
      const change = Math.abs(rawCents - lastRawCents);
      const alpha = change > 5 ? FAST_ALPHA : SLOW_ALPHA;

      smoothedCents += alpha * (rawCents - smoothedCents);
      lastRawCents = rawCents;
    }

    const displayCents =
      Math.abs(smoothedCents) <= ZERO_DEADBAND_CENTS
        ? 0
        : smoothedCents;

    const normalizedNoteName = value =>
      value.replace("♯", "#");

    const targetNoteName = target.note.replace(/\d/g, "");

    const noteMatchesTarget =
      normalizedNoteName(note.name) ===
      normalizedNoteName(targetNoteName);

    const withinEnterRange =
      Math.abs(displayCents) <= STATUS_ENTER_CENTS;

    const withinLeaveRange =
      Math.abs(displayCents) <= STATUS_LEAVE_CENTS;

    if (isInTune) {
      if (!withinLeaveRange) {
        isInTune = false;
        inTuneCount = 0;
      }
    } else if (withinEnterRange) {
      inTuneCount++;

      if (inTuneCount >= REQUIRED_IN_TUNE_READINGS) {
        isInTune = true;
      }
    } else {
      inTuneCount = 0;
    }

    el.note.textContent = note.name;
    el.octave.textContent = "Octave " + note.octave;
    el.frequency.textContent = frequency.toFixed(2) + " Hz";

    updateMeter(displayCents);

    const signedCents =
      (displayCents > 0 ? "+" : "") +
      displayCents.toFixed(1);

    el.cents.textContent =
      mode === "manual"
        ? signedCents + " cents · Target " + target.note
        : signedCents + " cents · Nearest string " + target.note;

    const validTarget =
      mode === "manual" ||
      noteMatchesTarget ||
      nearest.distance <= 45;

    if (isInTune && validTarget) {
      setStatus("In Tune", "in-tune");
    } else if (displayCents < 0) {
      setStatus("Too Low", "flat");
    } else {
      setStatus("Too High", "sharp");
    }
  }

  function handleLostSignal() {
    if (Date.now() - lastGoodReadingAt <= SIGNAL_LOSS_MS) return;

    resetStabilization();

    if (mode === "auto") {
      selectedString = null;
      updateStringSelection();
    }

    resetDisplay("Play a clear, single string");
    lastGoodReadingAt = Date.now();
  }

  function analysisLoop(timestamp) {
    if (!running || !analyser || !audioBuffer) return;

    animationFrame = requestAnimationFrame(analysisLoop);

    if (timestamp - lastAnalysisTime < ANALYSIS_INTERVAL_MS) {
      return;
    }

    lastAnalysisTime = timestamp;

    analyser.getFloatTimeDomainData(audioBuffer);

    const result = detectPitchYIN(
      audioBuffer,
      audioContext.sampleRate
    );

    if (!result) {
      handleLostSignal();
      return;
    }

    const stableFrequency = acceptReading(
      result.frequency,
      result.clarity
    );

    if (stableFrequency === null) {
      handleLostSignal();
      return;
    }

    lastGoodReadingAt = Date.now();
    showPitch(stableFrequency);
  }

  async function startTuner() {
    if (running || starting) return;

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      el.mic.textContent =
        "Microphone access is not available in this browser.";
      setStatus("Microphone unavailable");
      return;
    }

    starting = true;
    const token = ++sessionToken;

    el.start.disabled = true;
    el.start.textContent = "Starting…";
    el.mic.textContent = "Requesting microphone permission…";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: { ideal: 1 }
        }
      });

      if (token !== sessionToken) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      mediaStream = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error(
          "Audio processing is not supported on this device."
        );
      }

      audioContext = new AudioContextClass();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      sourceNode =
        audioContext.createMediaStreamSource(mediaStream);

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;

      sourceNode.connect(analyser);
      audioBuffer = new Float32Array(analyser.fftSize);

      running = true;
      starting = false;

      resetStabilization();

      lastGoodReadingAt = Date.now();
      lastAnalysisTime = 0;

      el.start.disabled = false;
      el.start.textContent = "Stop Tuner";
      el.start.classList.add("running");

      el.mic.textContent =
        "Microphone active · " +
        Math.round(audioContext.sampleRate / 1000) +
        " kHz";

      resetDisplay(
        mode === "manual" && selectedString
          ? "Play " + selectedString.note
          : "Play any open guitar string"
      );

      animationFrame = requestAnimationFrame(analysisLoop);
    } catch (error) {
      await releaseAudioResources();

      running = false;
      starting = false;

      el.start.disabled = false;
      el.start.textContent = "Start Tuner";
      el.start.classList.remove("running");

      const message =
        error && error.name === "NotAllowedError"
          ? "Microphone permission denied. Allow microphone access in your device settings."
          : error && error.name === "NotFoundError"
            ? "No microphone was found on this device."
            : error && error.message
              ? error.message
              : "Unable to start the microphone.";

      el.mic.textContent = message;
      setStatus("Could not start");
    }
  }

  async function releaseAudioResources() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = 0;

    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (_) {}
    }

    if (analyser) {
      try {
        analyser.disconnect();
      } catch (_) {}
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (_) {}
      });
    }

    mediaStream = null;
    sourceNode = null;
    analyser = null;
    audioBuffer = null;

    if (audioContext) {
      const context = audioContext;
      audioContext = null;

      try {
        if (context.state !== "closed") {
          await context.close();
        }
      } catch (_) {}
    }
  }

  async function stopTuner(updateUi = true) {
    sessionToken++;
    running = false;
    starting = false;

    await releaseAudioResources();
    resetStabilization();

    if (updateUi) {
      el.start.disabled = false;
      el.start.textContent = "Start Tuner";
      el.start.classList.remove("running");

      el.mic.textContent = "Microphone is off";
      resetDisplay("Start the tuner to begin");
    }
  }

  el.start.addEventListener("click", () => {
    if (running || starting) {
      void stopTuner();
    } else {
      void startTuner();
    }
  });

  el.stringButtons.forEach(button => {
    button.addEventListener("click", () => {
      chooseString(button.dataset.note);
    });
  });

  window.addEventListener("pagehide", () => {
    void stopTuner(false);
  });

  window.addEventListener("beforeunload", () => {
    void stopTuner(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "hidden" &&
      running
    ) {
      void stopTuner();
    }
  });

  makeModeControls();
  updateStringSelection();
  resetDisplay();
})();

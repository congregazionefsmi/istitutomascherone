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
  const REQUIRED_STABLE_READINGS = 2;

  // Cents display stabilization
  const IN_TUNE_CENTS = 3;
  const ZERO_DEADBAND_CENTS = 1.5;
  const CENTS_SMOOTHING_ALPHA = 0.30;

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

  // State used to smooth cents without delaying note identification.
  let smoothedCents = null;
  let smoothingTargetNote = null;

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

    const auto = document.createElement("button");
    auto.type = "button";
    auto.className = "mode-button active";
    auto.textContent = "Automatic";
    auto.dataset.mode = "auto";
    auto.setAttribute("aria-pressed", "true");

    const manual = document.createElement("button");
    manual.type = "button";
    manual.className = "mode-button";
    manual.textContent = "Manual";
    manual.dataset.mode = "manual";
    manual.setAttribute("aria-pressed", "false");

    [auto, manual].forEach(button => {
      button.addEventListener("click", () => {
        setMode(button.dataset.mode);
      });

      el.modeControls.appendChild(button);
    });
  }

  function setMode(nextMode) {
    mode = nextMode === "manual" ? "manual" : "auto";

    if (mode === "auto") {
      selectedString = null;
    }

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

    updateStringSelection();

    recentFrequencies = [];
    candidateNote = null;
    candidateCount = 0;
    smoothedCents = null;
    smoothingTargetNote = null;

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

    el.modeControls
      .querySelectorAll(".mode-button")
      .forEach(button => {
        const active = button.dataset.mode === "manual";

        button.classList.toggle("active", active);
        button.setAttribute(
          "aria-pressed",
          active ? "true" : "false"
        );
      });

    updateStringSelection();

    recentFrequencies = [];
    candidateNote = null;
    candidateCount = 0;
    smoothedCents = null;
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
   *
   * The input is decimated by two to reduce processing work while
   * preserving sufficient resolution for the low E2 guitar string.
   * Parabolic interpolation improves frequency precision between lags.
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

    if (energy / length < 0.000012) {
      return null;
    }

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
   * Update the tuning meter.
   *
   * A small deadband keeps the needle centered when the measured
   * pitch fluctuates slightly around zero.
   */
  function updateMeter(cents) {
    const stableCents =
      Math.abs(cents) <= ZERO_DEADBAND_CENTS
        ? 0
        : cents;

    const visualCents = clamp(stableCents, -50, 50);

    el.meter.style.left = (50 + visualCents) + "%";

    if (Math.abs(stableCents) <= IN_TUNE_CENTS) {
      el.meter.style.background = "#32a568";
    } else if (stableCents < 0) {
      el.meter.style.background = "#4aaee8";
    } else {
      el.meter.style.background = "#d9534f";
    }
  }

  function showPitch(frequency, confidence) {
    const note = frequencyToNote(frequency);
    const nearest = findNearestString(frequency);

    const target =
      mode === "manual" && selectedString
        ? selectedString
        : nearest.string;

    // In automatic mode, highlight the detected guitar string.
    if (mode === "auto") {
      selectedString = nearest.string;
      updateStringSelection();
    }

    /*
     * Smooth only the cents display.
     * Note detection and automatic string selection remain responsive.
     */
    const rawCents = centsBetween(
      frequency,
      target.frequency
    );

    if (
      smoothingTargetNote !== target.note ||
      smoothedCents === null
    ) {
      smoothingTargetNote = target.note;
      smoothedCents = rawCents;
    } else {
      smoothedCents +=
        CENTS_SMOOTHING_ALPHA *
        (rawCents - smoothedCents);
    }

    // Display-only deadband to prevent tiny zero-crossing jumps.
    const displayCents =
      Math.abs(smoothedCents) <= ZERO_DEADBAND_CENTS
        ? 0
        : smoothedCents;

    const noteMatchesTarget =
      note.name.replace("♯", "#") ===
      target.note.replace(/\d/g, "").replace("#", "♯");

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

    if (
      Math.abs(displayCents) <= IN_TUNE_CENTS &&
      (
        mode === "manual" ||
        noteMatchesTarget ||
        nearest.distance <= 45
      )
    ) {
      setStatus("In Tune", "in-tune");
    } else if (displayCents < 0) {
      setStatus("Too Low", "flat");
    } else {
      setStatus("Too High", "sharp");
    }
  }

  function analysisLoop(timestamp) {
    if (!running || !analyser || !audioBuffer) return;

    animationFrame = requestAnimationFrame(analysisLoop);

    if (
      timestamp - lastAnalysisTime <
      ANALYSIS_INTERVAL_MS
    ) {
      return;
    }

    lastAnalysisTime = timestamp;

    analyser.getFloatTimeDomainData(audioBuffer);

    const result = detectPitchYIN(
      audioBuffer,
      audioContext.sampleRate
    );

    if (!result) {
      if (Date.now() - lastGoodReadingAt > 900) {
        recentFrequencies = [];
        candidateNote = null;
        candidateCount = 0;
        smoothedCents = null;
        smoothingTargetNote = null;

        // Clear the automatic highlight when no string is detected.
        if (mode === "auto") {
          selectedString = null;
          updateStringSelection();
        }

        resetDisplay("Play a clear, single string");
      }

      return;
    }

    const nearest = findNearestString(result.frequency);

    const proposedTarget =
      mode === "manual" && selectedString
        ? selectedString
        : nearest.string;

    const proposedNote = frequencyToNote(
      result.frequency
    ).midi;

    // Require repeated evidence before accepting a new detected note.
    if (candidateNote === proposedNote) {
      candidateCount++;
    } else {
      candidateNote = proposedNote;
      candidateCount = 1;
    }

    if (candidateCount < REQUIRED_STABLE_READINGS) {
      return;
    }

    // Keep a short median window to reduce noisy frequency readings.
    if (
      recentFrequencies.length &&
      Math.abs(
        centsBetween(
          result.frequency,
          median(recentFrequencies)
        )
      ) > 100
    ) {
      recentFrequencies = [result.frequency];
    } else {
      recentFrequencies.push(result.frequency);

      if (recentFrequencies.length > 5) {
        recentFrequencies.shift();
      }
    }

    const stableFrequency = median(recentFrequencies);

    lastGoodReadingAt = Date.now();

    showPitch(stableFrequency, result.clarity);
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
        window.AudioContext ||
        window.webkitAudioContext;

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

      recentFrequencies = [];
      candidateNote = null;
      candidateCount = 0;
      smoothedCents = null;
      smoothingTargetNote = null;

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

    recentFrequencies = [];
    candidateNote = null;
    candidateCount = 0;
    smoothedCents = null;
    smoothingTargetNote = null;

    if (updateUi) {
      el.start.disabled = false;
      el.start.textContent = "Start Tuner";
      el.start.classList.remove("running");

      el.mic.textContent = "Microphone is off";

      resetDisplay("Start the tuner to begin");
    }
  }

  // Start/stop button.
  el.start.addEventListener("click", () => {
    if (running || starting) {
      void stopTuner();
    } else {
      void startTuner();
    }
  });

  // Manual guitar-string selection.
  el.stringButtons.forEach(button => {
    button.addEventListener("click", () => {
      chooseString(button.dataset.note);
    });
  });

  // Standalone-page lifecycle; no iframe or overlay hooks.
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

"use strict";

/* ==========================================
   COMPENDIO DI PREGHIERE
   CACHE MANAGER
========================================== */

(() => {
    /* ======================================
       HTML ELEMENTS
    ====================================== */

    const workerStatus = document.getElementById("workerStatus");
    const cacheStatus = document.getElementById("cacheStatus");
    const totalFiles = document.getElementById("totalFiles");

    const installButton = document.getElementById("installPwaButton");
    const installOfflineButton = document.getElementById("installOfflineButton");
    const pwaMessage = document.getElementById("pwaMessage");

    const verifyButton = document.getElementById("verifyButton");
    const fetchMissingButton = document.getElementById("fetchMissingButton");
    const viewFilesButton = document.getElementById("viewFilesButton");
    const rebuildButton = document.getElementById("rebuildButton");

    const progressTitle = document.getElementById("progressTitle");
    const progressPercent = document.getElementById("progressPercent");
    const progressBar = document.getElementById("progressBar");
    const progressCount = document.getElementById("progressCount");
    const progressPhase = document.getElementById("progressPhase");
    const currentFile = document.getElementById("currentFile");
    const operationMessage = document.getElementById("operationMessage");

    const cachedCount = document.getElementById("cachedCount");
    const missingCount = document.getElementById("missingCount");
    const failedCount = document.getElementById("failedCount");

    const fileListSection = document.getElementById("fileListSection");
    const fileList = document.getElementById("fileList");

    const showAllFiles = document.getElementById("showAllFiles");
    const showCachedFiles = document.getElementById("showCachedFiles");
    const showMissingFiles = document.getElementById("showMissingFiles");

    const errorSection = document.getElementById("errorSection");
    const errorList = document.getElementById("errorList");


    /* ======================================
       STATE
    ====================================== */

    let registration = null;
    let deferredInstallPrompt = null;
    let operationRunning = false;

    let currentFiles = [];
    let currentFilter = "all";
    let lastFailedCount = 0;


    /* ======================================
       GENERAL UI
    ====================================== */

    function setMessage(message, type = "info") {
        if (!operationMessage) return;

        operationMessage.textContent = message;
        operationMessage.dataset.status = type;
    }


    function setProgress(current, total) {
        const percentage = total > 0
            ? Math.min(100, Math.round((current / total) * 100))
            : 0;

        if (progressBar) {
            progressBar.style.width = percentage + "%";
        }

        if (progressPercent) {
            progressPercent.textContent = percentage + "%";
        }

        if (progressCount) {
            progressCount.textContent =
                current + " / " + total + " file";
        }
    }


    function resetProgress(title = "In attesa") {
        if (progressTitle) {
            progressTitle.textContent = title;
        }

        if (progressPhase) {
            progressPhase.textContent = "Pronto";
        }

        setProgress(0, 0);

        if (currentFile) {
            currentFile.textContent =
                "Nessuna operazione in corso.";
        }
    }


    function setPhase(title, phase) {
        if (progressTitle) {
            progressTitle.textContent = title;
        }

        if (progressPhase) {
            progressPhase.textContent = phase;
        }
    }


    function setCurrentFile(file) {
        if (currentFile) {
            currentFile.textContent = file
                ? "File: " + file
                : "Nessuna operazione in corso.";
        }
    }


    function setButtonsDisabled(disabled) {
        [
            verifyButton,
            fetchMissingButton,
            viewFilesButton,
            rebuildButton,
            installOfflineButton
        ].forEach(button => {
            if (button) button.disabled = disabled;
        });

        if (installButton) {
            installButton.disabled =
                disabled || !deferredInstallPrompt;
        }
    }


    function startOperation(title) {
        if (operationRunning) return false;

        operationRunning = true;

        setButtonsDisabled(true);
        resetProgress(title);

        return true;
    }


    function finishOperation() {
        operationRunning = false;
        setButtonsDisabled(false);
    }


    /* ======================================
       SUMMARY
    ====================================== */

    function updateSummary(result) {
        if (!result) return;

        if (cachedCount) {
            cachedCount.textContent =
                result.cached ?? "—";
        }

        if (missingCount) {
            missingCount.textContent =
                result.missing ?? "—";
        }

        if (failedCount) {
            failedCount.textContent =
                lastFailedCount;
        }

        if (totalFiles) {
            totalFiles.textContent =
                result.total ?? "—";
        }

        if (cacheStatus) {
            if (result.total === 0) {
                cacheStatus.textContent = "Nessun file previsto";
            } else if (result.missing === 0) {
                cacheStatus.textContent = "Completa";
            } else {
                cacheStatus.textContent =
                    result.cached + " / " + result.total +
                    " file caricati";
            }
        }
    }


    /* ======================================
       ERROR DISPLAY
    ====================================== */

    function showErrors(errors) {
        if (!errorSection || !errorList) return;

        errorList.replaceChildren();

        if (!Array.isArray(errors) || errors.length === 0) {
            errorSection.hidden = true;
            return;
        }

        errorSection.hidden = false;

        errors.forEach(item => {
            const row = document.createElement("div");
            row.className = "error-item";

            const file = item.file || "Unknown file";
            const message = item.error || "Unknown error";

            row.textContent = file + " — " + message;

            errorList.appendChild(row);
        });
    }


    /* ======================================
       FILE LIST
    ====================================== */

    function renderFiles() {
        if (!fileList) return;

        fileList.replaceChildren();

        const filteredFiles = currentFiles.filter(item => {
            if (currentFilter === "cached") {
                return item.cached;
            }

            if (currentFilter === "missing") {
                return !item.cached;
            }

            return true;
        });

        if (filteredFiles.length === 0) {
            const empty = document.createElement("p");

            empty.textContent = "Nessun file da visualizzare.";

            fileList.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();

        filteredFiles.forEach(item => {
            const row = document.createElement("div");
            row.className = "file-item";

            const name = document.createElement("span");
            name.className = "file-name";
            name.textContent = item.file;

            const status = document.createElement("span");

            status.className = item.cached
                ? "file-status cached"
                : "file-status missing";

            status.textContent = item.cached
                ? "Cached"
                : "Missing";

            row.appendChild(name);
            row.appendChild(status);

            fragment.appendChild(row);
        });

        fileList.appendChild(fragment);
    }


    function setFileFilter(filter) {
        currentFilter = filter;

        if (showAllFiles) {
            showAllFiles.classList.toggle(
                "active",
                filter === "all"
            );
        }

        if (showCachedFiles) {
            showCachedFiles.classList.toggle(
                "active",
                filter === "cached"
            );
        }

        if (showMissingFiles) {
            showMissingFiles.classList.toggle(
                "active",
                filter === "missing"
            );
        }

        renderFiles();
    }


    /* ======================================
       SERVICE WORKER REGISTRATION
    ====================================== */

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            throw new Error(
                "Questo browser non supporta i Service Worker."
            );
        }

        if (!window.isSecureContext) {
            throw new Error(
                "Il Service Worker richiede HTTPS o localhost."
            );
        }

        if (workerStatus) {
            workerStatus.textContent = "Registrazione...";
        }

        registration = await navigator.serviceWorker.register(
            "./service-worker.js",
            { scope: "./" }
        );

        await navigator.serviceWorker.ready;

        registration =
            await navigator.serviceWorker.getRegistration("./");

        if (!registration || !registration.active) {
            throw new Error(
                "Il Service Worker non è ancora attivo. Ricarica la pagina."
            );
        }

        if (workerStatus) {
            workerStatus.textContent = "Attivo";
        }

        return registration;
    }


    /* ======================================
       SERVICE WORKER COMMAND
    ====================================== */

    function sendCommand(type, onProgress) {
        return new Promise((resolve, reject) => {
            if (!registration || !registration.active) {
                reject(
                    new Error("Service Worker non attivo.")
                );
                return;
            }

            const channel = new MessageChannel();
            const worker = registration.active;

            let completed = false;

            function finish(result) {
                if (completed) return;

                completed = true;
                channel.port1.close();

                resolve(result);
            }

            channel.port1.onmessage = event => {
                const data = event.data || {};

                if (data.type === "PROGRESS") {
                    if (typeof onProgress === "function") {
                        onProgress(data);
                    }

                    return;
                }

                if (data.final === true) {
                    finish(data);
                }
            };

            channel.port1.onmessageerror = () => {
                if (completed) return;

                completed = true;
                channel.port1.close();

                reject(
                    new Error(
                        "Errore nella lettura della risposta del Service Worker."
                    )
                );
            };

            try {
                worker.postMessage(
                    { type },
                    [channel.port2]
                );
            } catch (error) {
                completed = true;
                channel.port1.close();
                reject(error);
            }
        });
    }


    /* ======================================
       REFRESH CACHE STATUS
    ====================================== */

    async function refreshFileStatus() {
        const result = await sendCommand(
            "GET_CACHE_STATUS"
        );

        if (!result.success) {
            throw new Error(
                result.error || "Verifica della cache non riuscita."
            );
        }

        currentFiles = Array.isArray(result.files)
            ? result.files
            : [];

        updateSummary(result);

        if (fileListSection && !fileListSection.hidden) {
            renderFiles();
        }

        setProgress(
            result.cached || 0,
            result.total || 0
        );

        return result;
    }


    /* ======================================
       VERIFY CACHE
    ====================================== */

    async function verifyCache() {
        if (!startOperation("Verifica cache")) return;

        try {
            setMessage("Controllo dei file presenti nella cache...");

            setPhase("Verifica cache", "Controllo file");

            const result = await refreshFileStatus();

            lastFailedCount = 0;
            if (failedCount) failedCount.textContent = "0";

            showErrors([]);

            setMessage(
                "Verifica completata: " +
                result.cached + " presenti, " +
                result.missing + " mancanti, " +
                result.total + " totali.",
                result.missing === 0 ? "success" : "warning"
            );

            setPhase("Verifica completata", "Completato");

        } catch (error) {
            setMessage(
                "Errore durante la verifica: " + error.message,
                "error"
            );
        } finally {
            finishOperation();
        }
    }


    /* ======================================
       FETCH MISSING
    ====================================== */

    async function fetchMissingFiles() {
        if (!startOperation("Download file mancanti")) return;

        try {
            setMessage("Download dei file mancanti in corso...");

            setPhase("Download", "Preparazione");

            const result = await sendCommand(
                "FETCH_MISSING",
                data => {
                    if (data.total) {
                        setProgress(
                            data.current || 0,
                            data.total
                        );
                    }

                    if (data.file) {
                        setCurrentFile(data.file);
                    }

                    if (progressTitle) {
                        progressTitle.textContent =
                            "Download file mancanti";
                    }

                    if (progressPhase) {
                        progressPhase.textContent =
                            data.status || "Download";
                    }
                }
            );

            if (!result.success) {
                lastFailedCount = result.failed || 0;
                showErrors(result.errors || []);
            } else {
                lastFailedCount = 0;
                showErrors([]);
            }

            const status = await refreshFileStatus();

            if (failedCount) {
                failedCount.textContent = lastFailedCount;
            }

            if (result.success) {
                setMessage(
                    "Download completato. " +
                    result.downloaded + " nuovi file scaricati; " +
                    result.alreadyCached + " già presenti.",
                    "success"
                );
            } else {
                setMessage(
                    "Download completato con errori. " +
                    result.downloaded + " scaricati; " +
                    result.failed + " non scaricati.",
                    "error"
                );
            }

            setPhase("Download completato", "Completato");

        } catch (error) {
            setMessage(
                "Download non riuscito: " + error.message,
                "error"
            );
        } finally {
            finishOperation();
        }
    }


    /* ======================================
       INSTALL OFFLINE FILES
       Downloads missing files only.
    ====================================== */

    async function installOfflineFiles() {
        await fetchMissingFiles();
    }


    /* ======================================
       CLEAR CACHE & FETCH ALL
    ====================================== */

    async function rebuildCache() {
        if (!startOperation("Ricostruzione cache")) return;

        const confirmed = window.confirm(
            "Questa operazione scaricherà nuovamente tutti i file. " +
            "La cache esistente verrà salvata prima della sostituzione. " +
            "Vuoi continuare?"
        );

        if (!confirmed) {
            finishOperation();
            return;
        }

        try {
            setMessage("Preparazione della ricostruzione della cache...");

            const result = await sendCommand(
                "CLEAR_CACHE_AND_FETCH_ALL",
                data => {
                    if (data.phase === "downloading") {
                        setPhase(
                            "Download di tutti i file",
                            "Download"
                        );

                        if (data.total) {
                            setProgress(
                                data.current || 0,
                                data.total
                            );
                        }

                        if (data.file) {
                            setCurrentFile(data.file);
                        }
                    }

                    if (data.phase === "backup") {
                        setPhase(
                            "Backup cache",
                            "Salvataggio"
                        );

                        setMessage(
                            "Salvataggio della cache esistente..."
                        );
                    }

                    if (data.phase === "replacing") {
                        setPhase(
                            "Sostituzione cache",
                            "Sostituzione"
                        );

                        if (data.total) {
                            setProgress(
                                data.current || 0,
                                data.total
                            );
                        }

                        if (data.file) {
                            setCurrentFile(data.file);
                        }
                    }

                    if (data.phase === "rollback") {
                        setPhase(
                            "Ripristino cache",
                            "Rollback"
                        );

                        setMessage(
                            "Errore nella sostituzione. Ripristino della cache precedente..."
                        );
                    }
                }
            );

            if (result.success) {
                lastFailedCount = 0;
                showErrors([]);

                setMessage(
                    "Operazione completata. Tutti i " +
                    result.total +
                    " file sono stati scaricati e memorizzati.",
                    "success"
                );

                setProgress(
                    result.cached || result.total,
                    result.total
                );

                setPhase("Cache completata", "Completato");

            } else {
                lastFailedCount = result.failed || 0;

                showErrors(result.errors || []);

                let message = result.message ||
                    "Ricostruzione della cache non riuscita.";

                if (result.error) {
                    message += " " + result.error;
                }

                if (result.restored === true) {
                    message += " La cache precedente è stata ripristinata.";
                }

                if (result.restored === false) {
                    message += " Il backup è stato conservato.";
                }

                setMessage(message, "error");
            }

            await refreshFileStatus();

            if (failedCount) {
                failedCount.textContent = lastFailedCount;
            }

        } catch (error) {
            setMessage(
                "Operazione non riuscita: " + error.message,
                "error"
            );
        } finally {
            finishOperation();
        }
    }


    /* ======================================
       VIEW FILES
    ====================================== */

    async function viewFiles() {
        if (!startOperation("Elenco dei file")) return;

        try {
            setMessage("Caricamento dell'elenco dei file...");

            const result = await refreshFileStatus();

            if (fileListSection) {
                fileListSection.hidden = false;
            }

            setFileFilter("all");

            setMessage(
                "Elenco caricato: " +
                result.total + " file previsti, " +
                result.cached + " presenti, " +
                result.missing + " mancanti.",
                "success"
            );

            setPhase("Elenco caricato", "Completato");

        } catch (error) {
            setMessage(
                "Impossibile caricare i file: " + error.message,
                "error"
            );
        } finally {
            finishOperation();
        }
    }


    /* ======================================
       PWA INSTALLATION
    ====================================== */

    window.addEventListener(
        "beforeinstallprompt",
        event => {
            event.preventDefault();

            deferredInstallPrompt = event;

            if (installButton) {
                installButton.disabled = operationRunning;
            }

            if (pwaMessage) {
                pwaMessage.textContent =
                    "Compendio è pronto per essere installato.";
            }
        }
    );


    window.addEventListener(
        "appinstalled",
        () => {
            deferredInstallPrompt = null;

            if (installButton) {
                installButton.disabled = true;
            }

            if (pwaMessage) {
                pwaMessage.textContent =
                    "Compendio è stato installato.";
            }
        }
    );


    async function installApp() {
        if (!deferredInstallPrompt) {
            if (pwaMessage) {
                pwaMessage.textContent =
                    "Installazione automatica non disponibile. " +
                    "Apri il menu del browser e scegli " +
                    "'Installa app' oppure 'Aggiungi alla schermata Home'.";
            }

            return;
        }

        try {
            await deferredInstallPrompt.prompt();

            const choice =
                await deferredInstallPrompt.userChoice;

            if (pwaMessage) {
                pwaMessage.textContent =
                    choice.outcome === "accepted"
                        ? "Installazione accettata."
                        : "Installazione annullata.";
            }

        } catch (error) {
            if (pwaMessage) {
                pwaMessage.textContent =
                    "Errore di installazione: " + error.message;
            }
        } finally {
            deferredInstallPrompt = null;

            if (installButton) {
                installButton.disabled = true;
            }
        }
    }


    /* ======================================
       BUTTON EVENTS
    ====================================== */

    if (verifyButton) {
        verifyButton.addEventListener("click", verifyCache);
    }

    if (fetchMissingButton) {
        fetchMissingButton.addEventListener(
            "click",
            fetchMissingFiles
        );
    }

    if (installOfflineButton) {
        installOfflineButton.addEventListener(
            "click",
            installOfflineFiles
        );
    }

    if (rebuildButton) {
        rebuildButton.addEventListener(
            "click",
            rebuildCache
        );
    }

    if (viewFilesButton) {
        viewFilesButton.addEventListener(
            "click",
            viewFiles
        );
    }

    if (installButton) {
        installButton.addEventListener(
            "click",
            installApp
        );
    }

    if (showAllFiles) {
        showAllFiles.addEventListener(
            "click",
            () => setFileFilter("all")
        );
    }

    if (showCachedFiles) {
        showCachedFiles.addEventListener(
            "click",
            () => setFileFilter("cached")
        );
    }

    if (showMissingFiles) {
        showMissingFiles.addEventListener(
            "click",
            () => setFileFilter("missing")
        );
    }


    /* ======================================
       INITIALIZATION
    ====================================== */

    async function initialize() {
        resetProgress();

        if (installButton) {
            installButton.disabled = true;
        }

        if (pwaMessage) {
            pwaMessage.textContent =
                "In attesa della disponibilità di installazione del browser...";
        }

        try {
            await registerServiceWorker();

            const result = await refreshFileStatus();

            setMessage(
                "Sistema pronto. " +
                result.cached + " file presenti e " +
                result.missing + " mancanti.",
                "success"
            );

            setPhase("Sistema pronto", "Pronto");

            if (failedCount) {
                failedCount.textContent = "0";
            }

            if (!deferredInstallPrompt && pwaMessage) {
                pwaMessage.textContent =
                    "Se non compare il pulsante di installazione automatica, " +
                    "usa il menu del browser: Installa app / Aggiungi alla schermata Home.";
            }

        } catch (error) {
            console.error(
                "Cache Manager initialization failed:",
                error
            );

            if (workerStatus) {
                workerStatus.textContent = "Errore";
            }

            setMessage(
                "Inizializzazione non riuscita: " + error.message,
                "error"
            );
        }
    }


    initialize();

})();

/* ==================================================
   CANTI — CATALOGUE SCRIPT
================================================== */

document.addEventListener("deviceready", () => {
    console.log("Cordova device ready fired!");
    initSongbook();
}, false);

// Fallback for standard web browser testing outside APK
if (!window.cordova) {
    document.addEventListener("DOMContentLoaded", () => {
        initSongbook();
    });
}

function initSongbook() {
    "use strict";

    const searchInput = document.getElementById("searchSong");
    const clearButton = document.getElementById("clearSearch");
    const categoriesContainer = document.getElementById("songCategories");
    const noSongsFound = document.getElementById("noSongsFound");

    if (
        !searchInput ||
        !clearButton ||
        !categoriesContainer ||
        !noSongsFound
    ) {
        console.error("Canti: elementi HTML mancanti.");
        return;
    }

    if (
        typeof songCategories === "undefined" ||
        !Array.isArray(songCategories)
    ) {
        console.error(
            "Canti: songCategories non è stato trovato in js/songs-generated.js."
        );

        categoriesContainer.textContent =
            "Impossibile caricare l'elenco dei canti.";

        return;
    }

    let expandedCategory = sessionStorage.getItem("songbookExpandedCategory") || null;

    const PDF_SONGBOOKS = {
        "Bayan Umawit Songbook": "pdf/bayanumawit.pdf",
        "Italian Music Sheets": "pdf/musichub2026.pdf"
    };

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function normalize(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("it")
            .trim();
    }

    function getSongs(category) {
        return Array.isArray(category.songs)
            ? category.songs
            : [];
    }

    function getSongbooks(category) {
        return Array.isArray(category.songbooks)
            ? category.songbooks
            : [];
    }

    function getSongNumber(title) {
        const match = String(title ?? "").match(
            /^\s*([IVXLCDM]+|\d+)\s*[.)-]?/i
        );

        return match ? match[1] : "";
    }

    function isPdf(song) {
        if (String(song.type ?? "").toLowerCase() === "pdf") {
            return true;
        }

        return /\.pdf$/i.test(String(song.file ?? ""));
    }

    function getPdfViewerUrl(pdfPath) {
        return (
            "pdf-songbook-viewer.html?file=" +
            encodeURIComponent(pdfPath)
        );
    }

    function matchesSong(song, query) {
        if (!query) {
            return true;
        }

        const title = normalize(song.title);
        const number = normalize(getSongNumber(song.title));

        return title.includes(query) || number.includes(query);
    }

    /* ==================================================
       HELPER: HANDLE EXTERNAL PDF OPENING (Web vs App)
    ================================================== */

    function handleExternalPdfClick(event, pdfPath) {
        event.preventDefault();

        // 1. Web Version / Browser: Simply open in a new tab
        if (!window.cordova) {
            window.open(pdfPath, "_blank");
            return;
        }

        // 2. Cordova App Version: Use fileOpener2 plugin
        const opener = window.cordova.plugins && window.cordova.plugins.fileOpener2;

        if (opener) {
            const fileName = pdfPath.split('/').pop();
            const cleanPath = pdfPath.startsWith('/') ? pdfPath.substring(1) : pdfPath;
            const absoluteUrl = window.location.origin + "/" + cleanPath;

            fetch(absoluteUrl)
                .then(response => {
                    if (!response.ok) throw new Error("HTTP error " + response.status);
                    return response.blob();
                })
                .then(blob => {
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
                        dirEntry.getFile(fileName, { create: true, exclusive: false }, function(fileEntry) {
                            fileEntry.createWriter(function(fileWriter) {
                                fileWriter.onwriteend = function() {
                                    opener.open(
                                        fileEntry.nativeURL,
                                        "application/pdf",
                                        {
                                            error: function(e) {
                                                alert("FileOpener2 Error: " + JSON.stringify(e));
                                            },
                                            success: function() {
                                                console.log("PDF opened successfully");
                                            }
                                        }
                                    );
                                };
                                fileWriter.onerror = function(e) {
                                    alert("Writer Error: " + JSON.stringify(e));
                                };
                                fileWriter.write(blob);
                            }, function(err) {
                                alert("CreateWriter Error: " + JSON.stringify(err));
                            });
                        }, function(err) {
                            alert("GetFile Error: " + JSON.stringify(err));
                        });
                    }, function(err) {
                        alert("DataDir Error: " + JSON.stringify(err));
                    });
                })
                .catch(err => {
                    alert("Fetch Error: " + err.message);
                });
        } else {
            window.open(pdfPath, "_blank");
        }
    }

    function createSongLink(song) {
        const item = createElement("li", "song-item");

        if (isPdf(song)) {
            item.classList.add("has-external-action");

            const link = createElement("a", "song-link", song.title);
            link.href = getPdfViewerUrl(song.file);
            item.appendChild(link);

            const extLink = createElement("a", "song-external-link");
            extLink.href = song.file;
            extLink.target = "_blank";
            extLink.rel = "noopener noreferrer";
            extLink.setAttribute("aria-label", "Apri PDF esternamente");
            extLink.setAttribute("title", "Apri esternamente");

            extLink.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            `;

            extLink.addEventListener("click", (event) => handleExternalPdfClick(event, song.file));
            item.appendChild(extLink);
        } else {
            const link = createElement("a", "song-link", song.title);
            link.href =
                "songbook-viewer.html?file=" +
                encodeURIComponent(song.file);
            item.appendChild(link);
        }

        return item;
    }

    function createSongbookLink(songbook) {
        const item = createElement("li", "song-item has-external-action");

        const pdfPath =
            songbook.file ||
            PDF_SONGBOOKS[songbook.name];

        const link = createElement(
            "a",
            "songbook-pdf-link",
            songbook.name
        );

        if (pdfPath) {
            link.href = getPdfViewerUrl(pdfPath);
        } else {
            link.href = "#";
            console.warn("Canti: percorso PDF non trovato per:", songbook.name);
            link.addEventListener("click", event => {
                event.preventDefault();
            });
        }

        item.appendChild(link);

        if (pdfPath) {
            const extLink = createElement("a", "song-external-link");
            extLink.href = pdfPath;
            extLink.target = "_blank";
            extLink.rel = "noopener noreferrer";
            extLink.setAttribute("aria-label", "Apri PDF esternamente");
            extLink.setAttribute("title", "Apri esternamente");

            extLink.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            `;

            extLink.addEventListener("click", (event) => handleExternalPdfClick(event, pdfPath));
            item.appendChild(extLink);
        }

        return item;
    }

    function createCategory(category, query) {
        const songs = getSongs(category);
        const songbooks = getSongbooks(category);

        const matchingSongs = songs.filter(song =>
            matchesSong(song, query)
        );

        const matchingSongbooks = query
            ? songbooks.filter(songbook =>
                normalize(songbook.name).includes(query)
            )
            : songbooks;

        const hasMatches =
            matchingSongs.length > 0 ||
            matchingSongbooks.length > 0;

        if (query && !hasMatches) {
            return null;
        }

        const section = createElement(
            "section",
            "song-category"
        );

        const categoryId = String(
            category.id || category.name
        );

        const button = createElement(
            "button",
            "song-category-toggle"
        );

        button.type = "button";

        const heading = createElement(
            "span",
            "song-category-name",
            category.name
        );

        const count = createElement(
            "span",
            "song-category-count",
            String(
                matchingSongs.length +
                matchingSongbooks.length
            )
        );

        const chevron = createElement(
            "span",
            "song-category-chevron",
        );

        chevron.setAttribute("aria-hidden", "true");

        button.append(heading, count, chevron);

        const content = createElement(
            "div",
            "song-category-content"
        );

        const list = createElement("ul", "song-list");

        matchingSongs.forEach(song => {
            list.appendChild(createSongLink(song));
        });

        matchingSongbooks.forEach(songbook => {
            list.appendChild(createSongbookLink(songbook));
        });

        content.appendChild(list);

        const isExpanded =
            query.length > 0 ||
            expandedCategory === categoryId;

        content.hidden = !isExpanded;

        button.setAttribute(
            "aria-expanded",
            String(isExpanded)
        );

        button.addEventListener("click", () => {
            if (searchInput.value.trim()) {
                return;
            }

            expandedCategory =
                expandedCategory === categoryId
                    ? null
                    : categoryId;

            if (expandedCategory) {
                sessionStorage.setItem("songbookExpandedCategory", expandedCategory);
            } else {
                sessionStorage.removeItem("songbookExpandedCategory");
            }

            render();
        });

        section.append(button, content);

        return section;
    }

    function render() {
        const query = normalize(searchInput.value);

        categoriesContainer.replaceChildren();

        let visibleCategoryCount = 0;

        songCategories.forEach(category => {
            const section = createCategory(category, query);

            if (section) {
                categoriesContainer.appendChild(section);
                visibleCategoryCount++;
            }
        });

        noSongsFound.hidden = visibleCategoryCount !== 0;

        clearButton.hidden = searchInput.value.length === 0;
    }

    searchInput.addEventListener("input", () => {
        render();
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        expandedCategory = null;
        sessionStorage.removeItem("songbookExpandedCategory");

        render();

        searchInput.focus();
    });

    render();

    if (expandedCategory && !searchInput.value) {
        setTimeout(() => {
            const activeSection = Array.from(categoriesContainer.children).find(sec => {
                const btn = sec.querySelector(".song-category-toggle");
                return btn && btn.getAttribute("aria-expanded") === "true";
            });
            if (activeSection) {
                activeSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 50);
    }
}

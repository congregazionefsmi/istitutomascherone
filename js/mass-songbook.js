/* ==========================================================
   MASS GUIDE → NEW SONGBOOK
   Existing overlay + generated folder-based catalogue
========================================================== */


/* ==========================================================
   EDITABLE CONFIGURATION — SONG FOLDER ASSIGNMENTS
   (Mapped exactly to your songCategories folder names)
========================================================== */

const MASS_SONG_FOLDERS = {

    "Ingresso": [
        "Ingresso"
    ],

    "Kyrie": [
        "Kyrie"
    ],

    "Gloria": [
        "Gloria"
    ],

    "Alleluia": [
        "Alleluia"
    ],

    "Offertorio": [
        "Offertorio"
    ],

    "Santo": [
        "Santo"
    ],

    "Agnello di Dio": [
        "Agnus Dei"
    ],

    "Comunione": [
        "Comunione"
    ],

    "Finale": [
        "Finale"
    ],

    /* ======================================================
       EXACT MATCHES FOR ADORATION & EXTRA CATEGORIES
    ====================================================== */

    "Adorazione": [
        "Adorazione"
    ],

    "Adorazione / Meditazione": [
        "Adorazione"
    ],

    "Spirito Santo": [
        "Spirito Santo"
    ],

    "Mariano": [
        "Mariano"
    ],

    "Avvento": [
        "Avvento"
    ],

    "Natale": [
        "Natale"
    ],

    "Quaresma": [
        "Quaresma"
    ],

    "Quaresima": [
        "Quaresma"
    ],

    "Pasqua": [
        "Pasqua"
    ],

    "Altre Lingue": [
        "Altre Lingue"
    ]

};


/* ==========================================================
   MASS GUIDE INTEGRATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ======================================================
       RESTORE MASS GUIDE SCROLL POSITION
    ====================================================== */

    const savedScrollPosition =
        sessionStorage.getItem("massGuideScrollPosition");

    if (savedScrollPosition !== null) {
        const position = parseInt(savedScrollPosition, 10);

        requestAnimationFrame(() => {
            window.scrollTo({
                top: position,
                behavior: "instant"
            });
        });

        sessionStorage.removeItem("massGuideScrollPosition");
    }


    /* ======================================================
       FIND SONG BUTTONS
    ====================================================== */

    const songButtons =
        document.querySelectorAll(".song-button");

    if (!songButtons.length) return;


    /* ======================================================
       READ GENERATED CATALOGUE
    ====================================================== */

    const categories =
        typeof songCategories !== "undefined"
            ? songCategories
            : [];

    if (!Array.isArray(categories) || !categories.length) {
        console.error(
            "Songbook catalogue not found. Check songs-generated.js."
        );
        return;
    }


    /* ======================================================
       CREATE THE EXISTING FLOATING SONG PANEL
    ====================================================== */

    const overlay = document.createElement("div");
    overlay.className = "mass-song-overlay";

    overlay.innerHTML = `
        <div class="mass-song-panel">

            <div class="mass-song-header">
                <h2 id="massSongTitle">Canti</h2>

                <button
                    class="mass-song-close"
                    type="button"
                    aria-label="Chiudi">
                    ×
                </button>
            </div>

            <div
                id="massSongList"
                class="mass-song-list">
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    const title = overlay.querySelector("#massSongTitle");
    const songList = overlay.querySelector("#massSongList");
    const closeButton = overlay.querySelector(".mass-song-close");


    /* ======================================================
       STATE
    ====================================================== */

    let massSongOpen = false;


    /* ======================================================
       NORMALIZE CATEGORY NAMES
    ====================================================== */

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^\s*\d+\s*/, "")
            .trim()
            .toLowerCase();
    }


    function getCategoryName(category) {
        return category.name || category.id || "";
    }


    /* ======================================================
       FIND A GENERATED CATALOGUE CATEGORY
    ====================================================== */

    function findCategory(name) {
        const wanted = normalize(name);

        return categories.find(category => {
            return normalize(getCategoryName(category)) === wanted;
        });
    }


    /* ======================================================
       GET ASSIGNED CATEGORIES FOR A SINGLE KEY
    ====================================================== */

    function getAssignedCategories(massCategoryName) {

        const folderNames =
            MASS_SONG_FOLDERS[massCategoryName] || [];

        const resolved = [];

        folderNames.forEach(folderName => {
            const category = findCategory(folderName);

            if (!category) {
                console.warn(
                    `Mass song folder not found: "${folderName}".`
                );
                return;
            }

            if (!resolved.includes(category)) {
                resolved.push(category);
            }
        });

        return resolved;
    }


    /* ======================================================
       OPEN SONG PANEL (MULTIPLE CATEGORY AGGREGATION)
    ====================================================== */

    function openSongPanel(categoryValue, section) {

        if (massSongOpen) return;

        // Combine section and comma-separated category values
        const rawInput = section ? section + "," + (categoryValue || "") : (categoryValue || "");
        
        const requestedItems = rawInput
            .split(",")
            .map(value => value.trim())
            .filter(Boolean);

        const massCategoryNames = Object.keys(MASS_SONG_FOLDERS);
        let selectedCategories = [];

        // Loop through all requested tokens and pull matches simultaneously
        requestedItems.forEach(req => {
            const wantedNorm = normalize(req);

            massCategoryNames.forEach(massName => {
                if (normalize(massName) === wantedNorm) {
                    const assigned = getAssignedCategories(massName);
                    assigned.forEach(cat => {
                        if (!selectedCategories.includes(cat)) {
                            selectedCategories.push(cat);
                        }
                    });
                }
            });
        });

        let matchingSongs = [];

        selectedCategories.forEach(category => {
            const songs = Array.isArray(category.songs)
                ? category.songs
                : [];

            songs.forEach(song => {
                matchingSongs.push({
                    ...song,
                    categoryName: getCategoryName(category)
                });
            });
        });


        /* ==================================================
           REMOVE DUPLICATE SONG FILES
        ================================================== */

        const seenFiles = new Set();
        matchingSongs = matchingSongs.filter(song => {
            if (!song.file) return false;
            if (seenFiles.has(song.file)) return false;
            seenFiles.add(song.file);
            return true;
        });


        /* ==================================================
           SET PANEL TITLE & CLEAR LIST
        ================================================== */

        title.textContent = "Canti";

        songList.innerHTML = "";

        if (!matchingSongs.length) {
            const empty = document.createElement("p");
            empty.className = "mass-song-empty";
            empty.textContent = "Nessun canto trovato in queste categorie.";
            songList.appendChild(empty);
        }


        /* ==================================================
           CREATE SONG ITEMS
        ================================================== */

        matchingSongs.forEach(song => {

            const item = document.createElement("button");

            item.type = "button";
            item.className = "mass-song-item";

            const name = document.createElement("span");
            name.className = "mass-song-name";
            name.textContent = song.title || "Canto senza titolo";

            item.appendChild(name);


            /* ==============================================
                OPEN THE SELECTED SONG AS A NORMAL PAGE LINK
            ============================================== */

            item.addEventListener("click", () => {

                if (!song.file) return;

                sessionStorage.setItem(
                    "massGuideScrollPosition",
                    String(window.scrollY)
                );

                const isPDF =
                    song.type === "pdf" ||
                    /\.pdf(?:$|[?#])/i.test(song.file);

                const viewer = isPDF
                    ? "pdf-songbook-viewer.html"
                    : "songbook-viewer.html";

                const viewerURL =
                    viewer + "?file=" +
                    encodeURIComponent(song.file);

                window.top.location.href = viewerURL;

            });

            songList.appendChild(item);

        });


        /* ==================================================
           SHOW PANEL & HIDE MAIN OVERLAY CLOSE BUTTON
        ================================================== */

        massSongOpen = true;
        overlay.classList.add("show");
        document.body.classList.add("mass-song-open");

        if (window.parent && typeof window.parent.hideMainOverlayClose === "function") {
            window.parent.hideMainOverlayClose();
        }
    }


    /* ======================================================
       CLOSE PANEL
    ====================================================== */

    function closeSongPanel() {
        if (!massSongOpen) return;
        overlay.classList.remove("show");
        document.body.classList.remove("mass-song-open");
        massSongOpen = false;

        if (window.parent && typeof window.parent.showMainOverlayClose === "function") {
            window.parent.showMainOverlayClose();
        }
    }


    /* ======================================================
       CLOSE BUTTON & TAP OUTSIDE & ESC KEY
    ====================================================== */

    closeButton.addEventListener("click", () => {
        closeSongPanel();
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeSongPanel();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && massSongOpen) {
            closeSongPanel();
        }
    });


    /* ======================================================
       MASS GUIDE MUSIC BUTTONS
    ====================================================== */

    songButtons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();

            const category = button.dataset.songCategory || "";
            const section = button.dataset.songSection || "";

            if (!category && !section) return;

            openSongPanel(category, section);
        });
    });

});

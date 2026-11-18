/* ==========================================
   STATUS BAR COLOR
========================================== */

if (window.Capacitor && window.Capacitor.isNativePlatform()) {

    const StatusBar =
        window.Capacitor.Plugins?.StatusBar;

    if (StatusBar) {

        (async () => {

            try {

                await StatusBar.setOverlaysWebView({
                    overlay: false
                });

                await StatusBar.setBackgroundColor({
                    color: "#4AAEE8"
                });

                await StatusBar.setStyle({
                    style: "LIGHT"
                });

            } catch (error) {

                console.log("StatusBar error:", error);

            }

        })();

    }

}


/* ==========================================================
   UNLIMITED PAGE NAVIGATION & NATIVE EXIT HANDLER
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Prevent home links/logos from stacking duplicate index entries
    document.querySelectorAll("a.home-link, a[href='index.html']").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.replace("index.html");
        });
    });
});

// Universal Back Button / Gesture Interceptor for Cordova WebViews
document.addEventListener("deviceready", () => {
    document.addEventListener("backbutton", function (e) {
        const overlayActive = document.getElementById("pageOverlay")?.classList.contains("active");
        if (overlayActive) return;

        const pathname = window.location.pathname;
        const isIndex = pathname.endsWith("/") || pathname.endsWith("/index.html") || pathname === "";

        if (isIndex || window.history.length <= 1) {
            if (navigator.app && navigator.app.exitApp) {
                navigator.app.exitApp();
            } else if (navigator.exitApp) {
                navigator.exitApp();
            } else {
                navigator.history.back();
            }
        } else {
            window.history.back();
        }
    }, false);
}, false);


/* ==========================================
   ZOOM
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (document.body.dataset.zoom !== "true") return;

    const zoom = document.createElement("div");

    zoom.className = "zoom-container";

    zoom.innerHTML = `

        <button id="zoomToggle" class="zoom-btn">🔍</button>

        <div id="zoomControls" class="zoom-controls">

            <button id="zoomIn">+</button>

            <button id="zoomOut">−</button>

        </div>

    `;

    document.body.appendChild(zoom);

    const toggle = document.getElementById("zoomToggle");
    const controls = document.getElementById("zoomControls");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");

    let level = parseInt(localStorage.getItem("zoomLevel")) || 0;
    let hideTimer;

    function updateFontSize() {
        document.documentElement.style.setProperty(
            "--prayer-font-size",
            (17 + level * 2) + "px"
        );
        localStorage.setItem("zoomLevel", level);
    }

    updateFontSize();

    function showControls() {
        controls.classList.add("show");
        toggle.style.display = "none";
        resetTimer();
    }

    function hideControls() {
        controls.classList.remove("show");
        toggle.style.display = "block";
    }

    function resetTimer() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideControls, 5000);
    }

    toggle.addEventListener("click", showControls);

    zoomIn.addEventListener("click", () => {
        if (level < 5) {
            level++;
            updateFontSize();
        }
        resetTimer();
    });

    zoomOut.addEventListener("click", () => {
        if (level > -5) {
            level--;
            updateFontSize();
        }
        resetTimer();
    });

});


/* ==========================================================
   PRAYER LANGUAGE / MYSTERY SWITCHER (JS-ONLY FIX)
========================================================== */

function showPrayer(language, button) {
    const card = button.closest(".prayer-card");
    if (!card) return;

    // Detect if the user selected 'latino' or 'italiano'
    const isLatino = language.includes("latino");
    const targetLang = isLatino ? "latino" : "italiano";

    // Loop through every language block inside the card (both Angelus and Regina Coeli)
    card.querySelectorAll(".prayer-language").forEach(section => {
        if (section.id.includes(targetLang)) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }
    });

    // Keep the language buttons synced across both slides
    card.querySelectorAll(".language-menu button").forEach(btn => {
        const btnLang = btn.textContent.trim().toLowerCase();
        if (btnLang === targetLang) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}




/* ==========================================================
   SLIDER PROGRESS
   ALL INTENTIONS SLIDERS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const sliders = document.querySelectorAll(".intentions-slider");

    sliders.forEach(slider => {

        const card = slider.closest(".prayer-card");
        if (!card) return;

        const progress = card.querySelector(
            ".angelus-progress, .litany-progress"
        );

        if (!progress) return;

        const dots = progress.querySelectorAll("span");
        if (!dots.length) return;

        function updateDots() {
            const index = Math.round(
                slider.scrollLeft / slider.clientWidth
            );

            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
        }

        slider.addEventListener("scroll", () => {
            requestAnimationFrame(updateDots);
        });

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                slider.scrollTo({
                    left: i * slider.clientWidth,
                    behavior: "smooth"
                });
            });
        });

        updateDots();

    });

});



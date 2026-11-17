document.addEventListener("DOMContentLoaded", function () {
    // Target the wrapper menu if it exists, otherwise fall back to the standalone button
    const targetEl = document.getElementById("floatingMusicMenu") || document.getElementById("openTuner");
    const tunerLink = document.getElementById("openTuner");
    if (!targetEl) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

    function getPointerPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
        const pos = getPointerPos(e);
        const rect = targetEl.getBoundingClientRect();

        // Switch positioning mode to absolute top/left on first drag
        if (!targetEl.style.top) {
            targetEl.style.top = rect.top + "px";
            targetEl.style.left = rect.left + "px";
            targetEl.style.bottom = "auto";
            targetEl.style.right = "auto";
        }

        startX = pos.x;
        startY = pos.y;
        initialLeft = parseFloat(targetEl.style.left) || rect.left;
        initialTop = parseFloat(targetEl.style.top) || rect.top;
        isDragging = true;
        hasMoved = false;

        document.addEventListener("mousemove", onMove, { passive: false });
        document.addEventListener("mouseup", onEnd);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onEnd);
    }

    function onMove(e) {
        if (!isDragging) return;

        const pos = getPointerPos(e);
        const deltaX = pos.x - startX;
        const deltaY = pos.y - startY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved = true;
            e.preventDefault(); // Stop scrolling on touch drag
        }

        if (!hasMoved) return;

        const rect = targetEl.getBoundingClientRect();
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        // Keep within viewport bounds
        const maxLeft = window.innerWidth - rect.width;
        const maxTop = window.innerHeight - rect.height;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        targetEl.style.left = newLeft + "px";
        targetEl.style.top = newTop + "px";
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;

        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
    }

    // Prevent navigation if the user was dragging rather than clicking
    if (tunerLink) {
        tunerLink.addEventListener("click", function (e) {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    targetEl.addEventListener("mousedown", onStart);
    targetEl.addEventListener("touchstart", onStart, { passive: false });
});
// nav-and-modal.js
// 漢堡選單功能
document.getElementById("hamburger").addEventListener("click", function() {
    this.classList.toggle("active");
    const navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("show");
});

// 模態框功能
document.addEventListener("DOMContentLoaded", function() {
    const aboutModal = document.getElementById("aboutModal");
    const controlsModal = document.getElementById("controlsModal");
    const legalsModal = document.getElementById("legalsModal");

    const closeAboutModal = document.getElementById("closeAboutModal");
    const closeControlsModal = document.getElementById("closeControlsModal");
    const closeLegalsModal = document.getElementById("closeLegalsModal");

    function hideAllModals() {
        aboutModal.style.display = "none";
        controlsModal.style.display = "none";
        legalsModal.style.display = "none";
    }

    document.getElementById("aboutLink").addEventListener("click", function(event) {
        event.preventDefault();
        hideAllModals();
        aboutModal.style.display = "block";
    });

    document.getElementById("controlsLink").addEventListener("click", function(event) {
        event.preventDefault();
        hideAllModals();
        controlsModal.style.display = "block";
    });

    document.getElementById("legalsLink").addEventListener("click", function(event) {
        event.preventDefault();
        hideAllModals();
        legalsModal.style.display = "block";
    });

    closeAboutModal.onclick = function() {
        aboutModal.style.display = "none";
    };

    closeControlsModal.onclick = function() {
        controlsModal.style.display = "none";
    };

    closeLegalsModal.onclick = function() {
        legalsModal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == aboutModal) {
            aboutModal.style.display = "none";
        }
        if (event.target == controlsModal) {
            controlsModal.style.display = "none";
        }
        if (event.target == legalsModal) {
            legalsModal.style.display = "none";
        }
    };
});
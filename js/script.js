/* =========================================
   BURGER KING® MALAYSIA — JAVASCRIPT
   Assignment Draft | UiTM Kedah
   ========================================= */

// ============================================
// 1. DOM READY — Run all initializations
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initDesktopDropdown();
    initCarousel();
    initLocationForm();
});

// ============================================
// 2. MOBILE NAVIGATION
// ============================================
function initMobileNav() {
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileNav     = document.getElementById('mobileNav');
    var mobileNavContent = document.getElementById('mobileNavContent');
    var overlay       = mobileNav ? mobileNav.querySelector('.overlay') : null;
    var mobileMore    = document.getElementById('MobileMore');
    var mobileSubMenu = document.getElementById('mobileSubMenu');

    // Open mobile nav
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            openMobileNav();
        });
    }

    // Close when overlay is clicked
    if (overlay) {
        overlay.addEventListener('click', function () {
            closeMobileNav();
        });
    }

    // Toggle sub-menu for "More"
    if (mobileMore) {
        mobileMore.addEventListener('click', function (e) {
            e.preventDefault();
            if (mobileSubMenu) {
                mobileSubMenu.classList.toggle('open');
            }
        });
    }

    function openMobileNav() {
        if (mobileNav) mobileNav.classList.add('active');
        setTimeout(function () {
            if (mobileNavContent) mobileNavContent.classList.add('show');
        }, 50);
        document.body.classList.add('lock-body');
    }

    function closeMobileNav() {
        if (mobileNavContent) mobileNavContent.classList.remove('show');
        setTimeout(function () {
            if (mobileNav) mobileNav.classList.remove('active');
        }, 300);
        document.body.classList.remove('lock-body');
    }

    // Close nav if a link inside is clicked
    if (mobileNavContent) {
        var navLinks = mobileNavContent.querySelectorAll('a[href^="#"]');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                closeMobileNav();
            });
        });
    }
}

// ============================================
// 3. DESKTOP "MORE" DROPDOWN
// ============================================
function initDesktopDropdown() {
    var moreBtn      = document.getElementById('moreMenuBtn');
    var moreDropdown = document.getElementById('moreDropdown');

    if (!moreBtn || !moreDropdown) return;

    // Toggle dropdown on button click
    moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = moreDropdown.style.display === 'block';
        moreDropdown.style.display = isOpen ? 'none' : 'block';
        moreBtn.setAttribute('aria-expanded', !isOpen);
        moreBtn.classList.toggle('active', !isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        moreDropdown.style.display = 'none';
        moreBtn.setAttribute('aria-expanded', 'false');
        moreBtn.classList.remove('active');
    });

    // Prevent close when clicking inside dropdown
    moreDropdown.addEventListener('click', function (e) {
        e.stopPropagation();
    });
}

// ============================================
// 4. HERO CAROUSEL
// ============================================
function initCarousel() {
    var carousel  = document.getElementById('heroCarousel');
    if (!carousel) return;

    var items     = carousel.querySelectorAll('.carousel-item');
    var dots      = document.querySelectorAll('.dot');
    var prevBtn   = document.getElementById('prevBtn');
    var nextBtn   = document.getElementById('nextBtn');
    var current   = 0;
    var total     = items.length;
    var autoTimer = null;

    if (total === 0) return;

    // Show the slide at given index
    function goToSlide(index) {
        items[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');

        current = (index + total) % total;

        items[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
    }

    // Auto-advance every 4 seconds
    function startAuto() {
        autoTimer = setInterval(function () {
            goToSlide(current + 1);
        }, 4000);
    }

    function stopAuto() {
        clearInterval(autoTimer);
    }

    // Button controls
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            stopAuto();
            goToSlide(current - 1);
            startAuto();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            stopAuto();
            goToSlide(current + 1);
            startAuto();
        });
    }

    // Dot controls
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            stopAuto();
            goToSlide(index);
            startAuto();
        });
    });

    // Start the carousel
    startAuto();
}

// ============================================
// 5. LOCATION / RESTAURANT SEARCH FORM
// ============================================
function initLocationForm() {
    var form  = document.getElementById('locationForm');
    var input = form ? form.querySelector('.map-input') : null;

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var query = input ? input.value.trim() : '';

        if (!query) {
            alert('Please enter an address, city, or postcode to search.');
            return;
        }

        // Simulated search — in production this would call a real locator API or page
        var mapPlaceholder = document.getElementById('homeMap');
        if (mapPlaceholder) {
            mapPlaceholder.querySelector('p').textContent = 'Searching for: ' + query;
            mapPlaceholder.querySelector('span').textContent = 'Results near UiTM Kedah';
        }

        console.log('Location search submitted:', query);
    });
}

// ============================================
// 6. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            var headerHeight = 64; // desktop header height in px
            var offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    });
});

// ============================================
// 7. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
// ============================================
(function () {
    var sections = document.querySelectorAll('section[id], footer[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function () {
        var scrollPos = window.scrollY + 80;

        sections.forEach(function (section) {
            var top    = section.offsetTop;
            var bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active-nav');
                    if (link.getAttribute('href') === '#' + section.id) {
                        link.classList.add('active-nav');
                    }
                });
            }
        });
    });
})();
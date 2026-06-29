/* =========================================
   BURGER TOPHAT® — SCRIPT.JS
   Updated with Timeline & Animations
   ========================================= */

// ============================================
// 1. DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initMegaMenu();
    initSplitCarousel();
    initLocationForm();
    initSmoothScroll();
    initScrollHighlight();
    initTimeline();
});

// ============================================
// 2. MOBILE NAVIGATION
// ============================================
function initMobileNav() {
    var mobileMenuBtn    = document.getElementById('mobileMenuBtn');
    var mobileNav        = document.getElementById('mobileNav');
    var mobileNavContent = document.getElementById('mobileNavContent');
    var overlay          = mobileNav ? mobileNav.querySelector('.overlay') : null;

    function openMobileNav() {
        if (mobileNav)        mobileNav.classList.add('active');
        if (mobileNavContent) {
            setTimeout(function () { mobileNavContent.classList.add('show'); }, 20);
        }
        document.body.classList.add('lock-body');
    }

    function closeMobileNav() {
        if (mobileNavContent) mobileNavContent.classList.remove('show');
        setTimeout(function () {
            if (mobileNav) mobileNav.classList.remove('active');
        }, 300);
        document.body.classList.remove('lock-body');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileNav);
    if (overlay)       overlay.addEventListener('click', closeMobileNav);

    // Close when an anchor link inside mobile nav is tapped
    if (mobileNavContent) {
        mobileNavContent.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', closeMobileNav);
        });
    }

    // Mobile accordion sub-menus (Eat / Learn / Love)
    [
        ['mobileEatToggle',   'mobileEatMenu'],
        ['mobileLearnToggle', 'mobileLearnMenu'],
        ['mobileLoveToggle',  'mobileLoveMenu']
    ].forEach(function (pair) {
        var btn   = document.getElementById(pair[0]);
        var panel = document.getElementById(pair[1]);
        if (btn && panel) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                panel.classList.toggle('open');
            });
        }
    });
}

// ============================================
// 3. DESKTOP MEGA MENU
//    mouseenter/mouseleave on each .mega-wrapper
//    drives open/close entirely from JS.
//    A short leave-delay (100 ms) prevents the
//    panel snapping shut during mouse travel from
//    the button down to the panel.
//    Keyboard (Enter / Space / Escape) and backdrop
//    click are also handled here.
// ============================================
function initMegaMenu() {
    var wrappers = document.querySelectorAll('.mega-wrapper');
    var triggers = document.querySelectorAll('.mega-trigger');
    var backdrop = document.getElementById('megaBackdrop');
    var header   = document.getElementById('desktopHeader');

    var LEAVE_DELAY = 100; // ms — tweak if panels close too eagerly

    // ── Helpers ──────────────────────────────────────────────────────
    function openWrapper(wrapper) {
        // Close every other wrapper first (instant)
        wrappers.forEach(function (w) {
            if (w !== wrapper) closeWrapper(w, true);
        });

        clearTimeout(wrapper._leaveTimer);
        wrapper.classList.add('is-open');

        var btn = wrapper.querySelector('.mega-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'true');

        if (backdrop) backdrop.classList.add('active');
        if (header)   header.classList.add('mega-open');
    }

    function closeWrapper(wrapper, instant) {
        clearTimeout(wrapper._leaveTimer);

        function doClose() {
            wrapper.classList.remove('is-open');
            var btn = wrapper.querySelector('.mega-trigger');
            if (btn) btn.setAttribute('aria-expanded', 'false');

            // Hide backdrop + header class only when nothing is open
            var anyOpen = Array.prototype.some.call(wrappers, function (w) {
                return w.classList.contains('is-open');
            });
            if (!anyOpen) {
                if (backdrop) backdrop.classList.remove('active');
                if (header)   header.classList.remove('mega-open');
            }
        }

        if (instant) {
            doClose();
        } else {
            wrapper._leaveTimer = setTimeout(doClose, LEAVE_DELAY);
        }
    }

    function closeAll(instant) {
        wrappers.forEach(function (w) { closeWrapper(w, instant); });
    }

    // ── Mouse events ─────────────────────────────────────────────────
    wrappers.forEach(function (wrapper) {
        wrapper._leaveTimer = null;

        wrapper.addEventListener('mouseenter', function () {
            openWrapper(wrapper);
        });

        wrapper.addEventListener('mouseleave', function () {
            closeWrapper(wrapper, false); // delayed close
        });
    });

    // ── Keyboard: Enter / Space toggle, Escape close ─────────────────
    triggers.forEach(function (btn) {
        btn.addEventListener('keydown', function (e) {
            var wrapper = btn.closest('.mega-wrapper');

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (wrapper.classList.contains('is-open')) {
                    closeWrapper(wrapper, true);
                } else {
                    openWrapper(wrapper);
                }
            }

            if (e.key === 'Escape') {
                closeAll(true);
                btn.blur();
            }
        });
    });

    // ── Backdrop click closes everything ─────────────────────────────
    if (backdrop) {
        backdrop.addEventListener('click', function () {
            closeAll(true);
        });
    }
}

// ============================================
// 4. SPLIT HERO CAROUSEL (McDonald's style)
//    - Dot navigation
//    - Auto-advances every 5 s
//    - Pause / Play button
//    - Pauses on hover
// ============================================
function initSplitCarousel() {
    var slides    = document.querySelectorAll('.hs-slide');
    var dots      = document.querySelectorAll('.hs-dot');
    var pauseBtn  = document.getElementById('hsPauseBtn');
    var iconPause = pauseBtn ? pauseBtn.querySelector('.icon-pause') : null;
    var iconPlay  = pauseBtn ? pauseBtn.querySelector('.icon-play')  : null;
    var section   = document.querySelector('.hero-split');

    if (!slides.length) return;

    var current   = 0;
    var total     = slides.length;
    var paused    = false;
    var timer     = null;
    var INTERVAL  = 5000; // ms between auto-advances

    // ── Go to a specific slide ──────────────────────────────────────
    function goTo(index) {
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');

        current = (index + total) % total;

        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
    }

    // ── Auto-play helpers ───────────────────────────────────────────
    function startAuto() {
        if (timer) clearInterval(timer);
        timer = setInterval(function () {
            if (!paused) goTo(current + 1);
        }, INTERVAL);
    }

    function stopAuto() {
        clearInterval(timer);
        timer = null;
    }

    // ── Pause / Play toggle ─────────────────────────────────────────
    function setPaused(state) {
        paused = state;
        if (pauseBtn) pauseBtn.classList.toggle('paused', paused);
        if (iconPause) iconPause.style.display = paused ? 'none'  : '';
        if (iconPlay)  iconPlay.style.display  = paused ? ''      : 'none';
        pauseBtn && pauseBtn.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', function () {
            setPaused(!paused);
        });
    }

    // ── Pause on hover ──────────────────────────────────────────────
    if (section) {
        section.addEventListener('mouseenter', function () { paused = true;  });
        section.addEventListener('mouseleave', function () { if (!pauseBtn || !pauseBtn.classList.contains('paused')) paused = false; });
    }

    // ── Dot clicks ─────────────────────────────────────────────────
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            goTo(parseInt(this.dataset.slide, 10));
        });
    });

    // ── Kick it off ─────────────────────────────────────────────────
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
        var mapPlaceholder = document.getElementById('homeMap');
        if (mapPlaceholder) {
            mapPlaceholder.querySelector('p').textContent  = 'Searching for: ' + query;
            mapPlaceholder.querySelector('span').textContent = 'Results near UiTM Kedah';
        }
        console.log('Location search submitted:', query);
    });
}

// ============================================
// 6. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var headerHeight = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72',
                    10
                );
                var offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// 7. ACTIVE NAV HIGHLIGHT ON SCROLL
// ============================================
function initScrollHighlight() {
    var sections = document.querySelectorAll('section[id], footer[id]');
    var navBtns  = document.querySelectorAll('.mega-trigger');

    window.addEventListener('scroll', function () {
        var scrollPos = window.scrollY + 100;
        sections.forEach(function (section) {
            var top    = section.offsetTop;
            var bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                // (optional: highlight matching nav trigger by section id)
                navBtns.forEach(function (btn) { btn.classList.remove('scroll-active'); });
            }
        });
    });
}

// ============================================
// 8. TIMELINE SCROLL REVEAL ANIMATION
//    Reveals timeline items as they come
//    into view with fade-in & slide effects
// ============================================
function initTimeline() {
    var timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length === 0) return;

    // ── Intersection Observer for reveal animation ──────────────────
    var observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                // Item is in view — trigger animation
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all timeline items
    timelineItems.forEach(function (item) {
        observer.observe(item);
    });

    // ── Timeline item hover interaction ─────────────────────────────
    timelineItems.forEach(function (item, index) {
        item.addEventListener('mouseenter', function () {
            // Add subtle animation on hover
            var dot = item.querySelector('.timeline-dot');
            if (dot) {
                dot.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }
        });
    });

    console.log('Timeline initialized with ' + timelineItems.length + ' items');
}
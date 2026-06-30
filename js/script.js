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
    initMenuDetailsModal();
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

// ============================================
// 9. MENU DETAILS MODAL
//    Opens modal with food item details
// ============================================
function initMenuDetailsModal() {
    var modal = document.getElementById('detailsModal');
    var closeBtn = document.getElementById('modalClose');
    var backdrop = modal ? modal.querySelector('.modal-backdrop') : null;
    var seeDetailsButtons = document.querySelectorAll('.see-details-btn');

    // Food item data
    var foodData = {
        france: {
            title: 'France Burger',
            description: 'Celebrate the French spirit with our signature beef patty topped with crispy fries and ice-cold Pepsi. A classic combination that never fails!',
            price: 'RM 16.90',
            ingredients: 'Beef patty, Crispy fries, Pepsi, Cheese, Fresh lettuce',
            prepTime: '5-7 minutes'
        },
        germany: {
            title: 'Germany Burger',
            description: 'Go big or go home! Our premium double beef patty paired with golden fries and Coca-Cola. Perfect for those with serious appetites.',
            price: 'RM 19.90',
            ingredients: 'Double beef patty, Crispy fries, Coca-Cola, Aged cheddar, Tomato, Pickles',
            prepTime: '6-8 minutes'
        },
        zinger: {
            title: 'Zinger Deluxe',
            description: 'Crispy chicken strips meet premium beef in this ultimate deluxe combo. Paired with golden fries and ice-cold Coke for the perfect meal.',
            price: 'RM 18.90',
            ingredients: 'Beef patty, 3 crispy chicken strips, Golden fries, Coca-Cola, Cheese',
            prepTime: '5-7 minutes'
        },
        mega: {
            title: 'Mega Deluxe',
            description: 'The ultimate feast! Double the chicken, double the satisfaction. Our Mega Deluxe comes packed with 6 crispy strips, premium fries, and 2 Cokes.',
            price: 'RM 28.90',
            ingredients: 'Beef patty, 6 crispy chicken strips, Loaded fries, 2x Coca-Cola, Aged cheddar, Special sauce',
            prepTime: '6-8 minutes'
        },
        tophat: {
            title: 'TopHat Deluxe',
            description: 'Our signature burger that started it all. Premium beef patty with our secret blend, crispy fries, and ice-cold Coke. Pure TopHat magic!',
            price: 'RM 19.90',
            ingredients: 'Signature beef patty, Crispy fries, Coca-Cola, TopHat secret sauce, Fresh toppings',
            prepTime: '5-7 minutes'
        },
        double: {
            title: 'TopHat Double Deluxe',
            description: 'Double the patties, double the flavour! Our premium double beef creation loaded with golden fries and refreshing Coke.',
            price: 'RM 23.90',
            ingredients: 'Double beef patty, Loaded crispy fries, Coca-Cola, Premium cheddar, Caramelized onions, Special sauce',
            prepTime: '7-9 minutes'
        },

        // ── Classic Deluxe ──
        classicbeef: {
            title: 'Classic Beef Deluxe',
            description: 'A BTH classic done right — single flame-grilled beef patty with fresh lettuce, tomato, and our signature sauce.',
            price: 'RM 13.90',
            ingredients: 'Flame-grilled beef patty, Fresh lettuce, Tomato, Signature sauce, Sesame bun',
            prepTime: '4-6 minutes'
        },
        doublebeef: {
            title: 'Double Beef Deluxe',
            description: 'Twice the beef, twice the satisfaction. Double stacked flame-grilled patties with melted cheese and special sauce.',
            price: 'RM 17.90',
            ingredients: 'Double beef patty, Melted cheese, Fresh lettuce, Special sauce, Sesame bun',
            prepTime: '5-7 minutes'
        },
        classicchicken: {
            title: 'Classic Chicken Deluxe',
            description: 'Golden crispy chicken fillet layered with cheese, fresh lettuce, and sweet honey mustard.',
            price: 'RM 13.90',
            ingredients: 'Crispy chicken fillet, Cheese, Fresh lettuce, Honey mustard, Sesame bun',
            prepTime: '5-7 minutes'
        },
        doublechicken: {
            title: 'Double Chicken Deluxe',
            description: 'Two crispy chicken fillets stacked with smoky bacon, cheese, and our smoky house sauce.',
            price: 'RM 18.90',
            ingredients: 'Double crispy chicken fillet, Bacon, Cheese, Smoky sauce, Sesame bun',
            prepTime: '6-8 minutes'
        },

        // ── Fish O' Flip ──
        classicfih: {
            title: 'Classic FiH',
            description: 'Our signature crispy battered fish fillet, golden-fried and served with a side of fries.',
            price: 'RM 12.90',
            ingredients: 'Crispy battered fish fillet, Crispy fries, Fresh lettuce, Sesame bun',
            prepTime: '5-7 minutes'
        },
        wombocombofih: {
            title: 'Wombo Combo FiH',
            description: 'A fish fillet feast — crispy battered fish, golden fries, and creamy tartar sauce in every bite.',
            price: 'RM 15.90',
            ingredients: 'Crispy battered fish fillet, Crispy fries, Tartar sauce, Fresh lettuce, Sesame bun',
            prepTime: '6-8 minutes'
        },
        cheesefih: {
            title: 'Cheese FiH',
            description: 'Crispy fish fillet topped with melted cheese, fries on the side, and both pesto and tartar sauce.',
            price: 'RM 16.90',
            ingredients: 'Crispy battered fish fillet, Melted cheese, Crispy fries, Pesto sauce, Tartar sauce, Sesame bun',
            prepTime: '6-8 minutes'
        },
        fihdouble: {
            title: 'Double FiH',
            description: 'Double the fish, double the crunch! Two crispy fillets with loaded fries and tartar sauce.',
            price: 'RM 19.90',
            ingredients: 'Double crispy battered fish fillet, Loaded fries, Tartar sauce, Fresh lettuce, Sesame bun',
            prepTime: '7-9 minutes'
        },

        // ── Dessert ──
        sundaecoklat: {
            title: 'Sundae Coklat',
            description: 'Creamy soft serve generously drizzled with rich, velvety chocolate sauce.',
            price: 'RM 7.90',
            ingredients: 'Vanilla soft serve, Chocolate sauce',
            prepTime: '2-3 minutes'
        },
        classicsundae: {
            title: 'Classic Sundae',
            description: 'Smooth vanilla soft serve topped with fluffy whipped cream and a classic cherry.',
            price: 'RM 8.90',
            ingredients: 'Vanilla soft serve, Whipped cream, Cherry topping',
            prepTime: '2-3 minutes'
        },
        strawberrysundae: {
            title: 'Strawberry Sundae',
            description: 'Creamy soft serve paired with sweet strawberry topping and fresh cream.',
            price: 'RM 7.90',
            ingredients: 'Vanilla soft serve, Strawberry topping, Whipped cream',
            prepTime: '2-3 minutes'
        },
        vanillasoftserve: {
            title: 'Vanilla Soft Serve',
            description: 'Our classic smooth and creamy vanilla soft serve, served simple in a cup.',
            price: 'RM 5.90',
            ingredients: 'Vanilla soft serve',
            prepTime: '1-2 minutes'
        },

        // ── Drinks ──
        pepsi: {
            title: 'Pepsi',
            description: 'Bold, refreshing, and ice-cold — the classic Pepsi cola to wash down your meal.',
            price: 'RM 4.90',
            ingredients: 'Pepsi cola, Ice',
            prepTime: '1 minute'
        },
        cola: {
            title: 'Coca-Cola',
            description: 'The original ice-cold Coca-Cola classic, served chilled to perfection.',
            price: 'RM 4.90',
            ingredients: 'Coca-Cola, Ice',
            prepTime: '1 minute'
        },
        evian: {
            title: 'Evian Mineral Water',
            description: 'Pure, refreshing natural mineral water sourced from the French Alps.',
            price: 'RM 5.90',
            ingredients: 'Natural mineral water',
            prepTime: '1 minute'
        }
    };

    // Open modal function
    function openModal(itemKey) {
        var data = foodData[itemKey];
        if (!data || !modal) return;

        // Get image from data-item attribute
        var imageMap = {
            france: 'images/france.png',
            germany: 'images/german.png',
            zinger: 'images/zingerdeluxe.png',
            mega: 'images/megadeluxe.png',
            tophat: 'images/tophat_deluxe.png',
            double: 'images/tophat_double_deluxe.png',
            classicbeef: 'images/beef.png',
            doublebeef: 'images/beef_double.png',
            classicchicken: 'images/chicken.png',
            doublechicken: 'images/chicken_double.png',
            classicfih: 'images/classicfih.png',
            wombocombofih: 'images/wombocombofih.png',
            cheesefih: 'images/cheesefih.png',
            fihdouble: 'images/fihdouble.png',
            sundaecoklat: 'images/sundae_coklat.png',
            classicsundae: 'images/sundae.png',
            strawberrysundae: 'images/strawberry.png',
            vanillasoftserve: 'images/vanilla.png',
            pepsi: 'images/pepsi.png',
            cola: 'images/cola.png',
            evian: 'images/evian.png'
        };

        // Populate modal
        document.getElementById('modalImage').src = imageMap[itemKey];
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDesc').textContent = data.description;
        document.getElementById('modalPrice').textContent = data.price;
        document.getElementById('modalIngredients').textContent = data.ingredients;
        document.getElementById('modalPrepTime').textContent = data.prepTime;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal function
    function closeModal() {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Add click listeners to "See Details" buttons
    seeDetailsButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var itemKey = this.getAttribute('data-item');
            openModal(itemKey);
        });
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }

    // Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

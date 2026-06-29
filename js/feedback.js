// ============================================================
//  FEEDBACK SCRIPT — BURGER TopHat®
//  Depends on: Firebase compat SDK (app + auth + database)
// ============================================================

// ──────────────────────────────────────────────
// Firebase config (same project as forum)
// ──────────────────────────────────────────────
var firebaseConfig = {
    apiKey: "AIzaSyDFc4b0o0wOJpRxDFtPfIl4Ca421spY9Fc",
    authDomain: "tophatburger-a688b.firebaseapp.com",
    projectId: "tophatburger-a688b",
    storageBucket: "tophatburger-a688b.firebasestorage.app",
    messagingSenderId: "1085548544337",
    appId: "1:1085548544337:web:a6b05bb432fa0f8bb61370",
    measurementId: "G-Q8Q4BWCDXF",
    databaseURL: "https://tophatburger-a688b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Guard: only init once (script.js may also init)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

var auth         = firebase.auth();
var db           = firebase.database();
var reviewsRef   = db.ref('feedback/reviews');

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
var currentUser   = null;
var currentFilter = 'all';
var currentSort   = 'new';
var allReviews    = {};
var selectedRating = 0;

var ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

// ──────────────────────────────────────────────
// Auth state observer
// ──────────────────────────────────────────────
auth.onAuthStateChanged(function (user) {
    currentUser = user;

    var gate    = document.getElementById('fbAuthGate');
    var form    = document.getElementById('fbForm');
    var nameEl  = document.getElementById('fbUserName');

    if (user) {
        gate.style.display = 'none';
        form.style.display = 'block';
        if (nameEl) nameEl.textContent = getUserDisplayName(user);
        closeAuthModal();
        showToast('Signed in as ' + getUserDisplayName(user));
    } else {
        gate.style.display = 'block';
        form.style.display = 'none';
    }
});

function getUserDisplayName(user) {
    if (user.displayName) return user.displayName;
    return user.email ? user.email.split('@')[0] : 'Customer';
}

// ──────────────────────────────────────────────
// Auth modal
// ──────────────────────────────────────────────
function openAuthModal(tab) {
    switchAuthTab(tab || 'login');
    document.getElementById('authOverlay').classList.add('open');
}

function closeAuthModal(e) {
    if (e && e.target !== document.getElementById('authOverlay')) return;
    document.getElementById('authOverlay').classList.remove('open');
    clearAuthErrors();
}

function switchAuthTab(tab) {
    var isLogin = (tab === 'login');
    document.getElementById('authPanelLogin').style.display    = isLogin ? 'block' : 'none';
    document.getElementById('authPanelRegister').style.display = isLogin ? 'none'  : 'block';
    document.getElementById('tabLogin').classList.toggle('active',    isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    clearAuthErrors();
}

function clearAuthErrors() {
    ['loginError', 'regError'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) { el.textContent = ''; el.classList.remove('visible'); }
    });
}

function showAuthError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAuthModal();
});

// ──────────────────────────────────────────────
// Register
// ──────────────────────────────────────────────
function doRegister() {
    var username = document.getElementById('regUsername').value.trim();
    var email    = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;

    if (!username) { showAuthError('regError', 'Choose a display name.'); return; }
    if (!email)    { showAuthError('regError', 'Enter your email.');       return; }
    if (password.length < 6) { showAuthError('regError', 'Password must be at least 6 characters.'); return; }

    var btn = document.getElementById('regBtn');
    btn.disabled = true;
    btn.textContent = 'Creating\u2026';

    auth.createUserWithEmailAndPassword(email, password)
        .then(function (cred) {
            return cred.user.updateProfile({ displayName: username });
        })
        .then(function () {
            var uid = auth.currentUser.uid;
            return db.ref('users/' + uid).set({
                username: username,
                email: email,
                joinedAt: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .catch(function (err) {
            showAuthError('regError', friendlyAuthError(err.code));
            btn.disabled = false;
            btn.textContent = 'Create Account';
        });
}

// ──────────────────────────────────────────────
// Login
// ──────────────────────────────────────────────
function doLogin() {
    var email    = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;

    if (!email)    { showAuthError('loginError', 'Enter your email.');    return; }
    if (!password) { showAuthError('loginError', 'Enter your password.'); return; }

    var btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in\u2026';

    auth.signInWithEmailAndPassword(email, password)
        .catch(function (err) {
            showAuthError('loginError', friendlyAuthError(err.code));
            btn.disabled = false;
            btn.textContent = 'Sign In';
        });
}

function signOut() {
    auth.signOut().then(function () { showToast('Signed out.'); });
}

function friendlyAuthError(code) {
    var map = {
        'auth/email-already-in-use':   'That email is already registered.',
        'auth/invalid-email':          'That email address is invalid.',
        'auth/weak-password':          'Password is too weak.',
        'auth/user-not-found':         'No account found with that email.',
        'auth/wrong-password':         'Incorrect password.',
        'auth/invalid-credential':     'Incorrect email or password.',
        'auth/too-many-requests':      'Too many attempts. Try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.'
    };
    return map[code] || 'Something went wrong. Please try again.';
}

// ──────────────────────────────────────────────
// Star rating
// ──────────────────────────────────────────────
function setRating(val) {
    selectedRating = val;
    var stars = document.querySelectorAll('.fb-star');
    stars.forEach(function (s, i) {
        s.classList.toggle('lit', i < val);
    });
    var label = document.getElementById('ratingLabel');
    if (label) label.textContent = ratingLabels[val] || '';
}

// Hover preview
document.addEventListener('DOMContentLoaded', function () {
    var stars = document.querySelectorAll('.fb-star');
    stars.forEach(function (star) {
        star.addEventListener('mouseenter', function () {
            var hoverVal = parseInt(star.getAttribute('data-val'));
            stars.forEach(function (s, i) {
                s.classList.toggle('lit', i < hoverVal);
            });
        });
        star.addEventListener('mouseleave', function () {
            stars.forEach(function (s, i) {
                s.classList.toggle('lit', i < selectedRating);
            });
        });
    });

    // Char counter
    var bodyEl = document.getElementById('fbBody');
    if (bodyEl) {
        bodyEl.addEventListener('input', function () {
            var el = document.getElementById('fbCharCount');
            if (el) el.textContent = bodyEl.value.length + ' / 1000';
        });
    }

    // Slider gradient update on load
    ['slFood','slService','slClean','slValue'].forEach(function (id) {
        var sl = document.getElementById(id);
        if (sl) updateSliderGradient(sl);
    });
});

// ──────────────────────────────────────────────
// Slider label + gradient update
// ──────────────────────────────────────────────
function updateSliderLabel(sliderId, labelId) {
    var sl = document.getElementById(sliderId);
    var lb = document.getElementById(labelId);
    if (!sl || !lb) return;
    lb.textContent = sl.value + '/5';
    updateSliderGradient(sl);
}

function updateSliderGradient(sl) {
    var pct = ((sl.value - sl.min) / (sl.max - sl.min)) * 100;
    sl.style.background = 'linear-gradient(to right, var(--bk-red) 0%, var(--bk-red) ' +
        pct + '%, #ddd ' + pct + '%)';
}

// ──────────────────────────────────────────────
// Chip selector (single-select within a group)
// ──────────────────────────────────────────────
function selectChip(btn, groupId) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.fb-chip').forEach(function (c) { c.classList.remove('active'); });
    btn.classList.add('active');
}

// ──────────────────────────────────────────────
// Submit feedback
// ──────────────────────────────────────────────
function submitFeedback() {
    if (!currentUser) { openAuthModal('login'); return; }

    var errorEl = document.getElementById('fbError');

    // Gather values
    var visitType  = getActiveChip('visitTypeGroup');
    var title      = (document.getElementById('fbTitle').value || '').trim();
    var body       = (document.getElementById('fbBody').value  || '').trim();
    var recommend  = getActiveChip('recommendGroup');
    var food       = parseInt(document.getElementById('slFood').value);
    var service    = parseInt(document.getElementById('slService').value);
    var clean      = parseInt(document.getElementById('slClean').value);
    var value      = parseInt(document.getElementById('slValue').value);

    // Validation
    if (!selectedRating) { showError(errorEl, 'Please give an overall star rating.'); return; }
    if (!title)           { showError(errorEl, 'Please add a review title.');          return; }
    if (!body)            { showError(errorEl, 'Please write your review.');           return; }

    errorEl.textContent = '';

    var btn = document.getElementById('fbSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting\u2026';

    var review = {
        author:    getUserDisplayName(currentUser),
        uid:       currentUser.uid,
        visitType: visitType,
        rating:    selectedRating,
        title:     title,
        body:      body,
        recommend: recommend,
        food:      food,
        service:   service,
        clean:     clean,
        value:     value,
        helpful:   0,
        ts:        firebase.database.ServerValue.TIMESTAMP
    };

    reviewsRef.push(review, function (err) {
        btn.disabled = false;
        btn.textContent = 'Submit Feedback';

        if (err) {
            showError(errorEl, 'Failed to submit. Please try again.');
        } else {
            showToast('Thanks for your feedback, ' + getUserDisplayName(currentUser) + '!');
            resetForm();
        }
    });
}

function getActiveChip(groupId) {
    var group = document.getElementById(groupId);
    if (!group) return '';
    var active = group.querySelector('.fb-chip.active');
    return active ? active.getAttribute('data-value') : '';
}

function showError(el, msg) {
    if (el) el.textContent = msg;
}

function resetForm() {
    document.getElementById('fbTitle').value = '';
    document.getElementById('fbBody').value  = '';
    document.getElementById('fbCharCount').textContent = '0 / 1000';
    setRating(0);

    ['slFood','slService','slClean','slValue'].forEach(function (id) {
        var sl = document.getElementById(id);
        if (sl) { sl.value = 3; updateSliderGradient(sl); }
    });
    var labels = { slFood:'slFoodVal', slService:'slServiceVal', slClean:'slCleanVal', slValue:'slValueVal' };
    Object.keys(labels).forEach(function (k) { updateSliderLabel(k, labels[k]); });

    // Reset chips to defaults
    resetChipGroup('visitTypeGroup', 'dine-in');
    resetChipGroup('recommendGroup', 'yes');
}

function resetChipGroup(groupId, defaultVal) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.fb-chip').forEach(function (c) {
        c.classList.toggle('active', c.getAttribute('data-value') === defaultVal);
    });
}

// ──────────────────────────────────────────────
// Load & render reviews (real-time)
// ──────────────────────────────────────────────
reviewsRef.on('value', function (snap) {
    allReviews = snap.val() || {};
    updateStats();
    renderReviews();
});

function updateStats() {
    var entries = Object.values(allReviews);
    var total   = entries.length;
    var avg     = total ? (entries.reduce(function (s, r) { return s + (r.rating || 0); }, 0) / total) : 0;

    var oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    var recent  = entries.filter(function (r) { return (r.ts || 0) > oneWeekAgo; }).length;

    setText('statTotal',  total || '0');
    setText('statAvg',    total ? avg.toFixed(1) + ' ★' : '—');
    setText('statRecent', recent || '0');
}

function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

function setSort(sort, btn) {
    currentSort = sort;
    document.querySelectorAll('.fb-sort-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderReviews();
}

function filterFeed(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.fb-filter-pill').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderReviews();
}

function renderReviews() {
    var container = document.getElementById('fbReviews');
    if (!container) return;

    var entries = Object.keys(allReviews).map(function (k) {
        return { id: k, data: allReviews[k] };
    });

    // Filter
    if (currentFilter !== 'all') {
        entries = entries.filter(function (e) { return e.data.visitType === currentFilter; });
    }

    // Sort
    if (currentSort === 'top') {
        entries.sort(function (a, b) { return (b.data.rating || 0) - (a.data.rating || 0); });
    } else {
        entries.sort(function (a, b) { return (b.data.ts || 0) - (a.data.ts || 0); });
    }

    if (!entries.length) {
        container.innerHTML =
            '<div class="fb-empty">' +
                '<div class="fb-empty-icon">🍔</div>' +
                '<p>No reviews yet' + (currentFilter !== 'all' ? ' for this category' : '') + '. Be the first to share your experience!</p>' +
            '</div>';
        return;
    }

    var html = '';
    entries.forEach(function (e) { html += buildReviewCard(e.id, e.data); });
    container.innerHTML = html;
}

// ──────────────────────────────────────────────
// Build review card HTML
// ──────────────────────────────────────────────
var visitLabels = {
    'dine-in':   'Dine In',
    'takeaway':  'Takeaway',
    'delivery':  'Delivery',
    'drive-thru':'Drive-Thru'
};

function buildReviewCard(id, r) {
    var stars    = buildStars(r.rating || 0);
    var badge    = visitLabels[r.visitType] || r.visitType || 'Visit';
    var timeStr  = formatTime(r.ts);
    var recYes   = r.recommend === 'yes';

    return (
        '<div class="fb-review-card" id="review-' + id + '">' +

            '<div class="fb-review-top">' +
                '<div>' +
                    '<div class="fb-review-stars">' + stars + '</div>' +
                '</div>' +
                '<span class="fb-review-badge">' + escHtml(badge) + '</span>' +
            '</div>' +

            '<p class="fb-review-title">' + escHtml(r.title || '(No title)') + '</p>' +
            '<p class="fb-review-body">'  + escHtml(r.body  || '') + '</p>' +

            buildSubRatings(r) +

            '<div class="fb-review-footer">' +
                '<span class="fb-review-meta">' +
                    'by <strong>' + escHtml(r.author || 'Anonymous') + '</strong>' +
                    ' &middot; ' + escHtml(timeStr) +
                '</span>' +
                '<span class="fb-recommend-badge ' + (recYes ? 'yes' : 'no') + '">' +
                    (recYes ? '👍 Recommends' : '👎 Doesn\'t recommend') +
                '</span>' +
                '<div class="fb-helpful">' +
                    '<button class="fb-helpful-btn" onclick="markHelpful(\'' + id + '\')">👍 Helpful (' + (r.helpful || 0) + ')</button>' +
                '</div>' +
            '</div>' +

        '</div>'
    );
}

function buildStars(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
        html += '<span class="' + (i <= rating ? '' : 'empty') + '">★</span>';
    }
    return html;
}

function buildSubRatings(r) {
    var cats = [
        { label: 'Food',        val: r.food    || 0 },
        { label: 'Service',     val: r.service || 0 },
        { label: 'Cleanliness', val: r.clean   || 0 },
        { label: 'Value',       val: r.value   || 0 }
    ];
    var html = '<div class="fb-sub-ratings">';
    cats.forEach(function (c) {
        var pct = (c.val / 5) * 100;
        html +=
            '<div class="fb-sub-row">' +
                '<span class="fb-sub-name">' + escHtml(c.label) + '</span>' +
                '<div class="fb-sub-bar-wrap"><div class="fb-sub-bar-fill" style="width:' + pct + '%"></div></div>' +
                '<span class="fb-sub-num">' + c.val + '</span>' +
            '</div>';
    });
    return html + '</div>';
}

// ──────────────────────────────────────────────
// Mark helpful
// ──────────────────────────────────────────────
function markHelpful(id) {
    if (!currentUser) { openAuthModal('login'); return; }
    db.ref('feedback/reviews/' + id + '/helpful').transaction(function (cur) {
        return (cur || 0) + 1;
    });
}

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTime(ts) {
    if (!ts) return '';
    var diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    var d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(msg) {
    var t = document.getElementById('fb-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3200);
}

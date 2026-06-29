/* =========================================
   BURGER TOPHAT® — SEASON.JS
   Football confetti animation + countdowns
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
    initFootballConfetti();
    initCountdowns();
    initTimelinePulse();
});

/* ── 1. FALLING FOOTBALL CONFETTI ── */
function initFootballConfetti() {
    var canvas = document.getElementById('footballCanvas');
    if (!canvas) return;

    var ctx   = canvas.getContext('2d');
    var BALLS = [];
    var COUNT = 22;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Ball() { this.reset(true); }

    Ball.prototype.reset = function (initial) {
        this.x       = Math.random() * canvas.width;
        this.y       = initial ? Math.random() * -canvas.height : -40;
        this.size    = 18 + Math.random() * 22;
        this.speed   = 0.6 + Math.random() * 1.2;
        this.drift   = (Math.random() - 0.5) * 0.6;
        this.rot     = Math.random() * Math.PI * 2;
        this.spin    = (Math.random() - 0.5) * 0.04;
        this.opacity = 0.15 + Math.random() * 0.35;
    };

    Ball.prototype.update = function () {
        this.y   += this.speed;
        this.x   += this.drift;
        this.rot += this.spin;
        if (this.y > canvas.height + 60) this.reset(false);
    };

    Ball.prototype.draw = function () {
        ctx.save();
        ctx.globalAlpha    = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.font           = this.size + 'px serif';
        ctx.textAlign      = 'center';
        ctx.textBaseline   = 'middle';
        ctx.fillText('⚽', 0, 0);
        ctx.restore();
    };

    for (var i = 0; i < COUNT; i++) { BALLS.push(new Ball()); }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        BALLS.forEach(function (b) { b.update(); b.draw(); });
        requestAnimationFrame(loop);
    }
    loop();
}

/* ── 2. COUNTDOWN TIMERS ── */
function initCountdowns() {
    /* 
       Hero countdown  → August 2026 (Summer Menu) 
       Banner countdown → end of July 2026 (Football Menu ends)
    */
    var targets = {
        'cd-hero':   new Date('2026-08-01T00:00:00'),
        'cd-banner': new Date('2026-08-01T00:00:00')
    };

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function updateCountdown(containerId, target) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var now  = new Date();
        var diff = target - now;
        if (diff < 0) diff = 0;

        var days  = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var secs  = Math.floor((diff % (1000 * 60)) / 1000);

        var dEl = container.querySelector('[data-cd="days"]');
        var hEl = container.querySelector('[data-cd="hours"]');
        var mEl = container.querySelector('[data-cd="mins"]');
        var sEl = container.querySelector('[data-cd="secs"]');

        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(mins);
        if (sEl) sEl.textContent = pad(secs);
    }

    function tick() {
        Object.keys(targets).forEach(function (id) {
            updateCountdown(id, targets[id]);
        });
    }

    tick();                        // run once immediately
    setInterval(tick, 1000);       // then every second
}

/* ── 3. TIMELINE ACTIVE DOT PULSE ── */
function initTimelinePulse() {
    var activeDot = document.querySelector('.tl-item.active .tl-dot');
    if (!activeDot) return;

    var scale = 1;
    var dir   = 1;

    setInterval(function () {
        scale += dir * 0.004;
        if (scale >= 1.08) dir = -1;
        if (scale <= 1.00) dir =  1;
        activeDot.style.transform = 'scale(' + scale + ')';
    }, 30);
}
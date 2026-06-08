// script.js — KGB Killer Gourmet Burgers

// =============================================
// PARALLAX SCROLL EFFECT
// The background image moves at half the scroll
// speed of the page content, creating depth.
// =============================================
function updateParallax() {
  var bg = document.getElementById("parallax-bg");
  if (!bg) return;
  // scrollY * 0.4 = background moves at 40% of scroll speed
  var offset = window.pageYOffset * 0.4;
  bg.style.transform = "translateY(" + offset + "px)";
}

window.onscroll = function() {
  updateParallax();
};

// Run once on load to set initial position
updateParallax();

// =============================================
// TOGGLE MOBILE NAVIGATION MENU
// =============================================
function toggleMenu() {
  var nav = document.getElementById("main-nav");
  if (nav.className === "open") {
    nav.className = "";
  } else {
    nav.className = "open";
  }
}

// =============================================
// TOGGLE GRABFOOD DROPDOWN
// =============================================
function toggleGrab() {
  var dropdown = document.getElementById("grab-dropdown");
  if (dropdown.className.indexOf("hidden") !== -1) {
    dropdown.className = "dropdown";
  } else {
    dropdown.className = "dropdown hidden";
  }
}

// Close GrabFood dropdown when clicking outside
document.onclick = function(e) {
  var wrapper = document.getElementById("grabfood-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    var dropdown = document.getElementById("grab-dropdown");
    if (dropdown) {
      dropdown.className = "dropdown hidden";
    }
  }
};

// =============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// =============================================
var links = document.getElementsByTagName("a");
for (var i = 0; i < links.length; i++) {
  (function(link) {
    var href = link.getAttribute("href");
    if (href && href.charAt(0) === "#" && href.length > 1) {
      link.onclick = function(e) {
        var target = document.getElementById(href.substring(1));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
          // Close mobile nav after clicking a nav link
          var nav = document.getElementById("main-nav");
          if (nav) { nav.className = ""; }
        }
      };
    }
  })(links[i]);
}

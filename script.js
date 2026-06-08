// script.js — KGB Killer Gourmet Burgers

// Toggle mobile navigation menu
function toggleMenu() {
  var nav = document.getElementById("main-nav");
  if (nav.className === "open") {
    nav.className = "";
  } else {
    nav.className = "open";
  }
}

// Toggle GrabFood dropdown
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

// Smooth scroll for anchor links
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
          // Close mobile nav after clicking
          var nav = document.getElementById("main-nav");
          if (nav) { nav.className = ""; }
        }
      };
    }
  })(links[i]);
}

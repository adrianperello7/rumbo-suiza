/* Rumbo Suiza — shared site behavior: mobile nav + cookie consent gating. */
(function () {
  "use strict";

  // Keep the mobile nav overlay anchored right below the header, whether it
  // wraps to one or two rows (header height varies by viewport/font size).
  var headerEl = document.querySelector("header.site");
  function setHeaderHeightVar() {
    if (headerEl) document.documentElement.style.setProperty("--header-h", headerEl.offsetHeight + "px");
  }
  setHeaderHeightVar();
  window.addEventListener("resize", setHeaderHeightVar);

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav.primary");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  // Cookie consent banner
  var CONSENT_KEY = "rumbosuiza_consent";
  var banner = document.getElementById("cookie-banner");

  function loadDeferredScripts() {
    // Scripts marked type="text/plain" data-cookie-consent="required" are
    // AdSense/Analytics placeholders. Once a real publisher ID is added and
    // consent is granted, flip them to a real script and they will be
    // activated here.
    document.querySelectorAll('script[type="text/plain"][data-cookie-consent="required"]').forEach(function (el) {
      var s = document.createElement("script");
      Array.from(el.attributes).forEach(function (attr) {
        if (attr.name !== "type") s.setAttribute(attr.name, attr.value);
      });
      s.text = el.text;
      el.parentNode.replaceChild(s, el);
    });
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  var consent = getConsent();
  if (consent === "granted") {
    loadDeferredScripts();
  } else if (consent !== "denied" && banner) {
    banner.classList.add("show");
  }

  if (banner) {
    var acceptBtn = banner.querySelector("[data-consent-accept]");
    var rejectBtn = banner.querySelector("[data-consent-reject]");
    if (acceptBtn) acceptBtn.addEventListener("click", function () {
      setConsent("granted");
      banner.classList.remove("show");
      loadDeferredScripts();
    });
    if (rejectBtn) rejectBtn.addEventListener("click", function () {
      setConsent("denied");
      banner.classList.remove("show");
    });
  }
})();

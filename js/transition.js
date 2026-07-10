(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ENTER_KEY = "cm-page-dissolve";

  const overlay = document.createElement("div");
  overlay.className = "page-transition page-transition--dissolve";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `<div class="page-transition__veil"></div>`;
  document.body.appendChild(overlay);

  let revealed = false;
  let busy = false;

  function showOverlay() {
    overlay.classList.add("is-active");
  }

  function hideOverlay() {
    overlay.classList.remove("is-active", "is-in", "is-out");
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function dissolveOut() {
    showOverlay();
    // force reflow so transition runs
    void overlay.offsetWidth;
    overlay.classList.add("is-in");
    document.body.classList.add("is-leaving");
    await wait(520);
  }

  async function dissolveIn() {
    showOverlay();
    overlay.classList.add("is-in");
    void overlay.offsetWidth;
    document.body.classList.add("is-ready");
    await wait(40);
    overlay.classList.remove("is-in");
    overlay.classList.add("is-out");
    await wait(680);
    hideOverlay();
  }

  async function markReady() {
    if (revealed) return;
    revealed = true;

    if (reduced) {
      document.body.classList.add("is-ready");
      sessionStorage.removeItem(ENTER_KEY);
      return;
    }

    const shouldDissolveIn = sessionStorage.getItem(ENTER_KEY) === "1";
    sessionStorage.removeItem(ENTER_KEY);

    if (shouldDissolveIn) {
      await dissolveIn();
    } else {
      document.body.classList.add("is-ready");
      hideOverlay();
    }
  }

  function samePage(href) {
    try {
      const url = new URL(href, window.location.href);
      const norm = (path) =>
        path.replace(/\/index\.html$/i, "/").replace(/\/$/, "") || "/";
      return (
        url.origin === window.location.origin &&
        norm(url.pathname) === norm(window.location.pathname) &&
        url.search === window.location.search
      );
    } catch {
      return false;
    }
  }

  async function navigateWithTransition(href) {
    if (reduced || busy) {
      window.location.href = href;
      return;
    }
    busy = true;
    sessionStorage.setItem(ENTER_KEY, "1");
    try {
      await dissolveOut();
    } catch {
      /* ignore */
    }
    window.location.href = href;
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    if (samePage(href) && !url.hash) return;

    e.preventDefault();
    navigateWithTransition(url.href);
  });

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      busy = false;
      document.body.classList.remove("is-leaving");
      document.body.classList.add("is-ready");
      hideOverlay();
      revealed = true;
      sessionStorage.removeItem(ENTER_KEY);
    }
  });

  if (!reduced) {
    if (sessionStorage.getItem(ENTER_KEY) === "1") {
      showOverlay();
      overlay.classList.add("is-in");
    }
    const start = () => window.setTimeout(markReady, 30);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    window.setTimeout(markReady, 1200);
  } else {
    document.body.classList.add("is-ready");
  }
})();

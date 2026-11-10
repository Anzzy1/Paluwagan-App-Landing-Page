(function () {
  const cfg = window.PALUWAGAN_CONFIG || {};
  const WEB_APP = cfg.webAppUrl || "https://paluwagan-app-red.vercel.app/";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  // ---- Intro animations ----
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  // ---- Theme ----
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  systemDark.addEventListener?.("change", (e) => { if (!store.get("theme")) root.dataset.theme = e.matches ? "dark" : "light"; });
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next; store.set("theme", next);
  });

  // ---- Links ----
  $$(".web-link").forEach((a) => (a.href = WEB_APP));

  // ---- Nav ----
  const nav = $(".nav");
  const menuBtn = $("#menuBtn"), menu = $("#mobileMenu");
  menuBtn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));

  // ---- Scroll reveal + counters ----
  function countUp(el) {
    const target = Number(el.dataset.count), prefix = el.dataset.prefix || "";
    if (reduceMotion || target === 0) { el.textContent = prefix + target; return; }
    const dur = 1200, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 70}ms`;
      io.observe(el);
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  // ---- Sticky tour: swap the phone screen as steps scroll by ----
  const steps = $$(".tour-step"), shots = $$(".tour-shot"), dots = $$(".tour-dots i");
  if (steps.length && "IntersectionObserver" in window) {
    const tio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number(e.target.dataset.screen);
        steps.forEach((s, j) => s.classList.toggle("is-active", j === i));
        shots.forEach((s, j) => s.classList.toggle("is-active", j === i));
        dots.forEach((d, j) => d.classList.toggle("is-active", j === i));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => tio.observe(s));
  }

  // ---- Scroll-linked effects ----
  const browser = $("#browserFrame");
  let ticking = false;
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);
    if (browser && !reduceMotion) {
      const r = browser.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      browser.style.setProperty("--tilt", `${(1 - p) * 18}deg`);
      browser.style.setProperty("--sc", (0.92 + p * 0.08).toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ---- Hero parallax (pointer) ----
  const stage = $("#heroStage");
  if (stage && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    const layers = $$(".layer", stage);
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth) || 10;
        l.style.transform = `translate3d(${(-x * d).toFixed(1)}px, ${(-y * d).toFixed(1)}px, 0)`;
      });
    });
    hero.addEventListener("pointerleave", () => layers.forEach((l) => (l.style.transform = "")));
  }

  // ---- Toast ----
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
  }
  $$("[data-soon]").forEach((b) => b.addEventListener("click", () => {
    showToast(`The ${b.dataset.soon} is still in progress. Use the web app for now.`);
  }));

  // ---- Live demo ----
  $("#loadDemo").addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = WEB_APP; frame.title = "Paluwagan live demo"; frame.allow = "clipboard-write";
    $("#livePlaceholder").replaceWith(frame);
  });

  // ---- Feedback modal ----
  const modal = $("#feedbackModal"), form = $("#feedbackForm"), thanks = $("#feedbackThanks");
  const status = $("#formStatus"), submit = $("#fbSubmit"), msg = form.elements.message;

  function openFeedback(category) {
    form.hidden = false; thanks.hidden = true; status.textContent = ""; status.className = "form-status";
    if (category) { const r = form.querySelector(`input[name=category][value="${category}"]`); if (r) r.checked = true; }
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    setTimeout(() => msg.focus(), 60);
  }
  function closeFeedback() { if (modal.close) modal.close(); else modal.removeAttribute("open"); }
  $$("[data-open-feedback]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); openFeedback(el.dataset.category); }));
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeFeedback));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeFeedback(); });
  msg.addEventListener("input", () => ($("#msgCount").textContent = msg.value.length));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    if (form.elements.website.value) { form.hidden = true; thanks.hidden = false; return; }
    const message = msg.value.trim();
    if (message.length < 3) { status.textContent = "Please write a short message first."; status.classList.add("err"); msg.focus(); return; }
    const data = new FormData(form);
    const payload = {
      category: data.get("category") || "other",
      rating: data.get("rating") ? Number(data.get("rating")) : null,
      message,
      contact: (data.get("contact") || "").toString().trim() || null,
      page: location.href.slice(0, 300),
      user_agent: navigator.userAgent.slice(0, 400),
    };
    if (!cfg.supabaseUrl || !cfg.supabaseKey) { status.textContent = "Feedback isn't set up yet."; status.classList.add("err"); return; }
    submit.disabled = true; submit.textContent = "Sending…";
    try {
      const res = await fetch(`${cfg.supabaseUrl.replace(/\/$/, "")}/rest/v1/website_feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.supabaseKey, Authorization: `Bearer ${cfg.supabaseKey}`, Prefer: "return=minimal" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset(); $("#msgCount").textContent = "0";
      form.hidden = true; thanks.hidden = false;
    } catch (err) {
      console.error("Feedback failed", err);
      status.textContent = "Sorry, that didn't send. Please try again in a moment.";
      status.classList.add("err");
    } finally {
      submit.disabled = false; submit.textContent = "Send feedback";
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();

/* ============================================================
   OMNIBUILD — interaction & motion engine
   Library: anime.js ("Animate.js") for timelines/sequencing.
   NOTE: motion choreography is hand-authored here. If a Higgsfield
   MCP motion system is connected later, its presets can replace the
   timelines in `heroIntro()` and the scroll sequences below.
============================================================ */
(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasAnime = typeof window.anime === "function";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* =========================================================
     0 · SPLIT TEXT — wrap words for reveal-split headings
  ========================================================= */
  function splitHeadings() {
    $$("[data-reveal-split]").forEach((el) => {
      const html = el.innerHTML.split("<br>").join(" \n ");
      const frag = document.createDocumentFragment();
      html.split(/(\s+)/).forEach((token) => {
        if (token.trim() === "\n") { frag.appendChild(document.createElement("br")); return; }
        if (token.trim() === "") { frag.appendChild(document.createTextNode(token)); return; }
        const outer = document.createElement("span");
        outer.style.display = "inline-block";
        outer.style.overflow = "hidden";
        outer.style.verticalAlign = "top";
        const inner = document.createElement("span");
        inner.className = "rword";
        inner.textContent = token;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      el.innerHTML = "";
      el.appendChild(frag);
    });
  }
  splitHeadings();

  /* =========================================================
     1 · LOADER
  ========================================================= */
  function runLoader(done) {
    const loader = $("#loader");
    const fill = $("#loaderFill");
    const pct = $("#loaderPct");
    if (!loader) { done(); return; }

    if (REDUCED || !hasAnime) {
      if (fill) fill.style.width = "100%";
      loader.classList.add("done");
      setTimeout(done, 200);
      return;
    }

    const state = { v: 0 };
    anime({
      targets: state,
      v: 100,
      duration: 1400,
      easing: "easeInOutQuart",
      update() {
        const val = Math.round(state.v);
        if (fill) fill.style.width = val + "%";
        if (pct) pct.textContent = String(val).padStart(2, "0");
      },
      complete() {
        anime({
          targets: loader,
          opacity: 0,
          duration: 600,
          easing: "easeOutQuad",
          complete() { loader.classList.add("done"); done(); },
        });
      },
    });
  }

  /* =========================================================
     2 · HERO INTRO TIMELINE
  ========================================================= */
  function heroIntro() {
    const words = $$(".hero__title .word");
    if (REDUCED || !hasAnime) {
      words.forEach((w) => (w.style.transform = "none"));
      $$(".reveal-load").forEach((el) => (el.style.opacity = 1));
      $("#nav")?.classList.add("nav-in");
      return;
    }

    const tl = anime.timeline({ easing: "easeOutExpo" });
    tl.add({
      targets: ".hero__title .word",
      translateY: ["110%", "0%"],
      duration: 1100,
      delay: anime.stagger(60),
    })
    .add({
      targets: ".hero__eyebrow",
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 700,
    }, "-=900")
    .add({
      targets: ".hero__sub",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
    }, "-=650")
    .add({
      targets: ".hero__cta",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
    }, "-=550")
    .add({
      targets: ".hero__dim",
      opacity: [0, 1],
      duration: 800,
    }, "-=500");

    // nav slides down
    anime({ targets: "#nav", translateY: [-80, 0], opacity: [0, 1], duration: 900, easing: "easeOutExpo", delay: 300 });
  }

  /* =========================================================
     5 · MOUSE PARALLAX (hero scene + glow)
  ========================================================= */
  function parallax() {
    if (REDUCED) return;
    const glow = $(".hero__glow");
    const depthEls = $$("[data-depth]");
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    (function tick() {
      cx = lerp(cx, tx, 0.06); cy = lerp(cy, ty, 0.06);
      depthEls.forEach((el) => {
        const d = parseFloat(el.dataset.depth) * 60;
        el.style.transform = `translate3d(${-cx * d}px, ${-cy * d}px, 0)`;
      });
      if (glow) glow.style.transform = `translate(-50%,-50%) translate3d(${cx * 30}px, ${cy * 30}px, 0)`;
      requestAnimationFrame(tick);
    })();
  }

  /* =========================================================
     6 · CUSTOM CURSOR + MAGNETIC
  ========================================================= */
  function cursor() {
    if (REDUCED || window.matchMedia("(hover: none)").matches) return;
    const ring = $("#cursor"), dot = $("#cursorDot");
    if (!ring) return;
    let rx = 0, ry = 0, dx = 0, dy = 0, mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function tick() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      dx = lerp(dx, mx, 0.55); dy = lerp(dy, my, 0.55);
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    })();
    $$("a, button, [data-magnetic], input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hovering"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hovering"));
    });

    // Magnetic pull
    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* =========================================================
     7 · TILT on cards
  ========================================================= */
  function tilt() {
    if (REDUCED || window.matchMedia("(hover: none)").matches) return;
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* =========================================================
     8 · NAV — scroll state, burger, smooth scroll
  ========================================================= */
  function navigation() {
    const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeMenu() {
      menu.classList.remove("open");
      nav.classList.remove("menu-open");
      burger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    }
    burger?.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      nav.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
    });

    // Smooth scroll for all in-page anchors (with nav offset)
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        const offset = nav.offsetHeight + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: REDUCED ? "auto" : "smooth" });
      });
    });
  }

  /* =========================================================
     9 · SCROLL PROGRESS
  ========================================================= */
  function scrollProgress() {
    const bar = $("#scrollProgress");
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* =========================================================
     10 · SCROLL REVEAL — IntersectionObserver
  ========================================================= */
  function reveal() {
    const els = $$("[data-reveal], [data-reveal-split]");
    if (REDUCED) {
      els.forEach((el) => {
        el.classList.add("in");
        $$(".rword", el).forEach((w) => { w.style.opacity = 1; w.style.transform = "none"; });
      });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        if (el.hasAttribute("data-reveal-split") && hasAnime) {
          anime({
            targets: $$(".rword", el),
            translateY: ["120%", "0%"],
            rotate: [4, 0],
            opacity: [0, 1],
            duration: 900,
            delay: anime.stagger(45),
            easing: "easeOutExpo",
          });
        } else {
          el.classList.add("in");
        }
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* =========================================================
     11 · STACKING CARDS — scale/fade as they stack
  ========================================================= */
  function stackingCards() {
    const cards = $$(".stack__card");
    if (!cards.length || REDUCED) return;
    const update = () => {
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const r = card.getBoundingClientRect();
        const top = parseFloat(getComputedStyle(card).top);
        // progress: how far past its sticky point the card is pinned
        const p = clamp((top - r.top) / (vh * 0.55), 0, 1);
        const scale = 1 - p * 0.08;
        const dim = p * 0.55;
        card.style.transform = `scale(${scale})`;
        card.style.filter = `brightness(${1 - dim})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* =========================================================
     12 · HORIZONTAL ROADMAP — scroll-driven translate
  ========================================================= */
  function roadmap() {
    const road = $("#road");
    const track = $("#roadTrack");
    const fill = $("#roadFill");
    const milestones = $$(".milestone");
    if (!road || !track) return;

    if (REDUCED) {
      milestones.forEach((m) => m.classList.add("active"));
      if (fill) fill.style.width = "100%";
      return;
    }

    let maxScroll = 0, roadHeight = 0;
    function measure() {
      const vw = window.innerWidth;
      maxScroll = Math.max(0, track.scrollWidth - vw);
      roadHeight = window.innerHeight + maxScroll;
      road.style.height = roadHeight + "px";
    }
    function update() {
      const r = road.getBoundingClientRect();
      const total = roadHeight - window.innerHeight;
      const p = clamp(-r.top / total, 0, 1);
      track.style.transform = `translate3d(${-p * maxScroll}px,0,0)`;
      if (fill) fill.style.width = (p * 100) + "%";
      milestones.forEach((m, i) => {
        m.classList.toggle("active", p >= (i / milestones.length) * 0.9);
      });
    }
    measure(); update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", () => { measure(); update(); });
  }

  /* =========================================================
     13 · COUNTERS
  ========================================================= */
  function counters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        if (REDUCED) { el.textContent = target + suffix; io.unobserve(el); return; }
        const start = performance.now(), dur = 1600;
        (function step(now) {
          const t = clamp((now - start) / dur, 0, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (t < 1) requestAnimationFrame(step);
        })(performance.now());
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* =========================================================
     14 · AMBIENT FLOAT (why-section elements)
  ========================================================= */
  function ambientFloat() {
    if (REDUCED || !hasAnime) return;
    $$("[data-float]").forEach((el, i) => {
      anime({
        targets: el,
        translateY: [0, -12],
        direction: "alternate",
        loop: true,
        duration: 3000 + (i % 4) * 500,
        delay: i * 120,
        easing: "easeInOutSine",
      });
    });
  }

  /* =========================================================
     15 · CONTACT FORM — FormSubmit.co (zero configuration)

     No account, no API keys, no dashboard. The form posts to
     FormSubmit's AJAX endpoint for contact@omnibuild.ma:
       · the submission is emailed to contact@omnibuild.ma
       · "_autoresponse" sends an automatic confirmation to the
         person who filled the form
     ONE-TIME STEP (not code): the very first submission triggers
     an activation email to contact@omnibuild.ma — click its link
     once to switch the endpoint on. Nothing else to configure.
  ========================================================= */
  function contactForm() {
    const form = $("#contactForm");
    if (!form) return;
    const btn = $("#submitBtn");
    const status = $("#formStatus");

    const ENDPOINT = "https://formsubmit.co/ajax/contact@omnibuild.ma";

    function setStatus(msg, type) {
      status.textContent = msg;
      status.className = "form__status" + (type ? " " + type : "");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const name = form.name.value.trim();
      const payload = {
        name,
        company: form.company.value.trim() || "—",
        phone: form.phone.value.trim() || "—",
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim(),
        // FormSubmit control fields
        _subject: "Nouvelle demande de projet — " + (form.subject.value.trim() || "Omnibuild"),
        _template: "table",
        _captcha: "false",
        _autoresponse:
          "Bonjour " + name + ",\n\n" +
          "Merci d'avoir contacté Omnibuild. Nous avons bien reçu votre demande " +
          "et notre équipe revient vers vous très rapidement.\n\n" +
          "Un espace est bien plus qu'une œuvre architecturale — c'est un lieu de " +
          "création et de partage.\n\n" +
          "À très bientôt,\nL'équipe Omnibuild\n" +
          "119, bd Abdelmoumen, 2e étage, N°15 — Casablanca\n" +
          "+212 6 61 13 19 04 · contact@omnibuild.ma",
      };

      btn.classList.add("loading");
      setStatus("Envoi en cours…", "");

      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
        });
        const out = await res.json().catch(() => ({}));
        btn.classList.remove("loading");
        if (res.ok && (out.success === "true" || out.success === true)) {
          setStatus("Merci ! Votre demande a bien été envoyée. Nous revenons vers vous rapidement.", "ok");
          form.reset();
          if (hasAnime) anime({ targets: btn, scale: [1, 1.04, 1], duration: 500, easing: "easeOutBack" });
        } else {
          const m = (out && out.message) || "";
          // FormSubmit refuses to run for pages opened as local files (file://)
          if (/web server|HTML files/i.test(m)) {
            setStatus("Le formulaire n'est actif qu'une fois le site en ligne (ou servi via un serveur local) — pas en ouvrant le fichier directement.", "err");
          } else {
            setStatus("Une erreur est survenue. Merci de réessayer ou d'écrire à contact@omnibuild.ma.", "err");
          }
          console.warn("FormSubmit response:", out);
        }
      } catch (err) {
        btn.classList.remove("loading");
        setStatus("Connexion impossible. Merci de réessayer ou d'écrire à contact@omnibuild.ma.", "err");
        console.error("FormSubmit error:", err);
      }
    });

    // Button press micro-interaction
    btn.addEventListener("pointerdown", () => {
      if (!REDUCED && hasAnime) anime({ targets: btn, scale: 0.96, duration: 120, easing: "easeOutQuad" });
    });
    btn.addEventListener("pointerup", () => {
      if (!REDUCED && hasAnime) anime({ targets: btn, scale: 1, duration: 220, easing: "easeOutBack" });
    });
  }

  /* =========================================================
     16 · MISC
  ========================================================= */
  function misc() {
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* =========================================================
     BOOT
  ========================================================= */
  function boot() {
    navigation();
    scrollProgress();
    reveal();
    stackingCards();
    roadmap();
    counters();
    cursor();
    tilt();
    parallax();
    ambientFloat();
    contactForm();
    misc();
  }

  window.addEventListener("DOMContentLoaded", () => {
    runLoader(heroIntro);
    boot();
  });
})();

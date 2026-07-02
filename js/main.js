// ============================================================
// 138億年の旅 — メインスクリプト
// 星空Canvas / スクロール演出 / タイムライン描画 / ナビ制御
// ============================================================

(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----------------------------------------------------------
  // 1. 星空の背景（Canvas）
  //    セクションのテーマに合わせて空の色がゆっくり変わる
  // ----------------------------------------------------------
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let width = 0;
  let height = 0;

  // 各章の空の色（上→下のグラデーション）
  const THEMES = {
    hero:     ["#05061a", "#0b0f2a"],
    universe: ["#0a0524", "#1b0f3b"],
    earth:    ["#041225", "#0a2b4a"],
    life:     ["#03201d", "#0a3d33"],
    human:    ["#1f1206", "#3a2410"],
    world:    ["#170b20", "#2b1638"],
    japan:    ["#1f070f", "#3a1020"],
    you:      ["#0b0f2a", "#23204a"]
  };
  let currentTop = THEMES.hero[0];
  let currentBottom = THEMES.hero[1];
  let targetTop = currentTop;
  let targetBottom = currentBottom;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerpColor(a, b, t) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
    return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  }

  function makeStars() {
    const count = Math.min(220, Math.floor((width * height) / 6000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2
    }));
  }

  let t = 0;
  function draw() {
    t += 0.016;
    // 空の色をターゲットへゆっくり寄せる
    currentTop = lerpColor(currentTop, targetTop, 0.04);
    currentBottom = lerpColor(currentBottom, targetBottom, 0.04);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, currentTop);
    grad.addColorStop(1, currentBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    for (const s of stars) {
      const tw = prefersReducedMotion
        ? s.base
        : s.base + Math.sin(t * s.speed + s.phase) * 0.3;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  if (prefersReducedMotion) {
    draw(); // 1回だけ描画
  } else {
    requestAnimationFrame(draw);
  }

  // ----------------------------------------------------------
  // 2. 実物資料「本物を見てみよう」カードの描画
  //    <div data-artifacts="universe"> のような置き場に流し込む
  // ----------------------------------------------------------
  if (typeof ARTIFACTS !== "undefined") {
    document.querySelectorAll("[data-artifacts]").forEach((row) => {
      const items = ARTIFACTS[row.dataset.artifacts] || [];
      items.forEach((a) => {
        const fig = document.createElement("figure");
        fig.className = "artifact-card reveal";
        fig.innerHTML = `
          <div class="artifact-frame">
            <img src="${a.img}" width="${a.w}" height="${a.h}" loading="lazy"
                 alt="${a.title}">
          </div>
          <figcaption>
            <span class="artifact-badge">🏛️ 本物を見てみよう</span>
            <h3 class="artifact-title">${a.title}</h3>
            <p class="artifact-year">${a.year}</p>
            <p class="artifact-desc">${a.desc}</p>
            <p class="artifact-credit">出典: ${a.credit}</p>
          </figcaption>
        `;
        row.appendChild(fig);
      });
    });
  }

  // ----------------------------------------------------------
  // 3. タイムラインカードの描画（世界史・日本史）
  // ----------------------------------------------------------
  function renderTimeline(el, items) {
    if (!el) return;
    items.forEach((item, i) => {
      const card = document.createElement("article");
      card.className = "tl-card reveal " + (i % 2 === 0 ? "tl-left" : "tl-right");
      card.innerHTML = `
        <button class="tl-head" type="button" aria-expanded="false">
          <span class="tl-emoji" aria-hidden="true">${item.emoji}</span>
          <span class="tl-meta">
            <span class="tl-era">${item.era}</span>
            <span class="tl-when">${item.when}</span>
          </span>
          <span class="tl-title">${item.title}</span>
          <span class="tl-toggle" aria-hidden="true">＋ へぇ話を読む</span>
        </button>
        <div class="tl-body">
          <div class="tl-inner">
            <p class="tl-summary">${item.summary}</p>
            <div class="tl-fun">
              <span class="tl-fun-badge">💡 へぇ！</span>
              <p>${item.fun}</p>
            </div>
          </div>
        </div>
      `;
      const head = card.querySelector(".tl-head");
      const toggle = card.querySelector(".tl-toggle");
      head.addEventListener("click", () => {
        const open = card.classList.toggle("open");
        head.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "－ とじる" : "＋ へぇ話を読む";
      });
      el.appendChild(card);
    });
  }

  if (typeof WORLD_HISTORY !== "undefined") {
    renderTimeline(document.getElementById("worldTimeline"), WORLD_HISTORY);
  }
  if (typeof JAPAN_HISTORY !== "undefined") {
    renderTimeline(document.getElementById("japanTimeline"), JAPAN_HISTORY);
  }

  // ----------------------------------------------------------
  // 4. スクロールで要素をふわっと表示（IntersectionObserver）
  // ----------------------------------------------------------
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("shown");
          revealObserver.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // ----------------------------------------------------------
  // 5. 章の切り替え検知 → 空の色 & ナビ更新
  // ----------------------------------------------------------
  const navLinks = Array.from(document.querySelectorAll(".side-nav .dot"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = e.target.id;
        // テーマ色（calendar は hero と同系にする）
        const theme = e.target.dataset.theme || (id === "calendar" ? "universe" : id);
        if (THEMES[theme]) {
          targetTop = THEMES[theme][0];
          targetBottom = THEMES[theme][1];
        }
        // ナビのアクティブ表示
        navLinks.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      }
    },
    { rootMargin: "-40% 0px -40% 0px" }
  );
  document
    .querySelectorAll("main .section")
    .forEach((sec) => sectionObserver.observe(sec));

  // ----------------------------------------------------------
  // 6. 進行度バー（ページ全体のスクロール率）
  // ----------------------------------------------------------
  const progressBar = document.getElementById("progressBar");
  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progressBar.style.width = (ratio * 100).toFixed(2) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
})();

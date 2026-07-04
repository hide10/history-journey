// ============================================================
// 138億年の旅 — 各章のSVG図解
//   地球24時間時計 / 生命の系統樹 / グレートジャーニー /
//   世界文明の並行年表 / 日本史の時代帯 / 世界人口カーブ
// カテゴリ色は dataviz のダーク版検証済みパレットから採用。
// ============================================================

(function () {
  "use strict";

  const GOLD = "#ffd166";
  // dataviz ダークモード検証済みカテゴリ色
  const CAT = ["#3987e5", "#199e70", "#c98500", "#9085e9", "#e66767", "#d55181"];

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function mount(id, svg, caption) {
    const host = document.getElementById(id);
    if (!host) return;
    host.innerHTML = `<div class="dg-scroll">${svg}</div>` +
      (caption ? `<p class="dg-caption">${caption}</p>` : "");
  }

  // ---------- ① 地球 24時間時計 ----------
  if (typeof EARTH_CLOCK !== "undefined") {
    const cx = 250, cy = 250, R = 170;
    const ang = (h) => (h / 24 * 360 - 90) * Math.PI / 180;
    const pt = (h, r) => [cx + r * Math.cos(ang(h)), cy + r * Math.sin(ang(h))];

    let ticks = "";
    for (let h = 0; h < 24; h++) {
      const [x1, y1] = pt(h, R);
      const [x2, y2] = pt(h, R - (h % 6 === 0 ? 16 : 8));
      ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dg-tick${h % 6 === 0 ? " dg-tick-major" : ""}"/>`;
      if (h % 6 === 0) {
        const [lx, ly] = pt(h, R - 34);
        ticks += `<text x="${lx}" y="${ly}" class="dg-ticklabel" text-anchor="middle" dominant-baseline="middle">${h}時</text>`;
      }
    }

    // ラベルは右側に段組みで並べ、時計上の点とリーダー線で結ぶ
    let marks = "", legend = "";
    EARTH_CLOCK.forEach((e, i) => {
      const [mx, my] = pt(e.h, R);
      const cls = e.you ? "dg-you" : "";
      marks += `<circle cx="${mx}" cy="${my}" r="${e.you ? 7 : 5}" class="dg-dot ${cls}"/>`;
      const ly = 120 + i * 62;
      legend += `
        <line x1="${mx}" y1="${my}" x2="530" y2="${ly - 6}" class="dg-leader ${cls}"/>
        <g class="${cls}">
          <text x="545" y="${ly - 8}" class="dg-lg-time">${e.emoji} ${e.time}</text>
          <text x="545" y="${ly + 12}" class="dg-lg-label">${esc(e.label)}</text>
          <text x="545" y="${ly + 30}" class="dg-lg-note">${esc(e.note)}</text>
        </g>`;
    });

    mount("earthClock", `
<svg viewBox="0 0 900 500" class="dg-svg" role="img" aria-label="地球の46億年を24時間に例えると、人類が現れるのは午後11時59分54秒。最後の6秒です。">
  <circle cx="${cx}" cy="${cy}" r="${R}" class="dg-ring"/>
  ${ticks}
  <text x="${cx}" y="${cy - 16}" class="dg-center-top" text-anchor="middle">地球の一生を</text>
  <text x="${cx}" y="${cy + 14}" class="dg-center-big" text-anchor="middle">24時間に</text>
  <text x="${cx}" y="${cy + 40}" class="dg-center-sub" text-anchor="middle">すると…（0時＝46億年前）</text>
  ${marks}
  ${legend}
</svg>`,
      "人類が登場するのは、なんと <b>午後11時59分54秒</b>。地球の歴史のなかで、人間がいる時間はたったの「最後の6秒」です。");
  }

  // ---------- ② 生命の系統樹 ----------
  if (typeof LIFE_TREE !== "undefined") {
    const x0 = 40, xJoin = 150, xTip = 620, yTrunk = 300;
    let branches = "", labels = "";
    LIFE_TREE.branches.forEach((b) => {
      const cls = b.hl ? "dg-branch-hl" : "dg-branch";
      branches += `<path d="M ${xJoin} ${yTrunk} C ${xJoin + 120} ${yTrunk}, ${xTip - 200} ${b.y}, ${xTip} ${b.y}" class="${cls}" fill="none"/>`;
      const tcls = b.hl ? "dg-leaf-hl" : "dg-leaf";
      labels += `<circle cx="${xTip}" cy="${b.y}" r="${b.hl ? 6 : 4}" class="${tcls}"/>` +
        `<text x="${xTip + 14}" y="${b.y + 5}" class="dg-leaf-label${b.hl ? " dg-leaf-label-hl" : ""}">${esc(b.name)}</text>`;
    });
    mount("lifeTree", `
<svg viewBox="0 0 900 540" class="dg-svg" role="img" aria-label="すべての生き物は1個の細胞から枝分かれした親戚。人間にいたる枝を金色で示す。">
  <line x1="${x0}" y1="${yTrunk}" x2="${xJoin}" y2="${yTrunk}" class="dg-trunk"/>
  <circle cx="${x0}" cy="${yTrunk}" r="8" class="dg-leaf-hl"/>
  <text x="${x0}" y="${yTrunk - 22}" class="dg-trunk-label">${esc(LIFE_TREE.trunk.label)}</text>
  <text x="${x0}" y="${yTrunk - 4}" class="dg-trunk-sub">${esc(LIFE_TREE.trunk.sub)}</text>
  ${branches}
  ${labels}
</svg>`,
      "植物も、きのこも、魚も、恐竜も、犬も、あなたも——たどれば<b>みんな同じ1個の細胞の子孫</b>。生き物はすべて親戚です。");
  }

  // ---------- ③ グレートジャーニー ----------
  if (typeof GREAT_JOURNEY !== "undefined") {
    const ox = 150, oy = 300;
    let arrows = "";
    GREAT_JOURNEY.routes.forEach((r, i) => {
      const L = 250 + r.len * 240;
      const a = r.dir * Math.PI / 2.4;
      const ex = ox + L * Math.cos(a - Math.PI / 2 + Math.PI / 2) * 0 + L; // rightward base
      // 右方向に伸ばしつつ dir で上下に振る
      const tx = ox + L;
      const ty = oy + r.dir * 150;
      const mx = ox + L * 0.5, my = oy + r.dir * 110;
      arrows += `
        <path d="M ${ox} ${oy} Q ${mx} ${my}, ${tx} ${ty}" class="dg-route" fill="none"
              marker-end="url(#arrowhead)" style="--i:${i}"/>
        <g>
          <text x="${tx + 14}" y="${ty - 2}" class="dg-route-to">${esc(r.to)}</text>
          <text x="${tx + 14}" y="${ty + 18}" class="dg-route-yr">${esc(r.years)}</text>
        </g>`;
    });
    mount("humanJourney", `
<svg viewBox="0 0 900 520" class="dg-svg" role="img" aria-label="人類はアフリカを出発し、歩いて世界中へ広がった。">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="${GOLD}"/>
    </marker>
  </defs>
  ${arrows}
  <circle cx="${ox}" cy="${oy}" r="13" class="dg-origin"/>
  <circle cx="${ox}" cy="${oy}" r="22" class="dg-origin-halo"/>
  <text x="${ox}" y="${oy + 46}" class="dg-origin-label" text-anchor="middle">${esc(GREAT_JOURNEY.origin.label)}</text>
  <text x="${ox}" y="${oy + 66}" class="dg-origin-sub" text-anchor="middle">${esc(GREAT_JOURNEY.origin.sub)}</text>
</svg>`,
      "肌の色や言葉は違っても、ご先祖をたどれば<b>みんなアフリカ出身</b>。人類は長い旅の末に世界へ散らばった、ひとつの大家族です。");
  }

  // ---------- ④ 世界の文明・並行年表 ----------
  if (typeof WORLD_CIVS !== "undefined") {
    const x0 = 60, x1 = 700, yTop = 60, rowH = 46;
    const { axisFrom, axisTo } = WORLD_CIVS;
    const X = (y) => x0 + (y - axisFrom) / (axisTo - axisFrom) * (x1 - x0);

    let axis = "";
    [-3000, -2000, -1000, 1, 1000, 2000].forEach((yr) => {
      const x = X(yr);
      axis += `<line x1="${x}" y1="${yTop - 10}" x2="${x}" y2="${yTop + WORLD_CIVS.bars.length * rowH}" class="dg-vgrid"/>` +
        `<text x="${x}" y="${yTop - 18}" class="dg-axislabel" text-anchor="middle">${yr < 1 ? "紀元前" + (-yr + 1) : (yr === 1 ? "西暦1年" : yr + "年")}</text>`;
    });

    let bars = "";
    WORLD_CIVS.bars.forEach((b, i) => {
      const y = yTop + i * rowH + 8;
      const bx = X(b.from), bw = X(b.to) - X(b.from);
      const c = CAT[b.slot % CAT.length];
      bars += `
        <rect x="${bx}" y="${y}" width="${bw}" height="22" rx="6" fill="${c}" class="dg-civbar"/>
        <text x="${bx + 8}" y="${y + 16}" class="dg-civname">${esc(b.name)}</text>`;
    });

    mount("worldCivs", `
<svg viewBox="0 0 760 ${yTop + WORLD_CIVS.bars.length * rowH + 30}" class="dg-svg" role="img"
  aria-label="メソポタミア・エジプト・中国など、世界の文明が生まれ、重なり合ってきた年表。">
  ${axis}
  ${bars}
</svg>`,
      "四大文明は、どれも大きな川のそばで<b>ほぼ同じころ</b>に芽ばえました。文明はひとつずつではなく、世界のあちこちで同時に育ったのです。");
  }

  // ---------- ⑤ 日本史・時代の長さ ----------
  if (typeof JAPAN_ERAS !== "undefined") {
    const x0 = 130, x1 = 720, yTop = 30, rowH = 40;
    const maxY = Math.max(...JAPAN_ERAS.map((e) => e.years));
    let rows = "";
    JAPAN_ERAS.forEach((e, i) => {
      const y = yTop + i * rowH;
      const w = e.years / maxY * (x1 - x0);
      const c = e.name === "縄文時代" ? GOLD : CAT[0];
      rows += `
        <text x="${x0 - 12}" y="${y + 18}" class="dg-eraname" text-anchor="end">${esc(e.name)}</text>
        <rect x="${x0}" y="${y + 6}" width="${Math.max(w, 3)}" height="20" rx="5" fill="${c}"
              class="dg-erabar${e.name === "縄文時代" ? " dg-erabar-hl" : ""}"/>
        <text x="${x0 + Math.max(w, 3) + 10}" y="${y + 21}" class="dg-eralen">${esc(e.label)}</text>`;
    });
    mount("japanEras", `
<svg viewBox="0 0 820 ${yTop + JAPAN_ERAS.length * rowH + 20}" class="dg-svg" role="img"
  aria-label="日本の各時代の長さを棒の長さで比べると、縄文時代が飛び抜けて長い。">
  ${rows}
</svg>`,
      "教科書では数ページの「縄文時代」が、実は<b>1万年以上</b>。ほかの全時代を合わせても足もとにおよびません。日本史の大半は、実は縄文時代なのです。");
  }

  // ---------- ⑥ 世界人口カーブ ----------
  if (typeof POP_CURVE !== "undefined") {
    const x0 = 60, x1 = 720, y0 = 360, y1 = 40;
    const yrFrom = -10000, yrTo = 2025, popMax = 9;
    const X = (yr) => x0 + (yr - yrFrom) / (yrTo - yrFrom) * (x1 - x0);
    const Y = (p) => y0 - p / popMax * (y0 - y1);

    const pts = POP_CURVE.points.map((p) => `${X(p.year).toFixed(1)},${Y(p.pop).toFixed(1)}`);
    const area = `${x0},${y0} ` + pts.join(" ") + ` ${x1},${y0}`;

    let axis = "";
    [-10000, -5000, 1, 2025].forEach((yr) => {
      const x = X(yr);
      axis += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 6}" class="dg-tick"/>` +
        `<text x="${x}" y="${y0 + 22}" class="dg-axislabel" text-anchor="middle">${yr < 1 ? "紀元前" + (-yr) + "年" : (yr === 1 ? "西暦1年" : yr + "年")}</text>`;
    });
    [2, 4, 6, 8].forEach((p) => {
      const y = Y(p);
      axis += `<text x="${x0 - 10}" y="${y + 4}" class="dg-axislabel" text-anchor="end">${p}0億</text>` +
        `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" class="dg-hgrid"/>`;
    });

    let notes = "";
    POP_CURVE.labels.forEach((l) => {
      const p = POP_CURVE.points.find((pp) => pp.year === l.year);
      const x = X(l.year), y = Y(p.pop);
      const anchor = l.year > 1500 ? "end" : "start";
      const dx = l.year > 1500 ? -10 : 10;
      notes += `<circle cx="${x}" cy="${y}" r="4" class="dg-pop-dot"/>` +
        `<text x="${x + dx}" y="${y - 10}" class="dg-pop-note" text-anchor="${anchor}">${esc(l.text)}</text>`;
    });

    mount("popCurve", `
<svg viewBox="0 0 760 410" class="dg-svg" role="img"
  aria-label="世界の人口は、1万年間ほぼ横ばいだったのに、産業革命のあと急激に増えた。">
  ${axis}
  <polyline points="${area}" class="dg-pop-area"/>
  <polyline points="${pts.join(" ")}" class="dg-pop-line" fill="none"/>
  ${notes}
</svg>`,
      "人口は1万年ものあいだ、ほぼ横ばい。ところが<b>産業革命</b>のあと、グラフはほぼ真上に急上昇します。あなたは、この歴史上いちばん人が多い時代を生きています。");
  }
})();

// ============================================================
// 宇宙カレンダー2.0 — 3段ズームの図解
//   ① 12ヶ月グリッド（空白の月が主役）
//   ② 12月31日の24時間円環（人類の出番は極細の金スライス）
//   ③ 最後の8分の拡大タイムライン（文明〜あなたの0.2秒）
// ============================================================

(function () {
  "use strict";

  const host = document.getElementById("cosmicCalendar");
  if (!host || typeof CC_MONTHS === "undefined") return;

  // ---------- ① 12ヶ月グリッド ----------
  const grid = document.createElement("div");
  grid.className = "cc-grid";
  CC_MONTHS.forEach((mo) => {
    const cell = document.createElement("div");
    cell.className = "cc-month reveal" + (mo.special ? " cc-special" : "") +
      (mo.events.length === 0 ? " cc-empty" : "");
    let inner = `<span class="cc-mname">${mo.m}月</span>`;
    if (mo.events.length === 0) {
      inner += `<span class="cc-quiet">……</span>`;
    } else {
      inner += mo.events
        .map((e) => `<span class="cc-ev"><em>${e.emoji}</em><span><b>${e.d}</b> ${e.label}</span></span>`)
        .join("");
    }
    cell.innerHTML = inner;
    grid.appendChild(cell);
  });
  host.appendChild(grid);

  const gridNote = document.createElement("p");
  gridNote.className = "cc-note reveal";
  gridNote.innerHTML =
    "2月から8月まで、カレンダーはほぼ空白。宇宙の時間は、それほどゆっくり流れます。<br>そして——すべての見どころは<b>12月31日</b>に詰まっています。";
  host.appendChild(gridNote);

  // ---------- ② + ③ 12月31日ズーム ----------
  const zoomWrap = document.createElement("div");
  zoomWrap.className = "cc-zoom reveal";
  zoomWrap.innerHTML = buildZoomSVG();
  host.appendChild(zoomWrap);

  function buildZoomSVG() {
    const W = 860, H = 660;
    const cx = 430, cy = 205, R = 150;

    // -- 円環（24時間） --
    // 時刻 → 角度（0時=真上、時計回り）
    const ang = (ratio) => (ratio * 360 - 90) * (Math.PI / 180);
    const pt = (ratio, r) => [cx + r * Math.cos(ang(ratio)), cy + r * Math.sin(ang(ratio))];

    // 人類スライス（23:52〜24:00）
    const hr = CC_CLOCK.humanStartRatio;
    const [sx, sy] = pt(hr, R);
    const [ex, ey] = pt(1, R);

    // 時刻目盛（0,6,12,18時）— ラベルは円の内側（外側だと見出しと衝突する）
    let ticks = "";
    [["0時", 0], ["6時", 0.25], ["12時", 0.5], ["18時", 0.75]].forEach(([t, r]) => {
      const [tx1, ty1] = pt(r, R - 8);
      const [tx2, ty2] = pt(r, R + 8);
      const [lx, ly] = pt(r, R - 26);
      ticks += `<line x1="${tx1}" y1="${ty1}" x2="${tx2}" y2="${ty2}" class="cc-tick"/>` +
        `<text x="${lx}" y="${ly}" class="cc-ticklabel" text-anchor="middle" dominant-baseline="middle">${t}</text>`;
    });

    // -- 拡大タイムライン帯 --
    // イベントは最後の5%に密集する（それ自体がこの図のメッセージ）ので、
    // マークは正確な位置に置き、ラベルは等間隔スロットに逃がしてリーダー線で結ぶ
    const bandY = 480, bandX0 = 70, bandX1 = 790;
    const bandLen = bandX1 - bandX0;
    const n = CC_CLOCK.zoom.length;
    const slotW = bandLen / n;

    let bandMarks = "";
    CC_CLOCK.zoom.forEach((ev, i) => {
      const x = bandX0 + (ev.sec / CC_CLOCK.totalSec) * bandLen;
      const slotX = bandX0 + slotW * i + slotW / 2;
      const cls = ev.you ? "cc-you" : "";
      bandMarks += `
        <line x1="${x}" y1="${bandY - 12}" x2="${x}" y2="${bandY + 12}" class="cc-mark ${cls}"/>
        <line x1="${x}" y1="${bandY + 14}" x2="${slotX}" y2="${bandY + 42}" class="cc-leader ${cls}"/>
        <g class="cc-marklabel ${cls}" text-anchor="middle">
          <text x="${slotX}" y="${bandY + 64}" class="cc-mtime">${ev.emoji} ${ev.time}</text>
          <text x="${slotX}" y="${bandY + 86}" class="cc-mlabel">${ev.label}</text>
          <text x="${slotX}" y="${bandY + 105}" class="cc-mnote">${ev.note}</text>
        </g>`;
    });

    // ズーム誘導線（円環の23:52〜24:00 → 帯の両端）
    const [zx1, zy1] = pt(hr, R + 4);
    const [zx2, zy2] = pt(1, R + 4);

    return `
<svg viewBox="0 0 ${W} ${H}" class="cc-svg" role="img"
  aria-label="12月31日の24時間のうち、人類の歴史は最後の8分。文明は最後の25秒、あなたの人生は最後の0.2秒">
  <!-- 見出し -->
  <text x="${cx}" y="30" class="cc-h" text-anchor="middle">12月31日の24時間</text>

  <!-- 24時間円環 -->
  <circle cx="${cx}" cy="${cy}" r="${R}" class="cc-ring"/>
  ${ticks}
  <!-- 人類の出番（金の極細スライス） -->
  <path d="M ${cx} ${cy} L ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey} Z" class="cc-slice"/>
  <line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" class="cc-slice-edge"/>
  <text x="${cx}" y="${cy - 14}" class="cc-ringlabel" text-anchor="middle">人類の出番は</text>
  <text x="${cx}" y="${cy + 14}" class="cc-ringlabel-strong" text-anchor="middle">この金色の線だけ</text>
  <text x="${cx}" y="${cy + 40}" class="cc-ringlabel-sub" text-anchor="middle">（23:52〜24:00 の8分間）</text>

  <!-- ズーム誘導線 -->
  <line x1="${zx1}" y1="${zy1}" x2="${bandX0}" y2="${bandY - 16}" class="cc-zoomline"/>
  <line x1="${zx2}" y1="${zy2}" x2="${bandX1}" y2="${bandY - 16}" class="cc-zoomline"/>
  <text x="${cx}" y="${bandY - 60}" class="cc-h2" text-anchor="middle">その8分間を拡大すると……</text>

  <!-- 拡大タイムライン帯 -->
  <line x1="${bandX0}" y1="${bandY}" x2="${bandX1}" y2="${bandY}" class="cc-band"/>
  <line x1="${bandX0}" y1="${bandY}" x2="${bandX1}" y2="${bandY}" class="cc-band-gold"/>
  ${bandMarks}
</svg>`;
  }

  // reveal 対象を監視に追加（main.js の observer より後に足された分）
  if (window.__observeReveals) window.__observeReveals(host);
})();

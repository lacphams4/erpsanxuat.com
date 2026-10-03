// ---------------- the Trumbo family: Chị Gái (Part 2), Ba (Part 3) and Mẹ (Part 4) are the ones the kids rescue.
// They never fight. Shared by Part 2, 3 (inserted by the app's build-web.mjs) and Part 4 (make.py).
const FAM = ['sister', 'dad', 'mom'];
function drawFam(c, cx, by, who, f = 0) {
  shadow(c, cx, by, 14);
  if (who === 'dad') {
    R(c, cx - 5, by - 8, 4, 8, '#2a3a6a'); R(c, cx + 1, by - 8, 4, 8, '#2a3a6a'); R(c, cx - 6, by - 1, 5, 1, '#1a1a1a'); R(c, cx + 1, by - 1, 5, 1, '#1a1a1a');
    R(c, cx - 6, by - 19, 12, 11, '#2f8a7a'); R(c, cx - 6, by - 19, 12, 1, '#3aa892'); R(c, cx - 2, by - 19, 4, 2, '#e8f4f0'); R(c, cx - 6, by - 9, 12, 1, '#3a2a1a');
    R(c, cx - 8, by - 18, 2, 5, '#2f8a7a'); R(c, cx + 6, by - 18, 2, 5, '#2f8a7a'); R(c, cx - 8, by - 13, 2, 3, SK); R(c, cx + 6, by - 13 - f, 2, 3, SK);
    R(c, cx - 1, by - 20, 2, 1, SK); R(c, cx - 4, by - 28, 8, 8, SK);
    R(c, cx - 5, by - 30, 10, 3, '#1e1a1a'); R(c, cx - 5, by - 28, 1, 3, '#1e1a1a'); R(c, cx + 4, by - 28, 1, 3, '#1e1a1a');
    R(c, cx - 4, by - 25, 3, 1, '#2a2a2a'); R(c, cx + 1, by - 25, 3, 1, '#2a2a2a'); R(c, cx - 1, by - 25, 2, 1, '#2a2a2a');
    R(c, cx - 3, by - 24, 1, 1, OL); R(c, cx + 2, by - 24, 1, 1, OL); R(c, cx - 2, by - 22, 4, 1, '#3a2a2a');
  } else if (who === 'mom') {
    R(c, cx - 6, by - 29, 12, 13, '#2a1a1a'); R(c, cx - 7, by - 22, 2, 6, '#2a1a1a'); R(c, cx + 5, by - 22, 2, 6, '#2a1a1a');
    R(c, cx - 3, by - 3, 2, 3, SK); R(c, cx + 1, by - 3, 2, 3, SK); R(c, cx - 4, by - 1, 3, 1, '#c0304a'); R(c, cx + 1, by - 1, 3, 1, '#c0304a');
    for (let i = 0; i < 9; i++) { const w = 8 + Math.floor(i * 0.9) * 2; R(c, cx - w / 2, by - 12 + i, w, 1, i === 8 ? '#ff7a9a' : '#e8496a'); }
    R(c, cx - 4, by - 19, 8, 7, '#e8496a'); R(c, cx - 4, by - 13, 8, 1, '#ffd23f'); R(c, cx - 2, by - 19, 4, 1, '#fff4d0');
    R(c, cx - 6, by - 18, 2, 7, SK); R(c, cx + 4, by - 18 - f, 2, 7, SK);
    R(c, cx - 4, by - 27, 8, 8, SK); R(c, cx - 5, by - 29, 10, 3, '#2a1a1a'); R(c, cx - 5, by - 27, 1, 6, '#2a1a1a'); R(c, cx + 4, by - 27, 1, 6, '#2a1a1a');
    R(c, cx - 3, by - 24, 1, 2, OL); R(c, cx + 2, by - 24, 1, 2, OL); R(c, cx - 4, by - 25, 2, 1, OL); R(c, cx + 2, by - 25, 2, 1, OL);
    R(c, cx - 4, by - 22, 1, 1, '#ff9ec7'); R(c, cx + 3, by - 22, 1, 1, '#ff9ec7'); R(c, cx - 1, by - 21, 2, 1, '#e0305a');
    R(c, cx + 3, by - 30, 3, 3, '#ff7ab8'); R(c, cx + 4, by - 29, 1, 1, '#ffe066');
  } else {
    R(c, cx - 4, by - 6, 3, 6, '#4a2a6a'); R(c, cx + 1, by - 6, 3, 6, '#4a2a6a'); R(c, cx - 4, by - 1, 3, 1, '#fff'); R(c, cx + 1, by - 1, 3, 1, '#fff');
    R(c, cx - 5, by - 11, 10, 5, '#4a6ad8'); R(c, cx - 5, by - 7, 10, 1, '#3a58b8');
    R(c, cx - 5, by - 18, 10, 7, '#c77dff'); R(c, cx - 1, by - 16, 2, 2, '#ffe066');
    R(c, cx - 7, by - 17, 2, 7, SK); R(c, cx + 5, by - 17 - f, 2, 7, SK);
    R(c, cx - 5, by - 27, 10, 7, '#6b3a1e'); R(c, cx + 5, by - 26, 3, 8, '#6b3a1e'); R(c, cx + 4, by - 26, 1, 2, '#ff4d6d');
    R(c, cx - 4, by - 26, 8, 8, SK); R(c, cx - 4, by - 27, 8, 2, '#6b3a1e'); R(c, cx - 5, by - 26, 1, 4, '#6b3a1e');
    R(c, cx - 3, by - 23, 1, 2, OL); R(c, cx + 2, by - 23, 1, 2, OL); R(c, cx - 3, by - 21, 1, 1, '#ff9ec7'); R(c, cx + 2, by - 21, 1, 1, '#ff9ec7'); R(c, cx - 1, by - 20, 2, 1, '#c0405a');
  }
}
function famStamp(who, x, y, f = 0) { stamp(`fam|${who}|${f}`, 40, 44, 20, 38, Math.round(x - cam.x), Math.round(y - cam.y), (c, ax, ay) => drawFam(c, ax, ay, who, f)); }
// a captive family member: iron cage (Ác Quỷ) or a block of ice (Kỷ Băng Hà); o.open once the boss is beaten
function drawFamObj(o) {
  const cx = Math.round(o.x - cam.x), by = Math.round(o.y - cam.y), wave = o.open ? Math.floor(time * 4) % 2 : 0;
  famStamp(o.who, o.x, o.y, wave);
  if (o.open) { if (Math.floor(time * 2) % 2) { R(b, cx - 9, by - 40, 3, 3, '#ff7ab8'); R(b, cx + 7, by - 37, 3, 3, '#ff7ab8'); } return; }
  if (o.ice) {
    b.globalAlpha = 0.55; R(b, cx - 13, by - 36, 26, 38, '#a8d8f0'); b.globalAlpha = 0.85; R(b, cx - 13, by - 36, 26, 2, '#e8fbff'); R(b, cx - 11, by - 32, 2, 22, '#e8fbff'); R(b, cx + 8, by - 20, 2, 10, '#e8fbff'); R(b, cx - 13, by + 1, 26, 1, '#6a9ac0'); b.globalAlpha = 1;
  } else {
    R(b, cx - 15, by - 40, 30, 3, '#5a5a6a'); R(b, cx - 15, by + 1, 30, 3, '#5a5a6a'); for (let dx = -14; dx <= 12; dx += 5) R(b, cx + dx, by - 38, 2, 40, '#8a8a9a');
    b.globalAlpha = 0.25; R(b, cx - 15, by - 38, 30, 40, '#c77dff'); b.globalAlpha = 1; R(b, cx - 2, by - 20, 4, 4, '#ffd23f');
  }
}
function famOpen() {
  for (const o of objs) if (o.type === 'famCage' && !o.open) {
    o.open = true; SFX.gate(); shake = Math.max(shake, 6);
    addParts(o.x, o.y - 18, 30, o.ice ? ['#e8fbff', '#a8d8f0', '#fff'] : ['#ffe066', '#fff', '#ff9ec7'], 90, 0.9, -20);
  }
}
// family members waiting with the kids in some stages (FAM_AT: stage key -> who), standing beside the team
function famPlace(key) {
  const list = (typeof FAM_AT !== 'undefined' && FAM_AT[key]) || [], p = players[0];
  list.forEach((who, i) => objs.push({ type: 'fam', who, x: p.x - 30 - i * 18, y: p.y - 2 + (i % 2) * 6 }));
}

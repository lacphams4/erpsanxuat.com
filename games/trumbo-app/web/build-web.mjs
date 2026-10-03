// Builds the app's web content (www/) from the four standalone chapter games:
//   games/trump-po/index.html  -> ch1.html  (Chương 1: Đảo Rồng)
//   games/trumbo-2/index.html  -> ch2.html  (Chương 2: Thành Phố Bị Lãng Quên)
//   games/trumbo-3/index.html  -> ch3.html  (Chương 3: Thành Phố Thiên Đường)
//   games/trumbo-4/index.html  -> ch4.html  (Chương 4: Cỗ Máy Thời Gian)
// Each chapter gets: local font, app.js (navigation, touch controls, gamepads), a direct start from
// the home screen, and the story changes that join the four parts into one adventure with a real ending.
// Usage: node build-web.mjs [outDir]   (default: ../android/app/src/main/assets/www)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const games = join(here, '..', '..');
const out = process.argv[2] || join(here, '..', 'android', 'app', 'src', 'main', 'assets', 'www');
mkdirSync(join(out, 'fonts'), { recursive: true });
mkdirSync(join(out, 'art'), { recursive: true });

function rep(s, a, b, label) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`${label || a.slice(0, 60)}: expected 1 match, found ${n}`);
  return s.replace(a, () => b);
}
// switch-only hint texts become "PAD" texts (Switch or app): A / X / L/R / + / - buttons
function padHints(s) {
  const skip = /const FONT|const cv|mkCanvas|parts\.length|ambient\.length|reportError|'finale'/;
  return s.split('\n').map(l => (l.includes('NX ?') && !skip.test(l)) ? l.split('NX ?').join('PAD ?') : l).join('\n');
}

function common(s, n, title) {
  // page head: local font instead of Google Fonts, no zooming, chapter id for app.js
  s = s.replace(/<link rel="preconnect"[^>]*>\n/g, '');
  s = rep(s, '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=VT323&display=swap&subset=vietnamese">',
    "<style>@font-face{font-family:'VT323';src:url(fonts/VT323.ttf) format('truetype');font-display:block}@font-face{font-family:'TrumboCJK';src:url(fonts/cjk.woff2) format('woff2');unicode-range:U+2E80-9FFF,U+F900-FAFF,U+FE30-FE4F,U+FF00-FFEF;size-adjust:78%;font-display:block}</style>", 'font link');
  s = rep(s, '<html lang="vi">', `<html lang="vi" data-chapter="${n}">`);
  s = rep(s, '<meta name="viewport" content="width=device-width,initial-scale=1">', '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">');
  s = s.replace(/<title>[^<]*<\/title>/, `<title>TRUMBO - ${title}</title>`);
  s = rep(s, '<script>\n(() => {', '<script src="i18n.js"></script>\n<script src="app.js"></script>\n<script>\n(() => {', 'game script');
  // app mode flags
  const nx = "const NX = typeof Switch !== 'undefined' && typeof screen !== 'undefined' && typeof document === 'undefined';";
  s = rep(s, nx, nx + "\n// APP = started from the Android app / home screen: touch controls and Bluetooth gamepads arrive as gamepads\nconst APP = (!NX && globalThis.TRUMBO_APP) || null, PAD = NX || !!APP;\n// TR: translate a visible text (English / Chinese) and put in the players' chosen names; TRL: same for dialog lines\nconst TR = s => APP ? APP.tr(s) : s, TRL = ls => APP ? ls.map(l => Object.assign({}, l, { text: TR(l.text) })) : ls, CJK = /[\\u2e80-\\u9fff\\uff00-\\uffef]/;");
  s = rep(s, 'const hasFocus = () => NX || document.hasFocus();', 'const hasFocus = () => NX || !!APP || document.hasFocus();');
  s = rep(s, '  if (!NX || !navigator.getGamepads) return;\n  const pads = Array.from(navigator.getGamepads()).filter(Boolean);',
    '  if (!NX && !APP) return;\n  const pads = (APP ? APP.pads() : Array.from(navigator.getGamepads())).filter(Boolean);', 'pollPads');
  // the first animation frame can be stamped slightly before the page's start time: never let game time run backwards
  s = rep(s, 'const dt = Math.min(0.05, (now - last) / 1000);', 'const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));');
  s = padHints(s);
  // all visible text goes through TR; Chinese text wraps per character
  s = rep(s, '\n  if (banner) {\n', "\n  if (banner && state !== 'paused') {\n", 'banner under pause');
  s = s.replace("const FONT = NX ? 'VT323' : \"'VT323', ui-monospace, monospace\";", "const FONT = NX ? 'VT323' : \"'VT323', 'TrumboCJK', ui-monospace, monospace\";");
  s = rep(s, 'TQ.push([s, x, y, size, col, align, sh]);', 'TQ.push([TR(s), x, y, size, col, align, sh]);');
  s = rep(s, 'return g.measureText(s).width / S;', 'return g.measureText(TR(s)).width / S;');
  s = rep(s, "  const words = s.split(' '), lines = []; let cur = '';\n  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (measure(t, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }",
    "  s = TR(s);\n  const cj = CJK.test(s), words = cj ? s.match(/[\\u2e80-\\u9fff\\uff00-\\uffef]|[^\\s\\u2e80-\\u9fff\\uff00-\\uffef]+|\\s+/g) : s.split(' '), lines = []; let cur = '';\n  for (const w of words) { const t = cur ? cur + (cj ? '' : ' ') + w : w; if (measure(t, size) > maxW && cur.trim()) { lines.push(cur.trim()); cur = w.trim() ? w : ''; } else cur = t; }\n  if (cj && cur) cur = cur.trim();", 'wrap');
  s = s.replace(/dialog = \{ lines, i: 0/, 'dialog = { lines: TRL(lines), i: 0');
  s = rep(s, 'left -= ln.length + 1;', 'left -= ln.length + (CJK.test(L.text) ? 0 : 1);');
  s = s.split('${weaponName(p)}').join('${TR(weaponName(p))}');
  s = rep(s, "if (document.fonts) await document.fonts.load(\"16px 'VT323'\").catch(() => {});", "if (document.fonts) { await document.fonts.load(\"16px 'VT323'\").catch(() => {}); if (APP && APP.lang === 'zh') await document.fonts.load(\"16px 'TrumboCJK'\", '中').catch(() => {}); }");
  s = s.split("'Tay cầm 1 là Trump, tay cầm 2 là Poly'").join("(APP && APP.touch ? 'Nửa trái màn hình: Trump · nửa phải: Poly' : 'Tay cầm 1 là Trump, tay cầm 2 là Poly')");
  return s;
}
const appHooks = `Object.assign(APP, { gesture: initAudio, state: () => state, ac: () => AC, pause: () => { if (state === 'play') state = 'paused'; }, resume: () => { if (state === 'paused') state = 'play'; } });`;

// ---------------------------------------------------------------- Chương 1
function chapter1(s) {
  s = common(s, 1, 'Part 1');
  s = rep(s, "    case 'title':\n      playSong('title');", "    case 'title':\n      if (APP) { APP.home(); break; }\n      playSong('title');");
  s = rep(s, "      if (tap(['KeyQ'])) { state = 'title'; }", "      if (tap(['KeyQ'])) { state = 'title'; if (APP) APP.home(); }");
  s = rep(s, "      if (winT > 2 && tap(CONFIRM)) state = 'title';", "      if (winT > 2 && tap(CONFIRM)) { if (APP) { APP.save(1, null); APP.next(); } else state = 'title'; }");
  s = rep(s, "function showZoneBanner() {\n  state = 'play';", "function showZoneBanner() {\n  state = 'play';\n  if (APP) APP.save(1, { zi, totalT });");
  s = rep(s, 'function start(data) {\n', `function start(data) {
  if (APP) {
    ${appHooks}
    mode = APP.mode;
    const sv = APP.start === 'continue' ? APP.load(1) : null;
    if (sv && typeof sv.zi === 'number') data = { zi: sv.zi, mode, totalT: sv.totalT || 0 };
    else { startGame(); cv.focus(); requestAnimationFrame(frame); return; }
  }
`);
  // win screen: the dragon takes them "home"... (Chương 2 shows what happens on the way)
  s = rep(s, "T('Hai anh em Trump & Poly cưỡi rồng bay về nhà!', W / 2, 38, 11, '#fff', 'center', '#4a1f6a');",
    "T(APP ? 'HẾT PHẦN 1 - Hỏa Long Vương chở hai anh em và Pugi đi tìm gia đình...' : 'Hai anh em Trump & Poly cưỡi rồng bay về nhà!', W / 2, 38, 11, '#fff', 'center', '#4a1f6a');");
  s = rep(s, "T(PAD ? 'Nhấn A để chơi lại'", "T(APP ? 'Nhấn A để sang Phần 2' : PAD ? 'Nhấn A để chơi lại'");
  // the family story: the storm scatters the whole family; Part 1 ends with the kids saving an orphan dog, Pugi
  s = rep(s, `  { who: 'narr', text: 'Một buổi chiều, hai anh em Trump (11 tuổi) và Poly (6 tuổi) chèo thuyền ra biển chơi...' },
  { who: 'narr', text: 'Bỗng một cơn bão ập tới! Chiếc thuyền nhỏ bị sóng cuốn trôi, dạt vào một hòn đảo hoang.' },
  { who: 'poly', text: 'Anh Trump ơi... mình đang ở đâu vậy? Em hơi sợ...' },
  { who: 'trump', text: 'Đừng sợ Poly, có anh ở đây! Ơ... nhìn kìa, trên đỉnh núi có một con RỒNG khổng lồ!' },
  { who: 'poly', text: 'Rồng thật hả anh?! Đây là xứ sở rồng luôn!' },
  { who: 'narr', text: 'Truyền thuyết kể rằng: Hỏa Long Vương trên đỉnh núi đang giữ viên Ngọc La Bàn - thứ duy nhất chỉ được đường về nhà.' },
`, line('narr', 'Một buổi chiều, cả nhà Trumbo - Ba, Mẹ, Chị Gái, Trump (11 tuổi) và Poly (6 tuổi) - cùng đi thuyền ra biển chơi...') +
    line('narr', 'Bỗng một cơn bão ập tới! Sóng lớn đánh tan chiếc thuyền. Cả nhà bị cuốn đi mỗi người một ngả.') +
    line('narr', 'Khi tỉnh dậy, chỉ còn hai anh em nằm trên bãi cát của một hòn đảo hoang.') +
    line('poly', 'Anh Trump ơi... Ba, Mẹ với Chị đâu rồi? Em sợ quá...') +
    line('trump', 'Đừng sợ Poly, có anh ở đây! Mình nhất định sẽ tìm lại cả nhà. Ơ... nhìn kìa, trên đỉnh núi có một con RỒNG khổng lồ!') +
    line('poly', 'Rồng thật hả anh?! Đây là xứ sở rồng luôn!') +
    line('narr', 'Truyền thuyết kể rằng: Hỏa Long Vương trên đỉnh núi đang giữ viên Ngọc La Bàn - thứ chỉ được đường tới những người thân yêu.'), 'ch1 intro');
  const ea = s.indexOf('const ENDING = [\n'), ez = s.indexOf('\n];', ea);
  if (ea < 0 || ez < 0) throw new Error('ch1 ending');
  s = s.slice(0, ea) + 'const ENDING = [\n' +
    line('boss', 'Hừm... hai anh em thật dũng cảm, và biết thương nhau, bảo vệ nhau. Ta chịu thua!') +
    line('boss', 'Cầm lấy Ngọc La Bàn này. Nó sẽ chỉ đường tới gia đình các cháu.') +
    line('narr', 'Bỗng có tiếng rên ư ử sau một tảng đá. Một chú chó đen gầy nhom bị kẹt dưới đống đá vụn sau trận chiến!') +
    line('poly', 'Anh ơi, có bạn chó bị kẹt kìa! Tội nghiệp quá!') +
    line('trump', 'Poly, phụ anh đẩy tảng đá ra! Một, hai, ba... HÂY!') +
    line('narr', 'Chú chó được cứu. Nó không có nhà, cũng không có chủ. Trên chiếc vòng cổ cũ chỉ có một chữ: PUGI.') +
    line('poly', 'Bạn ấy cũng lạc mất gia đình giống tụi mình... Cho bạn ấy đi cùng nha anh!') +
    line('trump', 'Pugi, từ giờ mày đi với tụi anh nhé!') +
    line('boogie', 'Gâu! Gâu! (Pugi vẫy chiếc đuôi nhỏ)') +
    line('boss', 'Lên lưng ta nào, cả ba đứa! Ta sẽ chở các cháu đi tìm gia đình.') +
    line('poly', 'Yeee! Được cưỡi rồng luôn! Anh Trump giỏi quá!') +
    line('trump', 'Em cũng giỏi lắm Poly! Nhờ bong bóng của em mà anh mới đứng dậy được đó.').replace(/,\n$/, '') + s.slice(ez);
  // Pugi: the dog from Part 2 (same drawing), in the dialog box and riding the dragon on the win screen
  const d2 = readFileSync(join(games, 'trumbo-2', 'index.html'), 'utf8'), da = d2.indexOf('function drawDog('), dz = d2.indexOf('\n}\n', da) + 3;
  s = rep(s, 'function drawPortrait(who, x, y) {', d2.slice(da, dz).replace("upg.collar > 0 ? '#c8cedc' : '#e63946'", "'#e63946'") + 'function drawPortrait(who, x, y) {');
  s = rep(s, "  if (who === 'boss') {\n    drawBoss(pc, 32, 44,", "  if (who === 'boogie') { R(b, x + 1, y + 1, 34, 34, '#5a3a20'); R(b, x + 1, y + 24, 34, 11, '#8a5a33'); drawDog(pc, 20, 30, { face: 1, flash: 0, moving: false, barkT: Math.floor(time * 4) % 2 ? 0.2 : 0, biteT: 0, anim: 0 }, { noShadow: true }); b.drawImage(portraitCan, 20, 6, 18, 18, x, y, 36, 36); }\n  else if (who === 'boss') {\n    drawBoss(pc, 32, 44,");
  s = rep(s, "boss: ['HỎA LONG VƯƠNG', '#ff9aa2'], narr:", "boss: ['HỎA LONG VƯƠNG', '#ff9aa2'], boogie: ['PUGI', '#8fd6ff'], narr:");
  s = rep(s, "  drawKid(b, x + 8, y - 24, 'poly', 'left', 0, { noShadow: true });", "  drawKid(b, x + 8, y - 24, 'poly', 'left', 0, { noShadow: true });\n  if (APP) drawDog(b, x + 22, y - 22, { face: -1, flash: 0, moving: false, barkT: 0, biteT: 0, anim: 0 }, { noShadow: true });");
  return s;
}

// ---------------------------------------------------------------- Chương 2 and 3 (same engine)
function engine23(s, n) {
  s = common(s, n, `Part ${n}`);
  s = rep(s, "    case 'title': {", "    case 'title': {\n      if (APP) { APP.home(); break; }");
  s = rep(s, "if (tap(['KeyQ'])) { save(); saveData = loadSave(); state = 'title'; menuSel = 0; }", "if (tap(['KeyQ'])) { save(); saveData = loadSave(); state = 'title'; menuSel = 0; if (APP) APP.home(); }");
  s = rep(s, "case 'end': endT += dt; if (endT > 6 && tap(CONFIRM)) { saveData = null; state = 'title'; menuSel = 0; } break;",
    "case 'end': endT += dt; if (endT > 6 && tap(CONFIRM)) { saveData = null; if (APP) { clearSave(); APP.next(); } else { state = 'title'; menuSel = 0; } } break;");
  s = rep(s, 'loadFonts().finally(() => { if (!NX) cv.focus(); requestAnimationFrame(frame); });', `// started from the app's home screen: skip the title and go straight into the chapter
function appStart() {
  ${appHooks}
  mode = APP.mode;
  if (APP.start === 'continue' && saveData) continueGame(saveData); else newGame();
  mode = APP.mode; players[1].ai = mode === 1;
}
loadFonts().finally(() => { if (!NX) cv.focus(); if (APP) appStart(); requestAnimationFrame(frame); });`);
  return s;
}
function line(who, text, extra = '') { return `    { who: '${who}', text: '${text.replace(/'/g, "\\'")}'${extra} },\n`; }

// the family (games/trumbo-4/family.js): sprites, cages and helpers for Chị Gái, Ba and Mẹ; famAt = stage key -> who waits there
const FAMJS = readFileSync(join(games, 'trumbo-4', 'family.js'), 'utf8');
function family(s, famAt) {
  s = rep(s, 'function drawPortrait(who, x, y) {', FAMJS + `const FAM_AT = ${JSON.stringify(famAt)};\nfunction drawPortrait(who, x, y) {`);
  s = rep(s, "  if (B.dead) {\n    B.deadT += dt;", "  if (B.dead) {\n    if (B.deadT > 1.2) famOpen();\n    B.deadT += dt;");
  return s;
}
// replace a whole dialog block `key: [ ... ]` of the DLG table
function dlg(s, key, lines) {
  const a = s.indexOf(`  ${key}: [\n`), z = s.indexOf('\n  ]', a);
  if (a < 0 || z < 0) throw new Error('dialog ' + key);
  return s.slice(0, a) + `  ${key}: [\n` + lines.map(l => line(...l)).join('').replace(/,\n$/, '') + s.slice(z);
}

function chapter2(s) {
  s = engine23(s, 2);
  s = family(s, {});
  s = rep(s, "  const bg = { trump: ['#2c5fa8', '#3a7bd5'], poly: ['#3e9a44', '#5cc15c'], boogie: ['#5a3a20', '#8a5a33'], smith: ['#5a2a1a', '#8a3a1a'], demon: ['#3a0a2a', '#6a0a2a'] }[who];",
    "  const bg = { trump: ['#2c5fa8', '#3a7bd5'], poly: ['#3e9a44', '#5cc15c'], boogie: ['#5a3a20', '#8a5a33'], smith: ['#5a2a1a', '#8a3a1a'], demon: ['#3a0a2a', '#6a0a2a'], sister: ['#8a4ab0', '#c77dff'] }[who];\n  if (FAM.includes(who)) { R(b, x, y, 36, 36, '#f4e3c1'); R(b, x + 1, y + 1, 34, 34, bg[0]); R(b, x + 1, y + 24, 34, 11, bg[1]); drawFam(pc, 20, 34, who); b.drawImage(portraitCan, 11, 4, 18, 18, x, y, 36, 36); return; }");
  s = rep(s, "demon: ['ÁC QUỶ', '#c77dff'], narr: ['', '#fff'] }[L.who];", "demon: ['ÁC QUỶ', '#c77dff'], sister: ['CHỊ GÁI', '#d9a0ff'], narr: ['', '#fff'] }[L.who];");
  s = rep(s, "objs.push({ type: 'throne', x: 10 * 16, y: 6 * 16 + 8 }); }", "objs.push({ type: 'throne', x: 10 * 16, y: 6 * 16 + 8 }); if (APP) objs.push({ type: 'famCage', who: 'sister', x: 16 * 16, y: 8 * 16, open: false }); }");
  s = rep(s, "['obelisk', 'smith', 'anvil', 'forgefire'].includes(o.type)", "['obelisk', 'smith', 'anvil', 'forgefire', 'famCage'].includes(o.type)");
  s = rep(s, "    case 'throne': {", "    case 'famCage': drawFamObj(o); break;\n    case 'throne': {");
  // the dragon is flying the kids and Pugi to their big sister when the Demon's storm hits
  s = dlg(s, 'intro', [
    ['narr', 'Hỏa Long Vương chở Trump, Poly và Pugi bay qua biển mây. Ngọc La Bàn chỉ về phía một thành phố xa xa.'],
    ['poly', 'Anh ơi, la bàn đang chỉ đường tới chỗ Chị đó!'],
    ['narr', 'Bỗng một cơn bão đen kịt ập tới. Ngọc La Bàn tối sầm lại, chiếc kim quay loạn xạ!'],
    ['narr', 'Một luồng gió đen quật trúng cánh rồng. Hỏa Long Vương cố hết sức hạ cánh xuống một thành phố xa lạ.'],
    ['narr', 'Rồng bị thương, phải bay về núi lửa chữa thương. Trước khi đi, rồng hứa: "Ta nhất định sẽ quay lại đón các cháu!"'],
    ['narr', 'Trước mắt ba người là một thành phố bỏ hoang. Những tòa nhà đổ nát, đường phố vắng tanh, không một bóng người.'],
    ['boogie', 'Gâu! Gâu! (Pugi đánh hơi thấy gì đó trên mặt đất)'],
    ['poly', 'Cái kẹp tóc hình ngôi sao này... là của Chị!'],
    ['trump', 'Chị đã ở đây! Pugi, mình đi tìm Chị nào!'],
    ['narr', 'RẦM... Một cánh cổng khổng lồ từ từ mở ra. Cuộc phiêu lưu mới bắt đầu!'],
    ['narr', 'Lần này hai anh em có thêm vũ khí, và có thể nâng cấp vũ khí bằng xu nhặt được trên đường.'],
    ['narr', 'Pugi không biết chữa thương, nhưng rất giỏi CẮN, SỦA và NHỬ kẻ địch.'],
    ['trump', 'Cánh cổng ra khỏi thành phố có 5 cái lỗ hình viên ngọc. Mình phải tìm đủ 5 viên ngọc!']]);
  s = dlg(s, 'demon', [
    ['narr', 'Sau cánh cửa cuối cùng là một lâu đài khổng lồ. Trên ngai vàng là ÁC QUỶ.'],
    ['narr', 'Bên cạnh ngai vàng là một chiếc lồng sắt. Trong lồng là... CHỊ GÁI!'],
    ['sister', 'Trump! Poly! Chị ở đây!'],
    ['poly', 'Chị ơi!!!'],
    ['demon', 'Các ngươi đã vượt qua thành phố, sa mạc và 18 tầng địa ngục.'],
    ['demon', 'Chính ta đã gọi cơn bão đen và yểm lời nguyền lên Ngọc La Bàn. Muốn cứu cô ta, hãy đánh bại ta!'],
    ['trump', 'Pugi nhử nó! Poly bắn từ xa! Anh đánh gần! Mình cứu Chị!'],
    ['boogie', 'GÂU GÂU!']]);
  s = dlg(s, 'ending', [
    ['narr', 'Ác Quỷ hét lên một tiếng rồi tan biến thành làn khói đen.'],
    ['demon', 'Ta... sẽ... quay lại...'],
    ['narr', 'Chiếc lồng sắt bật mở. Chị Gái chạy ào tới ôm chầm lấy hai em.'],
    ['sister', 'Trump! Poly! Hai đứa giỏi quá! Chị biết thế nào hai đứa cũng tới mà.'],
    ['poly', 'Chị ơi, em nhớ chị lắm!'],
    ['sister', 'Ơ, còn bạn chó dễ thương này là ai vậy?'],
    ['trump', 'Pugi đó chị! Tụi em cứu Pugi ở Đảo Rồng. Pugi giúp tụi em nhiều lắm.'],
    ['boogie', 'Gâu!'],
    ['sister', 'Chị nghe Ác Quỷ nói... hắn còn bắt Ba đi tới một nơi rất xa, trên những tầng mây.'],
    ['sister', 'Chị không biết đánh nhau, nhưng chị sẽ đi cùng hai đứa. Mình đi tìm Ba!'],
    ['narr', 'Ngọc La Bàn khẽ lóe sáng rồi lại mờ đi. Lời nguyền vẫn chưa được phá hết.'],
    ['narr', 'Cánh cửa phía sau ngai vàng từ từ mở ra...'],
    ['trump', '(cầm vũ khí lên) Đi thôi. Ba đang chờ mình.'],
    ['narr', 'Cả bốn người bước qua cánh cửa.']]);
  s = rep(s, "T('TO BE CONTINUED...', W / 2, 46, 26, '#ffd23f', 'center', '#7a1f5a');", "T(APP ? 'HẾT PHẦN 2' : 'TO BE CONTINUED...', W / 2, 46, 26, '#ffd23f', 'center', '#7a1f5a');");
  s = rep(s, "T(PAD ? 'Nhấn A để về màn hình chính'", "T(APP ? 'Nhấn A để sang Phần 3' : PAD ? 'Nhấn A để về màn hình chính'");
  return s;
}

function chapter3(s) {
  s = engine23(s, 3);
  // Chị Gái travels with the kids (waits in safe places); Ba is the Super Demon's prisoner
  s = family(s, { beach: ['sister'], beach2: ['sister'], temple: ['sister'], temple2: ['sister'], finale: ['dad', 'sister'] });
  s = rep(s, "function drawNpc(c, cx, by, who, ph = 0) {\n  shadow(c, cx, by, 12);", "function drawNpc(c, cx, by, who, ph = 0) {\n  if (FAM.includes(who)) return drawFam(c, cx, by, who);\n  shadow(c, cx, by, 12);");
  s = rep(s, "b.drawImage(portraitCan, 11, who === 'shadow' ? 0 : 7,", "b.drawImage(portraitCan, 11, who === 'shadow' ? 0 : FAM.includes(who) ? 4 : 7,");
  s = rep(s, "citizen: ['#e8f0ff', '#ffe8a0'] }[who]", "citizen: ['#e8f0ff', '#ffe8a0'], sister: ['#8a4ab0', '#c77dff'], dad: ['#2a6a5a', '#3aa892'], mom: ['#b0304a', '#ff9ec7'] }[who]");
  s = rep(s, "shadow: ['???', '#ff4d4d'], narr: ['', '#fff'] }[L.who];", "shadow: ['???', '#ff4d4d'], sister: ['CHỊ GÁI', '#d9a0ff'], dad: ['BA', '#7ee0c8'], mom: ['MẸ', '#ff9ec7'], narr: ['', '#fff'] }[L.who];");
  s = rep(s, "'crystal', 'totem', 'queenCage'].includes(o.type)", "'crystal', 'totem', 'queenCage', 'fam', 'famCage'].includes(o.type)");
  s = rep(s, "    case 'queenCage': {", "    case 'fam': famStamp(o.who, o.x, o.y); break;\n    case 'famCage': drawFamObj(o); break;\n    case 'queenCage': {");
  s = rep(s, "  buildStage(st);\n  if (st.type === 'scene')", "  buildStage(st);\n  famPlace(st.key);\n  if (st.type === 'scene')");
  s = rep(s, "objs.push({ type: 'throne', x: 10 * 16, y: 4 * 16 + 8 }); }", "objs.push({ type: 'throne', x: 10 * 16, y: 4 * 16 + 8 }); objs.push({ type: 'famCage', who: 'dad', x: 284, y: 140, open: false }); }");
  s = dlg(s, 'intro', [
    ['narr', 'Trump, Poly, Pugi và Chị Gái bước qua cánh cổng bí ẩn sau ngai vàng của Ác Quỷ...'],
    ['narr', 'Một luồng sáng trắng xóa. Khi mở mắt ra, cả bốn người đang đứng trên một bãi biển xa lạ.'],
    ['poly', 'Anh ơi, biển đẹp quá! Mà... đây lại là đâu nữa vậy?'],
    ['sister', 'Ngọc La Bàn chỉ về phía những tầng mây kia. Ba đang ở đó!'],
    ['narr', 'Chị Gái không biết đánh nhau, nên chị chờ ở những nơi an toàn và cổ vũ hai em.'],
    ['boogie', 'Gâu! Gâu! (Pugi đánh hơi về phía một ông lão đang ngồi câu cá)'],
    ['trump', 'Có người kìa! Mình ra hỏi đường thử nha.']]);
  s = rep(s, "    { who: 'queen', text: 'Ác Quỷ đã trở lại, mạnh hơn trước rất nhiều. Hắn đang ẩn náu ở lãnh địa của hắn.' },\n",
    "    { who: 'queen', text: 'Ác Quỷ đã trở lại, mạnh hơn trước rất nhiều. Hắn đang ẩn náu ở lãnh địa của hắn.' },\n" +
    line('queen', 'Ta biết chuyện của Ba các ngươi. Ác Quỷ đang giam ông ấy trong lãnh địa của hắn.') +
    line('queen', 'Lời nguyền trên Ngọc La Bàn của các ngươi cũng do hắn yểm. Đánh bại hắn, la bàn sẽ lại chỉ đường.'));
  s = dlg(s, 'sdemon', [
    ['narr', 'Một cánh cửa khổng lồ mở ra. Ác Quỷ xuất hiện, cơ thể khổng lồ, tay cầm một thanh kiếm khổng lồ.'],
    ['narr', 'Trong góc lâu đài là một chiếc lồng sắt. Trong lồng là... BA!'],
    ['dad', 'Trump! Poly! Cẩn thận, hắn rất mạnh!'],
    ['poly', 'Ba ơi!!!'],
    ['demon', 'Các ngươi tưởng ta đã bị tiêu diệt sao?'],
    ['demon', 'Lần này các ngươi sẽ không thắng được ta!'],
    ['trump', 'Trump dùng kiếm, Poly bắn từ xa, Pugi chiến đấu bên cạnh! Mình cứu Ba!'],
    ['boogie', 'GRRR... GÂU!!!']]);
  s = dlg(s, 'sdemonEnd', [
    ['narr', 'Pugi thu hút Ác Quỷ. Trump và Poly cùng tấn công... BOOOOOOM!!!'],
    ['narr', 'Ác Quỷ bị đánh bại. Thanh kiếm khổng lồ vỡ tan thành ngàn mảnh sáng.'],
    ['narr', 'Chiếc lồng sắt bật mở. Ba chạy tới ôm chặt hai anh em.'],
    ['dad', 'Các con của Ba! Ba tự hào về các con lắm.'],
    ['poly', 'Ba ơi, con nhớ Ba lắm!'],
    ['dad', 'Cả chú chó dũng cảm này nữa. Cảm ơn con, Pugi!'],
    ['boogie', 'Gâu! Gâu!']]);
  // the ending leads into Part 4: Mẹ was carried out of their own time
  s = dlg(s, 'ending', [
    ['narr', 'Cả nhà trở lại Thành Phố Thiên Đường. Chị Gái chạy ra ôm chầm lấy Ba. Người dân reo hò vang trời.'],
    ['queen', 'Cảm ơn các ngươi. Thành phố này mãi mãi biết ơn ba vị anh hùng nhỏ tuổi.'],
    ['trump', '(nhìn Pugi) Nếu không có mày, chắc anh em mình thua rồi.'],
    ['boogie', 'Gâu!'],
    ['poly', 'Có pháo hoa kìa! Đẹp quá!'],
    ['dad', 'Giờ chỉ còn Mẹ. Mẹ đang ở đâu vậy nhỉ?'],
    ['narr', 'Lời nguyền tan biến. Ngọc La Bàn sáng lên... nhưng chiếc kim cứ quay tròn mãi, không chịu dừng lại.'],
    ['narr', 'GRÀOOO! Hỏa Long Vương quay lại đúng như lời hứa. Nhưng rồng lắc đầu buồn bã.'],
    ['narr', 'Rồng có thể bay qua biển mây, nhưng không thể bay xuyên qua thời gian.'],
    ['trump', 'Xuyên qua thời gian? Ý ông Rồng là sao ạ?'],
    ['queen', 'Cơn bão đen của Ác Quỷ đã cuốn Mẹ các ngươi đi rất xa, xa khỏi cả thời gian của chính các ngươi.'],
    ['queen', 'Vì thế la bàn không tìm thấy Mẹ, cũng không tìm ra đường về nhà.'],
    ['poly', 'Vậy... tụi con không tìm được Mẹ nữa sao?'],
    ['queen', 'Đừng lo. Ta biết một con đường có thể đưa các ngươi tới chỗ Mẹ, rồi trở về nhà.'],
    ['boogie', 'Gâu?']]);
  // the night scene shows the glowing Compass Orb instead of the old shadow figure
  s = rep(s, "if (darkK > 0.6) stamp('npc|shadow|0', 40, 44, 20, 38, W / 2, H / 2 + 6, (c, ax, ay) => drawNpc(c, ax, ay, 'shadow'));",
    "if (darkK > 0.6) { const f = Math.floor(time * 3) % 2; stamp('orb|' + f, 40, 40, 20, 20, W / 2, H / 2 - 6, (c, ax, ay) => drawOrb(c, ax, ay, f)); }");
  s = rep(s, 'function drawEnd() {', `// Ngọc La Bàn (the Compass Orb from Chương 1): gold rim, blue glass, needle turning to a new direction
function drawOrb(c, cx, cy, f) {
  for (let y = -10; y <= 10; y++) { const w = Math.round(Math.sqrt(100 - y * y)); R(c, cx - w, cy + y, w * 2, 1, '#c08a2a'); }
  for (let y = -8; y <= 8; y++) { const w = Math.round(Math.sqrt(64 - y * y)); R(c, cx - w, cy + y, w * 2, 1, '#2a6ab0'); }
  for (let y = -6; y <= 2; y++) { const w = Math.round(Math.sqrt(Math.max(0, 36 - (y + 2) * (y + 2))) * 0.8); R(c, cx - w - 1, cy + y, w, 1, '#4dd2ff'); }
  R(c, cx - 4, cy - 6, 2, 2, '#e8fbff');
  for (let i = 0; i < 7; i++) R(c, cx + i, cy - Math.round(i * 0.6), 1, 1, i > 3 ? '#ff4d6d' : '#fff');
  R(c, cx - 1, cy - 1, 2, 2, '#ffd23f');
  const glow = f ? '#fff8c0' : '#ffe066';
  for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2 + f * 0.2, r = 14 + (a % 2) * 2; R(c, Math.round(cx + Math.cos(an) * r), Math.round(cy + Math.sin(an) * r), 1, 1, glow); }
}
function drawEnd() {
  if (APP) { drawFinalCard(); return; }`);
  s = rep(s, 'function drawShop() {', `// last screen of the whole adventure
function drawFinalCard() {
  R(b, 0, 0, W, H, '#07040f');
  for (let i = 0; i < 46; i++) { const tw = (Math.floor(time * 2 + i) % 7) === 0; R(b, (i * 73 + 11) % W, (i * 37 + 5) % 92, 1, 1, tw ? '#fff' : i % 4 ? '#5a4a8a' : '#c9b8e8'); }
  if (endT > 0.5) stamp('orb|' + (Math.floor(time * 3) % 2), 40, 40, 20, 20, W / 2, 28, (c, ax, ay) => drawOrb(c, ax, ay, Math.floor(time * 3) % 2));
  if (endT > 1) T('HẾT PHẦN 3', W / 2, 52, 26, '#ffd23f', 'center', '#7a1f5a');
  if (endT > 1.8) T('CUỘC PHIÊU LƯU ANH EM NHÀ TRUMBO', W / 2, 80, 11, '#fff', 'center', '#4a1f6a');
  if (endT > 2.8) wrap('Đã cứu được Ba! Nhưng Mẹ vẫn đang lạc ở một thời đại xa xôi...', 270, 10).forEach((l, i) => T(l, W / 2, 98 + i * 11, 10, '#e8dcff', 'center'));
  if (endT > 6 && Math.floor(time * 2) % 2) T(PAD ? 'Nhấn A để sang Phần 4' : 'Nhấn ENTER để sang Phần 4', W / 2, 140, 10, '#fff', 'center', null);
}
function drawShop() {`);
  return s;
}

// Phần 4 (games/trumbo-4 is generated from Part 3 by its make.py): the last chapter, its THE END card goes back home
function chapter4(s) {
  s = engine23(s, 4);
  s = rep(s, "Ý tưởng và kịch bản: Trump  ·  Cảm ơn bạn đã chơi!", 'Ý tưởng và kịch bản: @AUTHOR@  ·  Cảm ơn bạn đã chơi!');
  return s;
}

const SRC = { 1: 'trump-po', 2: 'trumbo-2', 3: 'trumbo-3', 4: 'trumbo-4' };
const FN = { 1: chapter1, 2: chapter2, 3: chapter3, 4: chapter4 };
for (const n of [1, 2, 3, 4]) {
  const src = readFileSync(join(games, SRC[n], 'index.html'), 'utf8');
  writeFileSync(join(out, `ch${n}.html`), FN[n](src));
  console.log(`ch${n}.html`);
}
// translations: i18n/en.json and i18n/zh.json (keys are the Vietnamese originals) -> one script
const dict = {};
for (const l of ['en', 'zh']) { const f = join(here, 'i18n', `${l}.json`); dict[l] = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {}; }
writeFileSync(join(out, 'i18n.js'), `// generated by build-web.mjs from i18n/*.json\nwindow.TRUMBO_I18N = ${JSON.stringify(dict)};\n`);
for (const f of ['cjk.woff2', 'FusionPixel-OFL.txt']) if (existsSync(join(here, 'fonts', f))) copyFileSync(join(here, 'fonts', f), join(out, 'fonts', f));
for (const f of ['index.html', 'app.js', 'privacy.html']) if (existsSync(join(here, f))) copyFileSync(join(here, f), join(out, f));
const font = join(games, 'trumbo-3', 'switch', 'romfs');
copyFileSync(join(font, 'VT323.ttf'), join(out, 'fonts', 'VT323.ttf'));
copyFileSync(join(font, 'OFL.txt'), join(out, 'fonts', 'OFL.txt'));
if (existsSync(join(here, 'art'))) for (const f of readdirSync(join(here, 'art'))) copyFileSync(join(here, 'art', f), join(out, 'art', f));
console.log('www ->', out);

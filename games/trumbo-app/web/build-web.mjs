// Builds the app's web content (www/) from the three standalone chapter games:
//   games/trump-po/index.html  -> ch1.html  (Chương 1: Đảo Rồng)
//   games/trumbo-2/index.html  -> ch2.html  (Chương 2: Thành Phố Bị Lãng Quên)
//   games/trumbo-3/index.html  -> ch3.html  (Chương 3: Thành Phố Thiên Đường)
// Each chapter gets: local font, app.js (navigation, touch controls, gamepads), a direct start from
// the home screen, and the story changes that join the three parts into one adventure with a real ending.
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
    "T(APP ? 'HẾT PHẦN 1 - Hỏa Long Vương chở hai anh em bay về nhà...' : 'Hai anh em Trump & Poly cưỡi rồng bay về nhà!', W / 2, 38, 11, '#fff', 'center', '#4a1f6a');");
  s = rep(s, "T(PAD ? 'Nhấn A để chơi lại'", "T(APP ? 'Nhấn A để sang Phần 2' : PAD ? 'Nhấn A để chơi lại'");
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

function chapter2(s) {
  s = engine23(s, 2);
  // the dragon never made it home: the Demon's storm cursed the Compass Orb
  s = rep(s, `    { who: 'narr', text: 'Hỏa Long Vương chở Trump và Poly bay qua biển mây. Hai anh em tưởng rằng cuối cùng cũng được về nhà...' },
    { who: 'narr', text: 'Nhưng khi rồng hạ xuống, trước mắt họ lại là một thành phố bỏ hoang.' },
    { who: 'narr', text: 'Những tòa nhà đổ nát, đường phố vắng tanh. Không một bóng người.' },
    { who: 'trump', text: 'Đây không phải nhà mình.' },
`, line('narr', 'Hỏa Long Vương chở Trump và Poly bay qua biển mây. Hai anh em tưởng rằng cuối cùng cũng được về nhà...') +
    line('narr', 'Bỗng một cơn bão đen kịt ập tới. Ngọc La Bàn tối sầm lại, chiếc kim quay loạn xạ!') +
    line('narr', 'Một luồng gió đen quật trúng cánh rồng. Hỏa Long Vương cố hết sức hạ cánh xuống một thành phố xa lạ.') +
    line('narr', 'Rồng bị thương, phải bay về núi lửa chữa thương. Trước khi đi, rồng hứa: "Ta nhất định sẽ quay lại đón các cháu!"') +
    line('narr', 'Trước mắt hai anh em là một thành phố bỏ hoang. Những tòa nhà đổ nát, đường phố vắng tanh, không một bóng người.') +
    line('trump', 'Đây không phải nhà mình. La bàn cũng không chỉ đường nữa...'), 'ch2 intro');
  s = rep(s, "    { who: 'demon', text: 'Các ngươi đã vượt qua thành phố, sa mạc và 18 tầng địa ngục.' },\n",
    "    { who: 'demon', text: 'Các ngươi đã vượt qua thành phố, sa mạc và 18 tầng địa ngục.' },\n" +
    line('demon', 'Chính ta đã yểm lời nguyền lên Ngọc La Bàn. Chừng nào ta còn đây, các ngươi đừng hòng về nhà!'));
  s = rep(s, "    { who: 'narr', text: 'Ác Quỷ hét lên một tiếng rồi tan biến thành làn khói đen.' },\n",
    "    { who: 'narr', text: 'Ác Quỷ hét lên một tiếng rồi tan biến thành làn khói đen.' },\n" +
    line('demon', 'Ta... sẽ... quay lại...') +
    line('narr', 'Ngọc La Bàn khẽ lóe sáng rồi lại mờ đi. Lời nguyền vẫn chưa được phá hết.'));
  s = rep(s, "T('TO BE CONTINUED...', W / 2, 46, 26, '#ffd23f', 'center', '#7a1f5a');", "T(APP ? 'HẾT PHẦN 2' : 'TO BE CONTINUED...', W / 2, 46, 26, '#ffd23f', 'center', '#7a1f5a');");
  s = rep(s, "T(PAD ? 'Nhấn A để về màn hình chính'", "T(APP ? 'Nhấn A để sang Phần 3' : PAD ? 'Nhấn A để về màn hình chính'");
  return s;
}

function chapter3(s) {
  s = engine23(s, 3);
  s = rep(s, "    { who: 'narr', text: 'Sau những sự kiện ở Phần 2, Trump, Poly và Pugi bước qua cánh cổng bí ẩn sau ngai vàng của Ác Quỷ...' },\n",
    line('narr', 'Trump, Poly và Pugi bước qua cánh cổng bí ẩn sau ngai vàng của Ác Quỷ...'));
  s = rep(s, "    { who: 'queen', text: 'Ác Quỷ đã trở lại, mạnh hơn trước rất nhiều. Hắn đang ẩn náu ở lãnh địa của hắn.' },\n",
    "    { who: 'queen', text: 'Ác Quỷ đã trở lại, mạnh hơn trước rất nhiều. Hắn đang ẩn náu ở lãnh địa của hắn.' },\n" +
    line('queen', 'Lời nguyền trên Ngọc La Bàn của các ngươi cũng do hắn yểm. Đánh bại hắn, la bàn sẽ lại chỉ đường về nhà.'));
  // a real ending: the curse breaks, the dragon keeps its promise, everyone goes home (with a small hint of more to come)
  const a = s.indexOf('  ending: [\n'), z = s.indexOf('\n  ]\n};', a);
  if (a < 0 || z < 0) throw new Error('ch3 ending block');
  s = s.slice(0, a) + '  ending: [\n' +
    line('narr', 'Trump, Poly và Pugi trở lại Thành Phố Thiên Đường. Người dân reo hò vang trời.') +
    line('queen', 'Cảm ơn các ngươi. Thành phố này mãi mãi biết ơn ba vị anh hùng nhỏ tuổi.') +
    line('trump', '(nhìn Pugi) Nếu không có mày, chắc anh em mình thua rồi.') +
    line('boogie', 'Gâu!') +
    line('poly', 'Có pháo hoa kìa! Đẹp quá!') +
    line('queen', 'Ác Quỷ đã bị tiêu diệt, lời nguyền của hắn cũng tan biến. Các ngươi xem Ngọc La Bàn kìa.') +
    line('narr', 'Ngọc La Bàn bỗng sáng rực. Lần đầu tiên sau bao lâu, chiếc kim chỉ thẳng về một hướng: NHÀ.') +
    line('trump', 'Hóa ra suốt thời gian qua, lời nguyền của Ác Quỷ làm la bàn chỉ sai đường!') +
    line('narr', 'GRÀOOO! Trên mây cao vang lên một tiếng gầm quen thuộc. Hỏa Long Vương đã quay lại, đúng như lời hứa.') +
    line('poly', 'Ông Rồng! Mình được về nhà thật rồi!') +
    line('trump', 'Pugi, về nhà với tụi anh nhé. Từ nay mày là thành viên của gia đình mình!') +
    line('boogie', 'GÂU GÂU! (Pugi vẫy đuôi rối rít)') +
    line('narr', 'Rồng chở ba người bay qua biển mây. Ngôi nhà thân yêu hiện ra, bố mẹ chạy ra ôm chầm lấy hai anh em.') +
    line('narr', 'Đêm hôm đó, cả nhà ngủ thật ngon. Trên kệ sách, Ngọc La Bàn khẽ chớp sáng...', ', dark: true') +
    line('narr', 'Chiếc kim từ từ xoay sang một hướng mới. Pugi ngẩng đầu lên, khẽ "gâu" một tiếng...', ', dark: true').replace(/,\n$/, '') +
    s.slice(z);
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
  if (endT > 1) T('HẾT', W / 2, 52, 26, '#ffd23f', 'center', '#7a1f5a');
  if (endT > 1.8) T('CUỘC PHIÊU LƯU ANH EM NHÀ TRUMBO', W / 2, 80, 11, '#fff', 'center', '#4a1f6a');
  if (endT > 2.8) wrap('Ba anh em đã về nhà an toàn. Nhưng Ngọc La Bàn vẫn đang chỉ về một nơi rất xa...', 270, 10).forEach((l, i) => T(l, W / 2, 98 + i * 11, 10, '#e8dcff', 'center'));
  if (endT > 4) T('Ý tưởng và kịch bản: @AUTHOR@  ·  Cảm ơn bạn đã chơi!', W / 2, 128, 9, '#8fd6ff', 'center', null);
  if (endT > 6 && Math.floor(time * 2) % 2) T(PAD ? 'Nhấn A để về màn hình chính' : 'Nhấn ENTER để về màn hình chính', W / 2, 152, 10, '#fff', 'center', null);
}
function drawShop() {`);
  return s;
}

const SRC = { 1: 'trump-po', 2: 'trumbo-2', 3: 'trumbo-3' };
const FN = { 1: chapter1, 2: chapter2, 3: chapter3 };
for (const n of [1, 2, 3]) {
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

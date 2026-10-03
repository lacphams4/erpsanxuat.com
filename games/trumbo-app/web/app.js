// Anh Em Nhà Trumbo - app runtime shared by the home screen and the three chapter pages.
// - progress: which chapters are unlocked, current chapter, 1 or 2 players
// - chapter navigation (home, next chapter) and per-chapter saves
// - on-screen touch controls that act as virtual gamepads (same buttons as the Switch version:
//   A attack/confirm, X special, L/R switch weapon, + pause, - mute / quit from pause)
// - Bluetooth gamepads, Android back button, pausing when the app goes to the background
(() => {
'use strict';
const CHAPTERS = {
  1: { file: 'ch1.html', label: 'CHƯƠNG 1', name: 'Đảo Rồng' },
  2: { file: 'ch2.html', label: 'CHƯƠNG 2', name: 'Thành Phố Bị Lãng Quên' },
  3: { file: 'ch3.html', label: 'CHƯƠNG 3', name: 'Thành Phố Thiên Đường' }
};
const KEY = 'trumbo-app-v1';
const DEF = { unlocked: 1, current: 1, mode: 0, done: false };
function loadProgress() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } }
function saveProgress(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
const touch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const chapter = +(document.documentElement.dataset.chapter || 0);
const qs = new URLSearchParams(location.search);
const prog = loadProgress();
const mode = qs.get('mode') === '2' ? 2 : qs.get('mode') === '1' ? 1 : (prog.mode || (touch ? 1 : 2));

// ---------------- virtual gamepads (touch) merged with real gamepads
// held = finger is on the button; latch = pressed since the last poll (a quick tap still counts for one frame)
const mkPad = () => ({ buttons: Array.from({ length: 17 }, () => ({ pressed: false })), held: new Array(17).fill(false), latch: new Array(17).fill(false), axes: [0, 0, 0, 0], virtual: true });
const vpads = [mkPad(), mkPad()];
let realSeen = false;
function realPads() {
  try { return navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected !== false) : []; } catch (e) { return []; }
}
function pads() {
  const real = realPads();
  if (real.length && !realSeen) { realSeen = true; document.body.classList.add('has-pad'); }
  for (const v of vpads) for (let k = 0; k < 17; k++) { v.buttons[k].pressed = v.held[k] || v.latch[k]; v.latch[k] = false; }
  const out = [];
  for (let i = 0; i < 2; i++) {
    const v = vpads[i], r = real[i];
    if (!r) { out.push(v); continue; }
    out.push({
      buttons: v.buttons.map((b, k) => ({ pressed: b.pressed || !!(r.buttons[k] && r.buttons[k].pressed) })),
      axes: v.axes.map((a, k) => Math.abs(r.axes[k] || 0) > Math.abs(a) ? r.axes[k] : a)
    });
  }
  return out;
}

// ---------------- navigation
function go(url) { APP.leaving = true; location.href = url; }
function chapterUrl(n, start) { return `${CHAPTERS[n].file}?mode=${mode}&start=${start}`; }

const APP = window.TRUMBO_APP = {
  chapter, mode, touch, CHAPTERS,
  start: qs.get('start') || 'new',
  pads,
  progress: loadProgress,
  setProgress(p) { saveProgress(Object.assign(loadProgress(), p)); },
  // filled in by the chapter's game code
  gesture: null, pause: null, resume: null, state: null, ac: null,
  leaving: false,
  home() { if (!APP.leaving) go('index.html'); },
  next() {
    if (APP.leaving) return;
    const p = loadProgress();
    if (chapter >= 3) { p.done = true; p.unlocked = 3; p.current = 3; saveProgress(p); go('index.html?done=1'); return; }
    p.unlocked = Math.max(p.unlocked, chapter + 1); p.current = chapter + 1; saveProgress(p);
    go(chapterUrl(chapter + 1, 'new'));
  },
  play(n, start) { const p = loadProgress(); p.current = n; p.mode = mode; saveProgress(p); go(chapterUrl(n, start)); },
  save(n, data) { try { if (data) localStorage.setItem('trumbo-app-ch' + n, JSON.stringify(data)); else localStorage.removeItem('trumbo-app-ch' + n); } catch (e) {} },
  load(n) { try { return JSON.parse(localStorage.getItem('trumbo-app-ch' + n) || 'null'); } catch (e) { return null; } },
  // Android back button. Returns true when handled; false lets the app close.
  back() {
    if (!chapter) return window.TRUMBO_HOME ? window.TRUMBO_HOME.back() : false;
    if (confirmEl) { closeConfirm(); return true; }
    const st = APP.state ? APP.state() : '';
    if (st === 'play' && APP.pause) { APP.pause(); return true; }
    if (st === 'paused' && APP.resume) { APP.resume(); return true; }
    openConfirm();
    return true;
  }
};

if (chapter) {
  prog.current = chapter; prog.mode = mode; prog.unlocked = Math.max(prog.unlocked, chapter); saveProgress(prog);
}

// ---------------- background / foreground
document.addEventListener('visibilitychange', () => {
  const ac = APP.ac && APP.ac();
  if (document.hidden) {
    if (APP.pause) try { APP.pause(); } catch (e) {}
    if (ac && ac.suspend) try { ac.suspend(); } catch (e) {}
  } else if (ac && ac.resume) try { ac.resume(); } catch (e) {}
});

// ---------------- DOM helpers (chapter pages only)
let confirmEl = null;
function openConfirm() {
  if (confirmEl) return;
  confirmEl = document.createElement('div');
  confirmEl.className = 'tb-confirm';
  confirmEl.innerHTML = '<div class="tb-box"><p>Về màn hình chính?</p><small>Tiến độ được lưu ở đầu mỗi màn.</small><div><button data-a="home">Về màn hình chính</button><button data-a="stay">Chơi tiếp</button></div></div>';
  confirmEl.addEventListener('click', e => { const a = e.target.dataset && e.target.dataset.a; if (a === 'home') APP.home(); if (a === 'stay') closeConfirm(); });
  document.body.appendChild(confirmEl);
}
function closeConfirm() { if (confirmEl) { confirmEl.remove(); confirmEl = null; } }

function chapterCard() {
  if (APP.start !== 'new') return;
  const c = CHAPTERS[chapter], el = document.createElement('div');
  el.className = 'tb-card';
  el.innerHTML = `<div><b>${c.label}</b><span>${c.name}</span></div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2300);
  setTimeout(() => el.remove(), 3400);
}

// ---------------- touch controls
// Buttons map to gamepad indices: 0 = A (attack / confirm), 2 = X (special), 4 = L/R (switch weapon), 9 = + (pause), 8 = - (mute / quit)
function buildTouch() {
  const root = document.createElement('div');
  root.id = 'tc';
  root.className = mode === 2 ? 'two' : 'one';
  document.body.appendChild(root);
  const players = mode === 2 ? [0, 1] : [0];
  for (const pi of players) {
    const side = pi === 0 ? 'l' : 'r';
    const zone = document.createElement('div'); zone.className = `tc-zone ${side}`; root.appendChild(zone);
    const base = document.createElement('div'); base.className = 'tc-base'; zone.appendChild(base);
    const knob = document.createElement('div'); knob.className = 'tc-knob'; base.appendChild(knob);
    stick(zone, base, knob, vpads[pi]);
    const cl = document.createElement('div'); cl.className = `tc-btns ${mode === 2 ? (pi === 0 ? 'l2' : 'r2') : 'r1'}`; root.appendChild(cl);
    for (const [label, idx, cls] of [['A', 0, 'a'], ['X', 2, 'x'], ['L/R', 4, 'sw']]) button(cl, label, idx, cls, vpads[pi]);
  }
  const sys = document.createElement('div'); sys.className = 'tc-sys'; root.appendChild(sys);
  button(sys, '+', 9, 'plus', vpads[0]);
  button(sys, '−', 8, 'minus', vpads[0]);
}
function button(parent, label, idx, cls, pad) {
  const el = document.createElement('div'); el.className = 'tc-btn ' + cls; el.textContent = label; parent.appendChild(el);
  const ids = new Set();
  const set = () => { pad.held[idx] = ids.size > 0; if (ids.size) pad.latch[idx] = true; el.classList.toggle('on', ids.size > 0); };
  el.addEventListener('pointerdown', e => { e.preventDefault(); gesture(); ids.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (_) {} set(); vibrate(); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, e => { ids.delete(e.pointerId); set(); });
}
function stick(zone, base, knob, pad) {
  let id = null, ox = 0, oy = 0;
  const R = () => Math.max(34, Math.min(innerWidth, innerHeight) * 0.13);
  const right = zone.classList.contains('r');
  // resting place of the stick: bottom corner of its zone (it jumps to wherever the thumb lands)
  const home = () => {
    const r = zone.getBoundingClientRect(), rr = R();
    base.style.left = (right ? r.width - rr * 1.5 : rr * 1.5) + 'px'; base.style.top = (r.height - rr * 1.45) + 'px';
    base.classList.remove('live'); knob.style.transform = ''; pad.axes[0] = pad.axes[1] = 0;
  };
  home(); addEventListener('resize', () => { if (id === null) home(); });
  zone.addEventListener('pointerdown', e => {
    if (id !== null) return;
    e.preventDefault(); gesture(); id = e.pointerId; try { zone.setPointerCapture(id); } catch (_) {}
    const r = zone.getBoundingClientRect(); ox = e.clientX; oy = e.clientY;
    base.style.left = (ox - r.left) + 'px'; base.style.top = (oy - r.top) + 'px'; base.classList.add('live');
  });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const rr = R(); let dx = e.clientX - ox, dy = e.clientY - oy; const d = Math.hypot(dx, dy);
    if (d > rr) { dx = dx / d * rr; dy = dy / d * rr; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    pad.axes[0] = dx / rr; pad.axes[1] = dy / rr;
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) zone.addEventListener(ev, e => { if (e.pointerId === id) { id = null; home(); } });
}
let gestured = false;
function gesture() { if (APP.gesture) try { APP.gesture(); } catch (e) {} gestured = true; }
function vibrate() { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} }

const CSS = `
#game,#game:focus-visible{box-shadow:none!important;outline:none}
html,body{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overscroll-behavior:none}
#tc{position:fixed;inset:0;z-index:5;pointer-events:none;font-family:'VT323',monospace}
#tc .tc-zone{position:absolute;bottom:0;height:78%;pointer-events:auto;touch-action:none}
#tc.one .tc-zone.l{left:0;width:46%}
#tc.two .tc-zone.l{left:0;width:24%}
#tc.two .tc-zone.r{right:0;width:24%}
.tc-base{position:absolute;width:min(26vh,22vw);height:min(26vh,22vw);transform:translate(-50%,-50%);border-radius:50%;background:rgba(20,12,40,.28);border:2px solid rgba(255,255,255,.28);opacity:.55;pointer-events:none}
.tc-base.live{opacity:.95}
.tc-knob{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;border-radius:50%;background:rgba(255,255,255,.45);border:2px solid rgba(255,255,255,.7)}
.tc-btns{position:absolute;bottom:0;width:min(48vh,34vw);height:min(48vh,34vw);pointer-events:none}
.tc-btns.r1{right:1vw}
.tc-btns.l2{left:25%}
.tc-btns.r2{right:25%}
.tc-btn{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:50%;pointer-events:auto;touch-action:none;color:#fff;background:rgba(20,12,40,.42);border:2px solid rgba(255,255,255,.55);text-shadow:0 2px 0 #000;line-height:1}
.tc-btn.on{background:rgba(255,210,63,.55);border-color:#ffd23f}
.tc-btn.a{width:44%;height:44%;right:6%;bottom:8%;font-size:min(9vh,6vw);background:rgba(181,23,94,.45)}
.tc-btn.x{width:33%;height:33%;right:52%;bottom:6%;font-size:min(7vh,5vw);background:rgba(36,110,180,.45)}
.tc-btn.sw{width:28%;height:28%;right:14%;bottom:56%;font-size:min(5vh,3.6vw)}
.tc-btns.l2 .tc-btn.a{right:auto;left:6%}.tc-btns.l2 .tc-btn.x{right:auto;left:52%}.tc-btns.l2 .tc-btn.sw{right:auto;left:14%}
.tc-sys{position:absolute;top:0;left:0;right:0;height:0}
.tc-btn.plus,.tc-btn.minus{top:1.5vh;width:min(11vh,8vw);height:min(11vh,8vw);font-size:min(7vh,5vw);border-radius:28%;opacity:.8}
.tc-btn.plus{left:1vw}.tc-btn.minus{right:1vw}
body.has-pad #tc{display:none}
.tb-card{position:fixed;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;pointer-events:none;background:rgba(10,6,20,.82);transition:opacity 1s;font-family:'VT323',monospace;text-align:center}
.tb-card b{display:block;font-size:min(9vh,7vw);color:#ffd23f;font-weight:normal;text-shadow:0 3px 0 #7a1f5a;letter-spacing:.05em}
.tb-card span{display:block;font-size:min(13vh,9vw);color:#fff;text-shadow:0 3px 0 #4a1f6a}
.tb-card.out{opacity:0}
.tb-confirm{position:fixed;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;background:rgba(10,6,20,.7);font-family:'VT323',monospace}
.tb-box{background:#1d1430;border:3px solid #f4e3c1;padding:3vh 4vw;text-align:center;color:#fff;max-width:80vw}
.tb-box p{margin:0 0 1vh;font-size:min(8vh,6vw);color:#ffd23f}
.tb-box small{display:block;font-size:min(5vh,4vw);color:#c9b8e8;margin-bottom:2vh}
.tb-box button{font:inherit;font-size:min(6vh,4.5vw);margin:0 1vw;padding:1vh 2.5vw;border:2px solid #f4e3c1;background:#4a2f7a;color:#fff;border-radius:6px}
`;
function injectCss() { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

if (chapter) {
  const ready = () => {
    injectCss();
    if (touch) buildTouch();
    chapterCard();
    // first real touch / key unlocks audio on mobile browsers
    addEventListener('pointerdown', () => { if (!gestured) gesture(); }, { capture: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
  addEventListener('gamepadconnected', () => { realSeen = true; document.body.classList.add('has-pad'); });
}
})();

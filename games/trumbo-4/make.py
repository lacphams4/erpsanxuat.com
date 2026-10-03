# Builds games/trumbo-4/index.html (Part 4 - The Time Machine) from the Part 3 game engine.
# Part 3 already has everything Part 4 needs (two kids + Pugi with sniff and rescue, shops, explore maps,
# scripted bosses, dialogs); this script swaps in the Part 4 world: story, maps, tiles, creatures and bosses.
# Usage: python3 make.py
import os, re, sys
from jsfn import replace_fn, span

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, '..', 'trumbo-3', 'index.html'), encoding='utf-8').read()
s = src

def rep(a, b, n=1):
    global s
    c = s.count(a)
    if c != n: raise SystemExit(f'expected {n} match(es), found {c}: {a[:80]!r}')
    s = s.replace(a, b)

def rep_block(start, end, new):
    """replace from `start` up to and including the first `end` after it"""
    global s
    i = s.index(start); j = s.index(end, i) + len(end)
    s = s[:i] + new + s[j:]

# ---------------------------------------------------------------- page, save
rep('<title>Anh Em Nhà Trumbo 3</title>', '<title>Anh Em Nhà Trumbo 4</title>')
s = s.replace('CUỘC PHIÊU LƯU ANH EM NHÀ TRUMBO - PHẦN 3', 'CUỘC PHIÊU LƯU ANH EM NHÀ TRUMBO - PHẦN 4')
rep("const SAVE_KEY = 'trumbo3-save-v1';", "const SAVE_KEY = 'trumbo4-save-v1';")
rep("T('PHẦN 3 - THÀNH PHỐ THIÊN ĐƯỜNG', W / 2, 40, 12, '#ffffff', 'center', '#3a2a6a');", "T('PHẦN 4 - CỖ MÁY THỜI GIAN', W / 2, 40, 12, '#ffffff', 'center', '#3a2a6a');")
# the kids still carry the mace, the boomerang and their armor from Part 3
rep("const UPG0 = () => ({ sword: 1, hammer: 0, sling: 1, bow: 0, armor: 0, collar: 0, dogArmor: 0, legend: false });",
    "const UPG0 = () => ({ sword: 2, hammer: 1, sling: 2, bow: 1, armor: 1, collar: 1, dogArmor: 1, legend: false });")

# ---------------------------------------------------------------- stages
rep_block('const STAGES = [', '\n];', """const STAGES = [
  { key: 'lab', type: 'scene', zone: 'lab', arena: 'lab', name: 'Cỗ Máy Thời Gian', talk: 'intro', song: 'title' },
  { key: 'dino', type: 'explore', zone: 'dino', name: 'Rừng Khủng Long', h: 46, dens: 0.11, blocks: 6, hazN: 7, need: 5, flashIn: true, enemies: { raptor: 5, trike: 2, ptero: 4 }, before: 'dino', song: 'desert' },
  { key: 'shop1', type: 'shop', big: true, title: 'KHOANG CHỨA ĐỒ CỦA CỖ MÁY' },
  { key: 'trex', type: 'boss', zone: 'jungle', arena: 'jungle', name: 'Khủng Long Bạo Chúa', before: 'trex', after: 'trexEnd', song: 'boss' },
  { key: 'ice', type: 'explore', zone: 'ice', name: 'Vùng Đất Băng Giá', h: 46, dens: 0.1, blocks: 6, hazN: 6, need: 4, flashIn: true, enemies: { wolf: 5, saber: 3, yeti: 3 }, before: 'ice', song: 'title' },
  { key: 'shop2', type: 'shop', big: true, title: 'KHOANG CHỨA ĐỒ CỦA CỖ MÁY' },
  { key: 'mammoth', type: 'boss', zone: 'icearena', arena: 'icearena', name: 'Voi Ma Mút', before: 'mammoth', after: 'mammothEnd', song: 'boss' },
  { key: 'portal', type: 'scene', zone: 'icearena', arena: 'icearena', name: 'Trở Về', talk: 'portal', song: 'end' },
  { key: 'home', type: 'scene', zone: 'home', arena: 'home', name: 'Về Nhà', talk: 'ending', song: 'end', flashIn: true, last: true }
];""")

# ---------------------------------------------------------------- story
rep_block('const DLG = {', '\n};', r"""const DLG = {
  intro: [
    { who: 'narr', text: 'Ác Quỷ đã bị đánh bại. Nữ Hoàng Thiên Thần dẫn Trump, Poly, Pugi cùng Ba và Chị Gái xuống một căn phòng bí mật dưới cung điện.' },
    { who: 'queen', text: 'Ta biết một con đường có thể đưa các ngươi trở về.' },
    { who: 'narr', text: 'Giữa căn phòng là một cỗ máy khổng lồ: CỖ MÁY THỜI GIAN.' },
    { who: 'explorer', text: 'Cỗ máy này có thể mở một cánh cửa xuyên qua thời gian.' },
    { who: 'poly', text: 'Nó có tìm được Mẹ không ạ? Mẹ bị cơn bão cuốn đi mất rồi...' },
    { who: 'explorer', text: 'Mẹ các cháu đang lạc ở một thời đại khác. Cỗ máy sẽ đưa các cháu tới đó.' },
    { who: 'trump', text: 'Nó có đưa tụi cháu về nhà được không ạ?' },
    { who: 'explorer', text: 'Được. Nhưng cỗ máy đã rất lâu không hoạt động.' },
    { who: 'dad', text: 'Cả nhà mình đi cùng nhau. Lần này không ai bị lạc nữa.' },
    { who: 'sister', text: 'Chị sẽ nắm tay Poly thật chặt!' },
    { who: 'queen', text: 'Chúc may mắn, ba vị anh hùng nhỏ tuổi.' },
    { who: 'narr', text: 'Họ khởi động cỗ máy. ẦM! Một cánh cổng thời gian mở ra.' },
    { who: 'narr', text: 'Nhưng ngay khi cả nhóm bước vào... cỗ máy bị trục trặc!' },
    { who: 'narr', text: 'Ánh sáng bao quanh họ. VÙÙÙÙ! Cả nhà biến mất.' }
  ],
  dino: [
    { who: 'narr', text: 'Khi mở mắt ra, cả nhà đang đứng giữa một khu rừng khổng lồ. Những cây cao chưa từng thấy.' },
    { who: 'narr', text: 'Mặt đất rung chuyển. Một đàn khủng long chạy ngang qua!' },
    { who: 'poly', text: 'Anh... đây là đâu vậy?' },
    { who: 'trump', text: '(nhìn một con khủng long khổng lồ) Anh nghĩ chúng ta vừa về quá khứ.' },
    { who: 'boogie', text: 'Gâu!' },
    { who: 'narr', text: 'Cỗ máy thời gian rơi theo họ về thời tiền sử, nhưng đã bị hỏng và không thể hoạt động trở lại.' },
    { who: 'dad', text: 'Ba sẽ ở lại sửa cỗ máy, Chị trông chừng giúp Ba. Hai con đi tìm 5 mảnh năng lượng thời gian nhé.' },
    { who: 'sister', text: 'Có mảnh bị chôn dưới đất đó. Nhờ cái mũi của Pugi nha!' },
    { who: 'trump', text: 'Đường bị cây đổ chắn rồi. Để con phá mở lối!' }
  ],
  trex: [
    { who: 'narr', text: 'Cả nhóm tìm đủ năng lượng và mở đường tới khu vực cuối cùng của thời đại này.' },
    { who: 'narr', text: 'Nhưng mặt đất bắt đầu rung chuyển... RẦM! RẦM! RẦM!' },
    { who: 'narr', text: 'Một tiếng gầm vang khắp khu rừng. KHỦNG LONG BẠO CHÚA xuất hiện!' },
    { who: 'trump', text: 'Poly bắn từ xa! Pugi dụ nó ra! Anh đánh trực diện!' },
    { who: 'boogie', text: 'GRRR... GÂU!' }
  ],
  trexEnd: [
    { who: 'narr', text: 'Khủng long bạo chúa gầm lên lần cuối rồi bỏ chạy vào rừng sâu.' },
    { who: 'narr', text: 'Phía sau nó là một TINH THỂ THỜI GIAN sáng lấp lánh. Hai anh em mang về cho Ba lắp vào cỗ máy.' },
    { who: 'poly', text: 'Đi tìm Mẹ thôi!' },
    { who: 'narr', text: 'Cỗ máy bắt đầu hoạt động. VÙÙÙÙ! Nó đưa cả nhà đến một thời đại khác.' }
  ],
  ice: [
    { who: 'narr', text: 'Cả nhà rơi xuống một vùng đất phủ đầy tuyết. Gió lạnh thổi dữ dội. Mọi thứ đều đóng băng.' },
    { who: 'poly', text: 'Lạnh quá!' },
    { who: 'trump', text: 'Chúng ta lại đi nhầm thời đại rồi.' },
    { who: 'sister', text: 'Khoan đã... nhìn kìa! Chiếc khăn quàng màu hồng trên tuyết... là của Mẹ!' },
    { who: 'narr', text: 'Đây là KỶ BĂNG HÀ. Mẹ đang ở đâu đó trong vùng đất băng giá này.' },
    { who: 'dad', text: 'Cỗ máy lại hỏng rồi. Ba cần thêm 4 mảnh năng lượng. Các con đi tìm Mẹ và tìm năng lượng nhé, cẩn thận!' },
    { who: 'trump', text: 'Pugi, đánh hơi tìm đường nhé! Anh sẽ phá băng mở lối. Poly bắn mấy con thú từ xa!' },
    { who: 'boogie', text: 'Gâu!' }
  ],
  mammoth: [
    { who: 'narr', text: 'Cuối đường là tinh thể thời gian cuối cùng... và MẸ, bị đóng băng trong một khối băng lớn!' },
    { who: 'poly', text: 'MẸ ƠI!!!' },
    { who: 'narr', text: 'Một con VOI MA MÚT khổng lồ dậm chân. Băng tuyết rung chuyển!' },
    { who: 'trump', text: 'Poly, phối hợp với anh! Pugi, giúp tụi anh nhé! Mình phải cứu Mẹ!' },
    { who: 'boogie', text: 'GÂU GÂU!' }
  ],
  mammothEnd: [
    { who: 'narr', text: 'Voi ma mút chịu thua. Nó lùi lại và nhường đường.' },
    { who: 'narr', text: 'RẮC... Khối băng vỡ tan. Mẹ được tự do!' },
    { who: 'mom', text: 'Trump! Poly! Các con của mẹ!' },
    { who: 'poly', text: 'Mẹ ơi! Con nhớ mẹ lắm!' },
    { who: 'mom', text: '(ôm chặt hai anh em) Mẹ biết thế nào các con cũng tới mà.' },
    { who: 'trump', text: 'Pugi giúp tụi con nhiều lắm đó mẹ.' },
    { who: 'mom', text: 'Cảm ơn con nhé, Pugi. Từ nay con là thành viên của nhà mình!' },
    { who: 'boogie', text: 'Gâu! (Pugi vẫy chiếc đuôi nhỏ)' },
    { who: 'narr', text: 'Hai anh em lấy được TINH THỂ THỜI GIAN CUỐI CÙNG.' }
  ],
  portal: [
    { who: 'narr', text: 'Ba và Mẹ đưa tinh thể vào cỗ máy thời gian. Các tinh thể phát sáng.' },
    { who: 'narr', text: 'Cỗ máy bắt đầu hoạt động ổn định. Một cánh cổng xuất hiện.' },
    { who: 'narr', text: 'Lần này, màn hình của cỗ máy hiện rõ: THỜI ĐIỂM: HIỆN TẠI - ĐIỂM ĐẾN: NHÀ.' },
    { who: 'poly', text: 'Lần này chắc chắn về nhà chứ?' },
    { who: 'trump', text: 'Anh hy vọng vậy.' },
    { who: 'boogie', text: 'Gâu!' },
    { who: 'narr', text: 'Cả nhà nắm tay nhau bước vào cánh cổng. VÙÙÙÙ!' }
  ],
  ending: [
    { who: 'narr', text: 'Một luồng sáng xuất hiện. Cả nhà rơi xuống ngay trước ngôi nhà thân yêu của mình.' },
    { who: 'narr', text: 'Không còn đảo hoang. Không còn thành phố bỏ hoang. Không còn Ác Quỷ. Không còn khủng long. Không còn băng tuyết.' },
    { who: 'narr', text: 'Cuối cùng... cả nhà đã về nhà.' },
    { who: 'poly', text: 'Con về rồi!' },
    { who: 'trump', text: '(nhìn Pugi) Cuối cùng chúng ta cũng về được.' },
    { who: 'boogie', text: 'Gâu! (Pugi vẫy chiếc đuôi nhỏ)' },
    { who: 'mom', text: 'Cả nhà mình đã sum họp rồi.' },
    { who: 'dad', text: 'Năm người và một chú chó. Không thiếu một ai!' },
    { who: 'narr', text: 'Cả nhà nhìn lại cỗ máy thời gian. Nó từ từ biến mất.', fade: true },
    { who: 'narr', text: 'Buổi tối, cả nhà quây quần bên cửa sổ. Hai anh em kể lại tất cả những cuộc phiêu lưu.', dark: true },
    { who: 'narr', text: 'Đảo Rồng, Thành Phố Bỏ Hoang, Sa Mạc, 18 Tầng Địa Ngục, Thành Phố Thiên Đường, Thời Tiền Sử, Kỷ Băng Hà...', dark: true },
    { who: 'poly', text: 'Anh nghĩ chúng ta còn đi phiêu lưu nữa không?', dark: true },
    { who: 'trump', text: 'Không. Lần này anh chỉ muốn ở nhà.', dark: true },
    { who: 'mom', text: 'Mẹ cũng vậy!', dark: true },
    { who: 'boogie', text: 'Gâu!', dark: true },
    { who: 'narr', text: 'Cả nhà bật cười. Ngôi nhà nằm yên dưới bầu trời đầy sao.', dark: true }
  ]
};""")

# ---------------------------------------------------------------- tiles
new_tiles = r"""const PAL = {
  lab:       { g: '#4a4a5e', g2: '#3e3e50', g3: '#5c5c72' },
  dino:      { g: '#3f7a2a', g2: '#346a22', g3: '#559a3a' },
  jungle:    { g: '#5a8a32', g2: '#4a7a2a', g3: '#6e9e42' },
  ice:       { g: '#e8f2fa', g2: '#d0e0f0', g3: '#ffffff' },
  icearena:  { g: '#dceaf6', g2: '#c4d8ec', g3: '#f4faff' },
  home:      { g: '#6ab04c', g2: '#5a9a3e', g3: '#86c860' }
};
function mkTile(fn) { const c = mkCanvas(16, 16); fn(c.getContext('2d')); return c; }
function groundBase(c, P, Rn, n = 14) { R(c, 0, 0, 16, 16, P.g); for (let i = 0; i < n; i++) R(c, Math.floor(Rn() * 16), Math.floor(Rn() * 16), Rn() < 0.5 ? 1 : 2, 1, Rn() < 0.6 ? P.g2 : P.g3); }
function buildTiles(key) {
  const P = PAL[key], Rn = makeRng(key.length * 911 + 17), vk = key === 'jungle' ? 'dino' : key === 'icearena' ? 'ice' : key;
  const TL = { g: [], d: [], o: [], hz: [], gt: [], sp: [], ex: null, st: null, cp: null };
  const tiled = vk === 'lab';
  for (let i = 0; i < 4; i++) TL.g.push(mkTile(c => {
    if (tiled) { R(c, 0, 0, 16, 16, P.g); R(c, 0, 0, 16, 1, P.g2); R(c, 0, 0, 1, 16, P.g2); R(c, 2, 2, 1, 1, P.g3); R(c, 13, 2, 1, 1, P.g3); R(c, 2, 13, 1, 1, P.g3); R(c, 13, 13, 1, 1, P.g3); if (i === 1) R(c, 4, 8, 8, 1, '#3a3a4c'); }
    else groundBase(c, P, Rn);
  }));
  for (let i = 0; i < 2; i++) TL.d.push(mkTile(c => {
    if (tiled) c.drawImage(TL.g[i], 0, 0); else groundBase(c, P, Rn, 8);
    if (vk === 'dino') { if (i === 0) { R(c, 7, 6, 1, 8, '#2f6a22'); R(c, 4, 8, 3, 1, '#56a03a'); R(c, 8, 7, 4, 1, '#56a03a'); R(c, 5, 11, 2, 1, '#56a03a'); R(c, 8, 10, 3, 1, '#56a03a'); } else { R(c, 5, 6, 6, 5, '#2f5a1e'); R(c, 4, 4, 2, 2, '#2f5a1e'); R(c, 7, 3, 2, 2, '#2f5a1e'); R(c, 10, 4, 2, 2, '#2f5a1e'); } }
    if (vk === 'ice') { if (i === 0) { R(c, 3, 9, 10, 3, '#ffffff'); R(c, 5, 8, 6, 1, '#ffffff'); R(c, 3, 12, 10, 1, '#c8d8ec'); } else { R(c, 6, 5, 1, 5, '#a8d8f0'); R(c, 4, 7, 5, 1, '#a8d8f0'); R(c, 11, 10, 1, 3, '#a8d8f0'); R(c, 10, 11, 3, 1, '#a8d8f0'); } }
    if (vk === 'lab') { R(c, 6, 6, 4, 4, '#2a2a38'); R(c, 7, 7, 2, 2, i ? '#4dd2ff' : '#c77dff'); }
    if (vk === 'home') { if (i === 0) { R(c, 4, 5, 3, 3, '#ff7ab8'); R(c, 5, 6, 1, 1, '#ffe066'); R(c, 10, 9, 3, 3, '#ffffff'); R(c, 11, 10, 1, 1, '#ffe066'); } else { R(c, 5, 8, 1, 4, '#4a8a32'); R(c, 7, 7, 1, 5, '#4a8a32'); R(c, 9, 9, 1, 3, '#4a8a32'); } }
  }));
  for (let i = 0; i < 3; i++) TL.o.push(mkTile(c => {
    if (tiled) c.drawImage(TL.g[0], 0, 0); else groundBase(c, P, Rn, 6);
    const rock = (base, hi, lo) => { R(c, 2, 5, 12, 10, lo); R(c, 2, 5, 11, 9, base); R(c, 4, 4, 8, 1, base); R(c, 4, 5, 6, 2, hi); R(c, 3, 7, 2, 2, hi); R(c, 3, 14, 11, 1, 'rgba(0,0,0,0.25)'); };
    const pillar = (a1, a2, a3, gem) => { R(c, 3, 0, 10, 16, a1); R(c, 4, 0, 8, 16, a2); R(c, 5, 0, 2, 16, a3); R(c, 2, 13, 12, 3, a1); R(c, 2, 0, 12, 2, a1); if (gem) R(c, 7, 6, 2, 3, gem); };
    if (vk === 'dino') {
      if (i === 0) { R(c, 6, 9, 4, 7, '#6b4226'); R(c, 7, 9, 1, 7, '#8a5a33'); R(c, 0, 1, 16, 9, '#24561a'); R(c, 2, 0, 12, 2, '#2f6a22'); R(c, 1, 2, 6, 3, '#3f8a2a'); R(c, 9, 4, 5, 2, '#3f8a2a'); R(c, 0, 9, 16, 1, '#1a4012'); }
      else if (i === 1) rock('#7a7a6a', '#a0a08a', '#545446');
      else { R(c, 7, 7, 2, 9, '#6b4a26'); for (let k = 0; k < 4; k++) { R(c, 1 + k, 3 + k, 6, 2, '#3f8a2a'); R(c, 9 - k, 3 + k, 6, 2, '#3f8a2a'); } R(c, 6, 1, 4, 3, '#56a03a'); }
    } else if (vk === 'ice') {
      if (i === 0) { R(c, 1, 2, 14, 13, '#8ac0e0'); R(c, 1, 2, 14, 3, '#c8e8f8'); R(c, 3, 5, 2, 8, '#e8fbff'); R(c, 1, 14, 14, 1, '#5a8ab0'); R(c, 10, 6, 1, 5, '#6aa0c8'); }
      else if (i === 1) { rock('#8a96a8', '#b0bccc', '#5a6678'); R(c, 2, 4, 12, 3, '#ffffff'); R(c, 4, 3, 8, 1, '#ffffff'); }
      else { R(c, 7, 12, 2, 4, '#6b4226'); for (let k = 0; k < 5; k++) R(c, 7 - k, 2 + k * 2, 2 + k * 2, 2, k % 2 ? '#e8f4ff' : '#2f6a4a'); }
    } else if (vk === 'lab') {
      if (i === 0) pillar('#2a2a38', '#5a5a70', '#7a7a90', '#4dd2ff');
      else if (i === 1) { R(c, 2, 3, 12, 12, '#3a3a4c'); R(c, 2, 3, 12, 1, '#7a7a90'); R(c, 4, 6, 3, 2, '#7dff6b'); R(c, 9, 6, 3, 2, '#ff4d6d'); R(c, 4, 10, 8, 2, '#2a2a38'); }
      else { R(c, 6, 0, 4, 16, '#5a5a70'); R(c, 7, 0, 1, 16, '#9a9ab0'); R(c, 4, 6, 8, 3, '#3a3a4c'); R(c, 7, 7, 2, 1, '#ffe066'); }
    } else {
      if (i === 0) { R(c, 7, 10, 2, 6, '#6b4226'); R(c, 2, 1, 12, 10, '#3f8a2a'); R(c, 4, 0, 8, 2, '#4f9a3a'); R(c, 4, 3, 3, 2, '#6ab04c'); R(c, 3, 10, 10, 1, '#2f6a22'); }
      else if (i === 1) { R(c, 1, 6, 14, 9, '#3f8a2a'); R(c, 2, 5, 12, 2, '#4f9a3a'); R(c, 4, 8, 2, 2, '#ff7ab8'); R(c, 10, 9, 2, 2, '#ffe066'); }
      else { R(c, 6, 2, 4, 14, '#c8a86a'); R(c, 6, 2, 4, 1, '#e8d08a'); R(c, 0, 6, 16, 2, '#c8a86a'); R(c, 0, 11, 16, 2, '#c8a86a'); }
    }
  }));
  for (let f = 0; f < 2; f++) {
    TL.hz.push(mkTile(c => {
      if (vk === 'ice') { R(c, 0, 0, 16, 16, '#7ab0d8'); R(c, 0, 0, 16, 1, '#c8e8f8'); R(c, 3, 3, 1, 6, '#e8fbff'); R(c, 4, 8, 5, 1, '#e8fbff'); R(c, 9, 4 + f, 1, 7, '#4a80b0'); R(c, 11, 10, 3, 1, '#e8fbff'); }
      else if (vk === 'lab') { R(c, 0, 0, 16, 16, '#3a1a5a'); R(c, (3 + f * 5) % 12, 4, 4, 3, '#8a3aa0'); R(c, (9 - f * 4 + 16) % 12, 10, 3, 2, '#c77dff'); }
      else { R(c, 0, 0, 16, 16, '#3a3a1a'); R(c, 0, 0, 16, 1, '#5a5a2a'); for (const [x, y] of [[3, 4], [10, 3], [6, 10], [12, 11]]) { R(c, x, y, 3, 2, '#5a5a2a'); R(c, x + 1, y - 1 - f, 1, 1, '#8a8a4a'); } }
    }));
    TL.gt.push(mkTile(c => {
      if (vk === 'ice') { R(c, 0, 0, 16, 16, '#a8d8f0'); for (let x = 1; x < 16; x += 4) { R(c, x, 0, 3, 16, '#c8e8f8'); R(c, x, 0, 1, 16, '#ffffff'); } R(c, 0, 7, 16, 2, '#6aa0c8'); R(c, 7, 6, 2, 3, f ? '#4dd2ff' : '#ffffff'); }
      else if (vk === 'lab') { R(c, 0, 0, 16, 16, '#3a3a4c'); for (let y = 1; y < 16; y += 3) R(c, 0, y, 16, 1, '#5a5a70'); R(c, 7, 6, 2, 3, f ? '#ff4d6d' : '#ffe066'); }
      else { R(c, 0, 0, 16, 16, P.g); for (let i2 = 0; i2 < 4; i2++) { R(c, i2 * 4, 2, 3, 14, '#8a5a33'); R(c, i2 * 4 + 1, 0, 1, 2, '#8a5a33'); } R(c, 0, 7, 16, 1, '#d9b27a'); R(c, 7, 6, 2, 2, f ? '#ffe066' : '#ff9f43'); }
    }));
    TL.sp.push(mkTile(c => { R(c, 0, 0, 16, 16, P.g); for (let yy = 3; yy < 16; yy += 5) for (let xx = 3; xx < 16; xx += 5) { if (f === 0) R(c, xx, yy, 2, 2, '#2a2a20'); else { R(c, xx, yy - 2, 2, 4, '#c8cedc'); R(c, xx, yy - 3, 1, 1, '#fff'); } } }));
  }
  const exc = vk === 'ice' ? '#b8d8f0' : vk === 'lab' ? '#2a2a38' : vk === 'home' ? '#c8a86a' : '#8a6a3a';
  TL.ex = mkTile(c => { if (tiled) c.drawImage(TL.g[0], 0, 0); else groundBase(c, P, Rn, 6); R(c, 3, 0, 10, 16, exc); for (let y = 2; y < 16; y += 5) { R(c, 7, y, 2, 1, 'rgba(255,255,255,0.4)'); } });
  TL.st = mkTile(c => { R(c, 0, 0, 16, 16, '#0a0408'); });
  TL.cp = mkTile(c => { R(c, 0, 0, 16, 16, '#5a3a8a'); R(c, 0, 0, 2, 16, '#c77dff'); R(c, 14, 0, 2, 16, '#c77dff'); R(c, 7, 6, 2, 2, '#4dd2ff'); });
  TL.wa = [0, 1].map(f => mkTile(c => { R(c, 0, 0, 16, 16, '#1f6fb0'); R(c, 0, 10, 16, 6, '#1a5f9a'); for (let k = 0; k < 3; k++) R(c, (k * 6 + f * 3) % 16, 3 + k * 5, 4, 1, '#7fc8f0'); }));
  return TL;
}"""
i = s.index('const PAL = {'); j = s.index('function pixEllipseT(')
s = s[:i] + new_tiles + '\n' + s[j:]

# ---------------------------------------------------------------- arenas and stage building
s = replace_fn(s, 'genArena', r"""function genArena(kind) {
  const w = 20, h = 14, t = new Array(w * h).fill(G), v = [], Rn = makeRng(kind.length * 31 + 5);
  for (let k = 0; k < w * h; k++) { v.push(Math.floor(Rn() * 4)); if (Rn() < 0.06) t[k] = DC; }
  const S = (x, y, k, vv) => { if (x >= 0 && y >= 0 && x < w && y < h) { t[y * w + x] = k; if (vv !== undefined) v[y * w + x] = vv; } };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y <= 1 || x === w - 1 || y === h - 1) S(x, y, O, 0);
  if (kind === 'lab') { for (const [x, y] of [[4, 5], [15, 5], [4, 10], [15, 10]]) S(x, y, O, 0); S(2, 3, O, 1); S(17, 3, O, 1); S(2, 11, O, 2); S(17, 11, O, 2); for (let y = 6; y <= 7; y++) for (let x = 9; x <= 10; x++) S(x, y, O, 0); for (let y = 8; y < h - 1; y++) for (let x = 9; x <= 10; x++) S(x, y, CP); }
  if (kind === 'jungle') for (const [x, y, vv] of [[3, 4, 0], [16, 4, 0], [2, 8, 2], [17, 8, 2], [4, 11, 1], [15, 11, 1]]) S(x, y, O, vv);
  if (kind === 'icearena') { for (const [x, y, vv] of [[4, 5, 0], [15, 5, 0], [4, 10, 2], [15, 10, 2]]) S(x, y, O, vv); for (let y = 3; y <= 5; y++) for (let x = 9; x <= 11; x++) S(x, y, G); }
  if (kind === 'home') { for (let y = 5; y <= 7; y++) for (let x = 7; x <= 12; x++) S(x, y, O, 1); for (const [x, y] of [[3, 4], [16, 4], [2, 10], [17, 10]]) S(x, y, O, 0); for (let y = 8; y < h - 1; y++) S(10, y, EX); }
  return { w, h, t, v };
}""")

s = replace_fn(s, 'buildStage', r"""function buildStage(st) {
  warmItems();
  (MINIONS[st.key] || []).forEach(t => warmEnemy(t));
  resetWorld(st.zone);
  if (st.type === 'scene' || st.type === 'boss') {
    map = genArena(st.arena); gateOpen = true;
    placeTeam(10 * 16, (map.h - 2) * 16 + 8);
    if (st.arena === 'lab') { objs.push({ type: 'machine', x: 160, y: 128, on: true }); npcAt('queen', 6 * 16, 7 * 16); npcAt('explorer', 14 * 16, 7 * 16); placeTeam(160, 11 * 16); }
    if (st.key === 'portal') { objs.push({ type: 'machine', x: 160, y: 128, on: true }); for (let y = 6; y <= 7; y++) for (let x = 9; x <= 10; x++) map.t[y * map.w + x] = O; placeTeam(160, 11 * 16); }
    if (st.arena === 'home') { objs.push({ type: 'house', x: 160, y: 8 * 16 }); objs.push({ type: 'machine', x: 15 * 16, y: 11 * 16, on: true, fade: 0 }); placeTeam(8 * 16, 10 * 16 + 8); }
    if (st.key === 'trex') boss = { kind: 'trex', x: 160, y: 7 * 16, hp: 1100, maxhp: 1100, r: 24, face: -1, step: 0, minY: 96 };
    if (st.key === 'mammoth') boss = { kind: 'mammoth', x: 160, y: 7 * 16, hp: 1300, maxhp: 1300, r: 26, face: -1, step: 0, minY: 100 };
    if (boss) Object.assign(boss, { t: 0, st: 'intro', stT: 1.4, subT: 0, count: 0, flash: 0, stun: 0, stunImm: 0, taunt: 0, tauntImm: 0, mouth: 0, dead: false, deadT: 0, last: '', summoned: 0 });
    return;
  }
  map = genExplore(st, 6100 + stageIdx * 97);
  const Rn = makeRng(7150 + stageIdx * 71), mid = map.w >> 1;
  const sx = mid * 16, sy = (map.h - 4) * 16 + 8;
  placeTeam(sx, sy);
  const seen = reach(map, sx >> 4, sy >> 4), avoid = [{ x: sx, y: sy }, { x: sx + 70, y: sy - 4 }];
  objs.push({ type: 'machine', x: sx + 70, y: sy - 4, on: false });
  // fallen trees / ice walls across the whole map: Trump breaks one to get through
  const ice = st.key === 'ice';
  for (const by of [Math.floor(map.h * 0.62), Math.floor(map.h * 0.34)]) {
    for (let x = 2; x < map.w - 2; x++) {
      const i2 = by * map.w + x, k = map.t[i2];
      if (k === G || k === DC || k === HZ) { map.t[i2] = O; seen[i2] = 0; objs.push({ type: 'block', x: x * 16 + 8, y: by * 16 + 16, ti: i2, hp: 8, maxhp: 8, breakable: true, flash: 0 }); }
    }
  }
  const put = (kind, n, extra, y0 = 7, y1 = map.h - 8, more) => spots(map, seen, Rn, n, y0, y1, avoid).forEach((p, k) => pickups.push(Object.assign({ kind, x: p.x, y: p.y, t: Math.random() * 6, extra: extra ? extra(k) : 0 }, more ? more(k) : {})));
  put('shard', st.need, null, 7, map.h - 8, k => ({ hidden: k % 3 === 1 }));
  put('heart', 2); put('meat', 2); put('chest', 1, null, 8, map.h - 8, () => ({ hidden: true }));
  const eAvoid = avoid.slice();
  for (const [type, n] of Object.entries(st.enemies)) spots(map, seen, Rn, n, 7, map.h - 10, eAvoid, 24).forEach(p => { if (Math.hypot(p.x - sx, p.y - sy) > 90) enemies.push(mkEnemy(type, p.x, p.y)); });
  enemies.forEach(e => { if (!e.fly && blocked(e.x, e.y, e.hw, e.hh)) e.dead = true; });
  enemies = enemies.filter(e => !e.dead);
}""")

rep("  buildStage(st);\n  if (st.type === 'scene') {", "  buildStage(st);\n  if (st.flashIn) { flashT = 1.4; SFX.boom(); }\n  if (st.type === 'scene') {")
s = replace_fn(s, 'showBanner', r"""function showBanner() {
  state = 'play';
  const st = STAGES[stageIdx];
  let text = st.name ? st.name.toUpperCase() : '', sub = '';
  if (st.type === 'boss') { text = 'BOSS: ' + text; sub = st.key === 'trex' ? 'Né cú cắn, cú quật đuôi và tiếng gầm!' : 'Tránh cú húc, đánh khi nó bị choáng!'; }
  else sub = { dino: 'Tìm 5 mảnh năng lượng thời gian', ice: 'Tìm 4 mảnh năng lượng giữa bão tuyết' }[st.key] || '';
  banner = { text, sub, t: 3 };
  playSong(st.song);
  if (st.type === 'boss') { SFX.roar(); shake = 8; }
}""")

# ---------------------------------------------------------------- pickups and objects
s = replace_fn(s, 'collect', r"""function collect(p, it) {
  addParts(it.x, it.y - 6, it.kind === 'coin' ? 3 : 8, ['#fff', '#ffe066'], 50, 0.4);
  switch (it.kind) {
    case 'coin': coins += it.val || 1; SFX.coin(); break;
    case 'shard': { const need = STAGES[stageIdx].need; prog++; SFX.pick(); addParts(it.x, it.y - 8, 14, ['#4dd2ff', '#a8f0ff', '#fff'], 70, 0.6, -30); say(prog >= need ? 'Đủ năng lượng! Đường đã mở, đi lên phía trên!' : `Mảnh năng lượng thời gian ${prog}/${need}!`, 2.6); if (prog >= need) openGate(); break; }
    case 'chest': coins += 12; SFX.buy(); addFloat(p.x, p.y - 28, '+12 xu', '#ffe066'); say('Rương bí mật! +12 xu', 2); break;
    case 'heart': p.hp = Math.min(p.maxhp, p.hp + 4); SFX.food(); addFloat(p.x, p.y - 26, '+4', '#ff9ec7'); break;
    case 'meat': p.hp = Math.min(p.maxhp, p.hp + 3); SFX.food(); addFloat(p.x, p.y - 26, 'Ngon!', '#ffe066'); break;
    case 'tcrystal': SFX.gate(); say('Nhặt được Tinh Thể Thời Gian!', 3); keyTaken = true; break;
  }
}""")
rep("  o.broken = true; shake = Math.max(shake, 3);\n",
    "  o.broken = true; shake = Math.max(shake, 3);\n  if (o.type === 'block') { map.t[o.ti] = G; mapDirty = true; addParts(o.x, o.y - 8, 14, zoneKey === 'ice' ? ['#e8fbff', '#a8d8f0', '#fff'] : ['#8a5a33', '#c8a06a', '#3f7a2a'], 70, 0.5, 60); if (Math.random() < 0.5) dropLoot(o.x, o.y - 4, false); }\n")

# ---------------------------------------------------------------- creatures
rep_block('const EDEF = {', '\n};', """const EDEF = {
  rat: { hp: 4, spd: 70, r: 6 }, robot: { hp: 9, spd: 26, r: 7 }, scorp: { hp: 8, spd: 38, r: 7 }, vulture: { hp: 6, spd: 52, r: 6, fly: true },
  imp: { hp: 6, spd: 42, r: 6, fly: true }, skeleton: { hp: 9, spd: 32, r: 6 }, knight: { hp: 22, spd: 30, r: 7 },
  raptor: { hp: 8, spd: 62, r: 7 }, trike: { hp: 28, spd: 24, r: 10 }, ptero: { hp: 7, spd: 54, r: 7, fly: true },
  wolf: { hp: 6, spd: 74, r: 6 }, saber: { hp: 13, spd: 44, r: 7 }, yeti: { hp: 16, spd: 24, r: 8 }
};""")
rep("dmg: type === 'guardian' || type === 'gargoyle' ? 2 : 1,", "dmg: type === 'trike' ? 2 : 1,")
rep("kb = ['guardian', 'knight', 'gargoyle', 'warrior'].includes(e.type) ? 60 : 140;", "kb = ['trike', 'yeti', 'knight'].includes(e.type) ? 60 : 140;")
rep("    case 'rat': case 'mummy': case 'crab': {", "    case 'rat': case 'mummy': case 'crab': case 'wolf': {")
rep("    case 'robot': case 'skeleton': case 'shaman': {", "    case 'robot': case 'skeleton': case 'shaman': case 'yeti': {")
rep("aimShot(e.type === 'robot' ? 95 : 85, e.type === 'robot' ? 'bolt' : e.type === 'shaman' ? 'fire' : 'bone', 10);",
    "aimShot(e.type === 'robot' ? 95 : 85, e.type === 'robot' ? 'bolt' : e.type === 'shaman' ? 'fire' : e.type === 'yeti' ? 'snow' : 'bone', e.type === 'yeti' ? 18 : 10);")
rep("    case 'scorp': case 'knight': case 'guardian': case 'eel': case 'warrior': {", "    case 'scorp': case 'knight': case 'guardian': case 'eel': case 'warrior': case 'raptor': case 'saber': case 'trike': {")
rep("const sp = e.type === 'scorp' ? 150 : e.type === 'knight' || e.type === 'warrior' ? 165 : e.type === 'eel' ? 175 : 130;",
    "const sp = e.type === 'raptor' ? 190 : e.type === 'saber' ? 180 : e.type === 'trike' ? 150 : e.type === 'scorp' ? 150 : e.type === 'knight' || e.type === 'warrior' ? 165 : e.type === 'eel' ? 175 : 130;")
rep("    case 'vulture': case 'piranha': case 'gargoyle': {", "    case 'vulture': case 'piranha': case 'gargoyle': case 'ptero': {")
rep("const CDLOOK = { robot: 1, skeleton: 1 }, MINIONS = { mega: ['piranha'], sdemon: ['imp', 'knight', 'gargoyle'] };",
    "const CDLOOK = { robot: 1, skeleton: 1, yeti: 1 }, MINIONS = { trex: ['raptor'], mammoth: ['wolf', 'saber'] };")
rep("const BIGE = type => type === 'guardian' || type === 'gargoyle';", "const BIGE = type => type === 'trike';")
rep("function drawEnemyRaw(b, cx, by, e) {\n  switch (e.type) {\n", """function drawEnemyRaw(b, cx, by, e) {
  switch (e.type) {
    case 'raptor': drawRaptor(b, cx, by, e); break;
    case 'trike': drawTrike(b, cx, by, e); break;
    case 'ptero': drawPtero(b, cx, by, e); break;
    case 'saber': drawSaber(b, cx, by, e); break;
    case 'wolf': drawWolf(b, cx, by, e); break;
    case 'yeti': drawYeti(b, cx, by, e); break;
""")
creatures = r"""// ---------------- Part 4 creatures (prehistoric jungle and ice age)
function drawRaptor(c, cx, by, e) {
  const q = mkQ(c, cx, by, (e.vx || 0) < 0, e.flash > 0); shadow(c, cx, by, 14);
  const st = Math.floor(e.t * 8) % 2, G1 = '#5a9a3a', G2 = '#3f7a2a', BEL = '#d8e0a0';
  q(-2, -5, 2, 5, G2); q(2, -5 + st, 2, 5 - st, G2); q(-3, -1, 3, 1, G2); q(2, -1, 3, 1, G2);
  q(-10, -10, 6, 3, G1); q(-13, -9, 4, 2, G1); q(-15, -8, 3, 1, G2);
  q(-5, -12, 11, 7, G1); q(-3, -7, 8, 2, BEL); q(-4, -12, 9, 1, G2);
  for (let i = 0; i < 3; i++) q(-3 + i * 3, -13, 2, 1, '#c0402a');
  q(5, -16, 4, 6, G1); q(7, -19, 6, 4, G1); q(12, -18, 2, 3, G1); q(10, -18, 1, 1, '#ffe066'); q(8, -15, 5, 1, G2);
  if (e.tel > 0 || e.dash > 0) { q(9, -15, 5, 2, '#5a1020'); q(10, -15, 1, 1, '#fff'); q(12, -15, 1, 1, '#fff'); }
  q(6, -10, 2, 2, G2); q(7, -9, 1, 2, '#fff');
}
function drawTrike(c, cx, by, e) {
  const q = mkQ(c, cx, by, (e.vx || 0) < 0, e.flash > 0); shadow(c, cx, by, 24);
  const st = Math.floor(e.t * 5) % 2, B1 = '#7a8a9a', B2 = '#5a6a7a', FR = '#c86a3a';
  q(-10, -5, 4, 5, B2); q(-4, -5 + st, 4, 5 - st, B2); q(3, -5, 4, 5, B2); q(7, -5 + (1 - st), 3, 5 - (1 - st), B2);
  q(-16, -12, 5, 3, B1); q(-13, -15, 23, 10, B1); q(-12, -16, 19, 1, '#9aaaba'); q(-13, -6, 23, 1, B2);
  q(9, -21, 4, 14, FR); q(10, -22, 3, 1, '#e8a060'); q(9, -18, 1, 8, '#a8502a');
  q(12, -16, 7, 8, B1); q(18, -12, 3, 3, B1); q(20, -11, 1, 1, '#e8e0c0'); q(14, -14, 1, 1, OL);
  q(15, -21, 1, 6, '#f4f0e0'); q(16, -22, 3, 1, '#f4f0e0'); q(18, -23, 2, 1, '#f4f0e0'); q(19, -14, 2, 1, '#f4f0e0');
  if (e.tel > 0) q(12, -24, 2, 2, '#ff4d4d');
}
function drawPtero(c, cx, by, e) {
  const y = by - 18 - Math.round(Math.sin(e.t * 3) * 2), q = mkQ(c, cx, y, (e.vx || 0) < 0, e.flash > 0), up = Math.sin(e.t * 9) > 0;
  shadow(c, cx, by, 12);
  const W1 = '#b07a52', W2 = '#7a4a32';
  if (up) { q(-17, -8, 12, 3, W2); q(-13, -5, 8, 2, W1); q(5, -8, 12, 3, W2); q(5, -5, 8, 2, W1); }
  else { q(-17, 0, 12, 3, W2); q(-13, -2, 8, 2, W1); q(5, 0, 12, 3, W2); q(5, -2, 8, 2, W1); }
  q(-4, -4, 9, 5, W1); q(3, -7, 5, 4, W1); q(7, -6, 7, 2, '#e8c070'); q(-1, -10, 6, 2, W2); q(5, -6, 1, 1, OL);
}
function drawSaber(c, cx, by, e) {
  const q = mkQ(c, cx, by, (e.vx || 0) < 0, e.flash > 0); shadow(c, cx, by, 16);
  const st = Math.floor(e.t * 8) % 2, F1 = '#d89a4a', F2 = '#a8702a';
  q(-8, -5, 2, 5 - st, F2); q(-4, -5, 2, 5, F2); q(3, -5 + st, 2, 5 - st, F2); q(7, -5, 2, 5, F2);
  q(-12, -11, 4, 2, F1); q(-9, -12, 18, 7, F1); q(-9, -6, 18, 1, '#f4e8d0'); for (let i = 0; i < 4; i++) q(-6 + i * 4, -12, 1, 4, '#5a3a1a');
  q(7, -16, 8, 7, F1); q(9, -10, 6, 2, '#f4e8d0'); q(11, -15, 1, 1, OL); q(7, -18, 2, 2, F2); q(12, -18, 2, 2, F2);
  q(10, -9, 1, 4, '#fff'); q(13, -9, 1, 4, '#fff');
}
function drawWolf(c, cx, by, e) {
  const q = mkQ(c, cx, by, (e.vx || 0) < 0, e.flash > 0); shadow(c, cx, by, 12);
  const st = Math.floor(e.t * 10) % 2, W1 = '#c8d4e4', W2 = '#8a9ab4';
  q(-6, -4, 2, 4 - st, W2); q(-2, -4, 2, 4, W2); q(2, -4 + st, 2, 4 - st, W2); q(5, -4, 2, 4, W2);
  q(-11, -11, 5, 2, W1); q(-7, -10, 13, 6, W1); q(-7, -5, 13, 1, W2);
  q(5, -14, 6, 6, W1); q(10, -11, 3, 2, W1); q(6, -16, 2, 2, W2); q(9, -16, 2, 2, W2); q(8, -12, 1, 1, '#4dd2ff');
}
function drawYeti(c, cx, by, e) {
  const q = mkQ(c, cx, by, (e.vx || 0) < 0, e.flash > 0); shadow(c, cx, by, 16);
  const Y1 = '#f4f8ff', Y2 = '#c8d4e8', st = Math.floor(e.t * 4) % 2;
  q(-6, -5, 4, 5, Y2); q(2, -5, 4, 5, Y2);
  q(-8, -21, 16, 17, Y1); q(-8, -6, 16, 2, Y2); q(-11, -19 + st, 3, 10, Y1); q(8, -19 - st, 3, 10, Y1);
  q(-4, -18, 8, 6, '#8ab0d0'); q(-3, -17, 2, 2, OL); q(1, -17, 2, 2, OL); q(-2, -14, 4, 1, '#3a4a6a');
  if (e.cd < 0.5) { q(8, -26, 6, 6, '#ffffff'); q(9, -25, 3, 2, '#e8f4ff'); }
}
// ---------------- Part 4 bosses
function drawTrex(c, cx, by, v) {
  const f = v.flash, G1 = f ? '#fff' : '#8a5a32', G2 = f ? '#fff' : '#5a3a1e', G3 = f ? '#fff' : '#b07a42', BEL = f ? '#fff' : '#e8d4a0';
  const r = (dx, dy, w, h, col) => R(c, cx + dx, by + dy, w, h, col), st = v.step;
  r(-8, -10, 6, 10 - st, G2); r(-9, -1, 8, 1, G2); r(2, -10, 6, 9 + st, G2); r(1, -1, 8, 1, G2);
  r(-24, -20, 10, 5, G1); r(-30, -18, 7, 3, G1); r(-34, -17, 5, 2, G2);
  r(-15, -26, 26, 17, G1); r(-12, -28, 20, 2, G3); r(-10, -14, 18, 5, BEL);
  for (let i = 0; i < 4; i++) r(-10 + i * 5, -27, 2, 3, G2);
  r(9, -18, 3, 2, G2); r(11, -17, 1, 3, G2);
  r(6, -34, 9, 10, G1); r(8, -40, 18, 10, G1); r(9, -41, 14, 1, G3);
  r(18, -38, 2, 2, v.dead ? OL : '#ffe066'); r(17, -39, 4, 1, G2);
  if (v.mouth) { r(12, -31, 15, 6, '#5a1020'); for (let i = 0; i < 5; i++) { r(13 + i * 3, -31, 1, 2, '#fff'); r(13 + i * 3, -27, 1, 2, '#fff'); } r(10, -26, 16, 3, G1); }
  else { r(10, -31, 16, 3, G1); r(12, -31, 14, 1, G2); for (let i = 0; i < 4; i++) r(14 + i * 3, -30, 1, 1, '#fff'); }
}
function trexStamp(B) {
  const cx = Math.round(B.x - cam.x), by = Math.round(B.y - cam.y), flip = B.face < 0 ? 1 : 0, fl = B.flash > 0 ? 1 : 0, mouth = B.mouth > 0 ? 1 : 0, dead = B.dead ? 1 : 0, step = B.step || 0;
  b.fillStyle = 'rgba(20,10,40,0.35)'; b.fillRect(cx - 44, by - 3, 88, 6);
  stamp(`trex|${flip}|${fl}|${mouth}|${dead}|${step}`, 140, 92, 70, 88, cx, by, (c, x, y) => { c.translate(x, y); c.scale(flip ? -2 : 2, 2); drawTrex(c, 0, 0, { flash: fl, mouth, dead, step }); });
}
function drawMammoth(c, cx, by, v) {
  const f = v.flash, F1 = f ? '#fff' : '#8a5a3a', F2 = f ? '#fff' : '#6a4228', F3 = f ? '#fff' : '#a8764a', TU = f ? '#fff' : '#f4ecd8';
  const r = (dx, dy, w, h, col) => R(c, cx + dx, by + dy, w, h, col), st = v.step;
  r(-14, -9, 6, 9 - st, F2); r(-6, -9, 6, 9, F2); r(4, -9, 6, 9 - (1 - st), F2); r(11, -9, 5, 9, F2);
  r(-18, -30, 32, 22, F1); r(-16, -32, 26, 2, F3); r(-20, -24, 3, 8, F2);
  for (let i = 0; i < 6; i++) r(-16 + i * 5, -10, 2, 3, F2);
  r(10, -34, 14, 16, F1); r(11, -36, 10, 3, F3); r(8, -31, 4, 12, F2);
  r(18, -30, 2, 2, v.dead ? OL : '#2a1a0a');
  if (v.trunkUp) { r(22, -40, 4, 12, F1); r(24, -45, 4, 6, F1); r(26, -46, 3, 2, F2); }
  else { r(21, -20, 4, 14, F1); r(22, -7, 4, 3, F1); r(24, -5, 2, 2, F2); }
  r(17, -20, 2, 3, TU); r(18, -17, 6, 2, TU); r(23, -19, 3, 2, TU); r(25, -21, 2, 2, TU);
}
function mammothStamp(B) {
  const cx = Math.round(B.x - cam.x), by = Math.round(B.y - cam.y), flip = B.face < 0 ? 1 : 0, fl = B.flash > 0 ? 1 : 0, dead = B.dead ? 1 : 0, step = B.step || 0, tu = B.trunkUp ? 1 : 0;
  b.fillStyle = 'rgba(20,10,40,0.35)'; b.fillRect(cx - 42, by - 3, 84, 6);
  stamp(`mam|${flip}|${fl}|${dead}|${step}|${tu}`, 124, 96, 62, 92, cx, by, (c, x, y) => { c.translate(x, y); c.scale(flip ? -2 : 2, 2); drawMammoth(c, 0, 0, { flash: fl, dead, step, trunkUp: tu }); });
  if (B.st === 'dazed' && !B.dead) for (let i = 0; i < 4; i++) { const a = time * 5 + i * 1.6; R(b, Math.round(cx + B.face * 30 + Math.cos(a) * 12), Math.round(by - 80 + Math.sin(a) * 3), 2, 2, '#ffe066'); }
}
function drawMachine(c, x, by, on, f) {
  R(c, x - 22, by - 6, 44, 6, '#4a4a5e'); R(c, x - 22, by - 6, 44, 1, '#8a8aa0'); R(c, x - 18, by, 36, 2, '#2a2a38');
  if (on) { for (let k = 0; k < 4; k++) { const rr = 14 - k * 3; for (let a = 0; a < 20; a++) { const an = a / 20 * Math.PI * 2 + f * 0.4 + k; R(c, Math.round(x + Math.cos(an) * rr) - 1, Math.round(by - 28 + Math.sin(an) * rr * 1.1) - 1, 2, 2, ['#4dd2ff', '#c77dff', '#a8f0ff', '#ffffff'][k]); } } }
  else { R(c, x - 12, by - 40, 24, 24, '#1a1a26'); if (f % 2) { R(c, x - 6, by - 34, 2, 6, '#ffe066'); R(c, x + 3, by - 26, 4, 1, '#ffe066'); } }
  for (let a = 0; a < 40; a++) { const an = a / 40 * Math.PI * 2, rx = Math.round(x + Math.cos(an) * 18), ry = Math.round(by - 28 + Math.sin(an) * 20); R(c, rx - 1, ry - 1, 3, 3, '#7a7a90'); R(c, rx, ry, 1, 1, '#c8c8dc'); }
  for (let k = 0; k < 4; k++) R(c, x - 15 + k * 10, by - 5, 3, 2, on ? ['#ff4d6d', '#ffe066', '#7dff6b', '#4dd2ff'][(k + f) % 4] : '#3a3a44');
  R(c, x + 20, by - 18, 10, 12, '#5a5a70'); R(c, x + 21, by - 17, 8, 5, on ? '#7dff6b' : '#2a3a2a'); R(c, x + 22, by - 10, 2, 2, '#ff4d6d'); R(c, x + 26, by - 10, 2, 2, '#ffe066');
}
function drawHouse(c, x, by) {
  R(c, x - 34, by - 40, 68, 40, '#f4e3c1'); R(c, x - 34, by - 40, 68, 2, '#d8c8a0'); R(c, x - 34, by - 2, 68, 2, '#b8a888');
  for (let i = 0; i < 18; i++) R(c, x - 38 + i * 2, by - 42 - i, 76 - i * 4, 2, i % 3 === 0 ? '#a83a2a' : '#c0402a');
  R(c, x + 18, by - 66, 8, 16, '#7a4a3a'); R(c, x + 17, by - 67, 10, 2, '#5a3a2a');
  R(c, x - 6, by - 24, 12, 24, '#8a5a33'); R(c, x - 5, by - 23, 10, 22, '#a8764a'); R(c, x + 2, by - 13, 2, 2, '#ffd23f');
  for (const wx of [-26, 14]) { R(c, x + wx, by - 30, 12, 12, '#5a3a20'); R(c, x + wx + 1, by - 29, 10, 10, '#8fd6ff'); R(c, x + wx + 5, by - 29, 1, 10, '#5a3a20'); R(c, x + wx + 1, by - 25, 10, 1, '#5a3a20'); }
  R(c, x - 9, by, 18, 3, '#9a9aa6');
  for (const fx of [-30, -22, 20, 28]) { R(c, x + fx, by - 3, 3, 3, '#ff7ab8'); R(c, x + fx + 1, by - 2, 1, 1, '#ffe066'); }
}
let iceT = 2, blizzT = 0;
// Khủng long bạo chúa: chases, bites with a lunge, sweeps its tail, roars (stuns the kids) and makes rocks fall
function updTrex(B, dt, tg) {
  const rage = B.hp < B.maxhp * 0.5;
  if (!B.raged && rage) { B.raged = true; SFX.roar(); shake = 10; say('Khủng long bạo chúa nổi giận!', 2.5); }
  if (B.summoned === 0 && B.hp < B.maxhp * 0.6) { B.summoned = 1; summon([['raptor', 3]], 'Khủng long bạo chúa gọi bầy khủng long nhỏ tới!'); }
  if (B.summoned === 1 && B.hp < B.maxhp * 0.3) { B.summoned = 2; summon([['raptor', 4]], 'Khủng long bạo chúa gọi bầy khủng long nhỏ tới!'); }
  const idle = () => { B.st = 'walk'; B.stT = rage ? 0.9 : 1.4; B.mouth = 0; };
  const walk = spd => { if (!tg) return; const dx = tg.x - B.x, dy = (tg.y - 10) - B.y, d = Math.hypot(dx, dy) || 1; if (d > 30) { B.x += dx / d * spd * dt; B.y += dy / d * spd * dt; } B.face = dx < 0 ? -1 : 1; B.step = Math.floor(B.t * 5) % 2; arenaClamp(B, 44); };
  B.stT -= dt;
  switch (B.st) {
    case 'intro': if (B.stT <= 0) idle(); break;
    case 'walk':
      walk(rage ? 34 : 24);
      if (B.stT <= 0) {
        let o = ['bite', 'bite', 'tail', 'stomp', 'roar']; if (rage) o.push('bite', 'stomp');
        o = o.filter(x => x !== B.last); const n = pick(o); B.last = n;
        if (n === 'bite' && tg) { B.st = 'biteTel'; B.stT = rage ? 0.55 : 0.75; B.mouth = 1; B.tx = tg.x; B.ty = tg.y; B.face = tg.x < B.x ? -1 : 1; warn(tg.x, tg.y, B.stT + 0.3, 22, 2); }
        else if (n === 'tail') { B.st = 'tailTel'; B.stT = 0.75; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; warn(B.x + Math.cos(a) * 50, B.y - 6 + Math.sin(a) * 30, 0.75, 20, 2); } }
        else if (n === 'roar') { B.st = 'roarTel'; B.stT = 0.6; B.mouth = 1; }
        else if (n === 'stomp') { B.st = 'stomp'; B.count = rage ? 4 : 3; B.subT = 0.2; }
        else idle();
      }
      break;
    case 'biteTel': if (B.stT <= 0) { B.st = 'lunge'; B.stT = 0.45; const dx = B.tx - B.x, dy = (B.ty - 10) - B.y, d = Math.hypot(dx, dy) || 1; B.vx = dx / d * 250; B.vy = dy / d * 250; SFX.bite(); } break;
    case 'lunge': B.x += B.vx * dt; B.y += B.vy * dt; arenaClamp(B, 44); B.step = Math.floor(B.t * 10) % 2; if (B.stT <= 0) { shake = 5; B.mouth = 0; B.st = 'recover'; B.stT = rage ? 0.5 : 0.8; } break;
    case 'recover': if (B.stT <= 0) idle(); break;
    case 'tailTel': B.face = Math.floor(B.t * 6) % 2 ? 1 : -1; if (B.stT <= 0) { shake = 6; SFX.boom(); idle(); } break;
    case 'roarTel':
      if (B.stT <= 0) {
        SFX.roar(); shake = 12; B.st = 'roar'; B.stT = 0.8;
        for (const p of players) if (!p.down && Math.hypot(p.x - B.x, p.y - B.y) < 130) { p.stunT = 1.1; addFloat(p.x, p.y - 30, '!!', '#ffe066'); }
        ringShots(B.x, B.y - 30, rage ? 14 : 10, 70, 'rock', Math.random());
      }
      break;
    case 'roar': if (B.stT <= 0) idle(); break;
    case 'stomp':
      B.subT -= dt;
      if (B.subT <= 0) { if (B.count-- > 0) { B.subT = 0.45; const t2 = pick(players.filter(q => !q.down)) || tg; if (t2) warn(t2.x + rnd(-14, 14), t2.y + rnd(-10, 10), 0.9, 16, 1); shake = 3; SFX.boom(); } else idle(); }
      break;
  }
}
// Voi ma mút: tusk charge (dazed after hitting a wall), stomp shockwave, snowball throws, blizzard
function updMammoth(B, dt, tg) {
  const rage = B.hp < B.maxhp * 0.5;
  if (!B.raged && rage) { B.raged = true; SFX.roar(); shake = 10; say('Voi ma mút nổi giận! Bão tuyết nổi lên!', 2.5); }
  if (B.summoned === 0 && B.hp < B.maxhp * 0.65) { B.summoned = 1; summon([['wolf', 3]], 'Voi ma mút gọi bầy sói tuyết!'); }
  if (B.summoned === 1 && B.hp < B.maxhp * 0.3) { B.summoned = 2; summon([['wolf', 3], ['saber', 1]], 'Voi ma mút gọi bầy sói tuyết!'); }
  const idle = () => { B.st = 'walk'; B.stT = rage ? 1 : 1.5; B.trunkUp = 0; };
  const walk = spd => { if (!tg) return; const dx = tg.x - B.x, dy = (tg.y - 10) - B.y, d = Math.hypot(dx, dy) || 1; if (d > 34) { B.x += dx / d * spd * dt; B.y += dy / d * spd * dt; } B.face = dx < 0 ? -1 : 1; B.step = Math.floor(B.t * 4) % 2; arenaClamp(B, 44); };
  B.stT -= dt;
  switch (B.st) {
    case 'intro': if (B.stT <= 0) idle(); break;
    case 'walk':
      walk(rage ? 26 : 18);
      if (B.stT <= 0) {
        let o = ['charge', 'stomp', 'throw', 'charge']; if (rage) o.push('blizzard', 'stomp');
        o = o.filter(x => x !== B.last); const n = pick(o); B.last = n;
        if (n === 'charge' && tg) {
          B.st = 'chargeTel'; B.stT = rage ? 0.7 : 0.9; B.face = tg.x < B.x ? -1 : 1;
          const dx = tg.x - B.x, dy = (tg.y - 10) - B.y, d = Math.hypot(dx, dy) || 1; B.vx = dx / d * 230; B.vy = dy / d * 230;
          for (let i = 1; i <= 6; i++) warn(B.x + dx / d * i * 30, B.y + dy / d * i * 30, B.stT + i * 0.05, 18, 2);
        }
        else if (n === 'stomp') { B.st = 'stompTel'; B.stT = 0.75; B.trunkUp = 1; warn(B.x, B.y - 4, 0.75, 52, 2); }
        else if (n === 'throw') { B.st = 'throw'; B.count = rage ? 4 : 3; B.subT = 0.3; B.trunkUp = 1; }
        else if (n === 'blizzard') { B.st = 'blizzard'; B.stT = 2.6; B.subT = 0; B.ang = Math.random() * 6; blizzT = 2.8; B.trunkUp = 1; }
        else idle();
      }
      break;
    case 'chargeTel': B.step = Math.floor(B.t * 12) % 2; if (Math.random() < 0.4) addParts(B.x - B.face * 20, B.y, 1, ['#fff', '#c8d4e8'], 30, 0.4); if (B.stT <= 0) { B.st = 'charge'; B.stT = 1.2; SFX.roar(); } break;
    case 'charge': {
      B.x += B.vx * dt; B.y += B.vy * dt; B.step = Math.floor(B.t * 10) % 2;
      const ox = B.x, oy = B.y; arenaClamp(B, 44);
      if (ox !== B.x || oy !== B.y || B.stT <= 0) { shake = 8; SFX.boom(); B.st = 'dazed'; B.stT = rage ? 1.1 : 1.6; ringShots(B.x, B.y - 30, 8, 60, 'snow', Math.random()); }
      break;
    }
    case 'dazed': if (B.stT <= 0) idle(); break;
    case 'stompTel': if (B.stT <= 0) { shake = 10; SFX.boom(); ringShots(B.x, B.y - 6, rage ? 16 : 12, 80, 'snow', Math.random()); B.st = 'recover'; B.stT = 0.6; } break;
    case 'recover': if (B.stT <= 0) idle(); break;
    case 'throw': B.subT -= dt; if (B.subT <= 0) { if (B.count-- > 0) { B.subT = 0.55; fanShots(B.x + B.face * 40, B.y - 50, tg, 3, 0.25, 110, 'snow'); SFX.fire(); } else idle(); } break;
    case 'blizzard':
      B.subT -= dt;
      if (B.subT <= 0) { B.subT = 0.12; B.ang += 0.5; fireShot(B.x, B.y - 40, Math.cos(B.ang) * 85, Math.sin(B.ang) * 85, 'snow'); fireShot(B.x, B.y - 40, -Math.cos(B.ang) * 85, -Math.sin(B.ang) * 85, 'snow'); }
      if (B.stT <= 0) idle();
      break;
  }
}
"""
rep('function summon(list) {', creatures + 'function summon(list, msg = \'Ác Quỷ gọi quái vật tới!\') {')
rep("  SFX.roar(); say('Ác Quỷ gọi quái vật tới!');", "  SFX.roar(); say(msg);")
rep("  if (B.kind === 'sdemon') updSdemon(B, dt, tg);\n", "  if (B.kind === 'sdemon') updSdemon(B, dt, tg);\n  if (B.kind === 'trex') updTrex(B, dt, tg);\n  if (B.kind === 'mammoth') updMammoth(B, dt, tg);\n")
rep("const keyOk = B.kind !== 'mega' || keyTaken || B.deadT > 8;", "const keyOk = !['mega', 'trex', 'mammoth'].includes(B.kind) || keyTaken || B.deadT > 8;")
s = replace_fn(s, 'bossHitPointsRaw', r"""function bossHitPointsRaw() {
  const B = boss; if (!B || B.dead) return [];
  if (B.kind === 'trex') return [{ x: B.x + B.face * 8, y: B.y - 34, r: 24, mul: 1 }];
  if (B.kind === 'mammoth') return [{ x: B.x + B.face * 6, y: B.y - 34, r: 26, mul: B.st === 'dazed' ? 1.5 : 1 }];
  return [];
}""")
rep("    if (B.kind === 'mega') { pickups.push({ kind: 'key', x: 160, y: 120, t: 0 }); B.surf = true; B.air = false; }",
    "    if (B.kind === 'mega') { pickups.push({ kind: 'key', x: 160, y: 120, t: 0 }); B.surf = true; B.air = false; }\n    if (B.kind === 'trex' || B.kind === 'mammoth') { pickups.push({ kind: 'tcrystal', x: 160, y: 4 * 16 + 8, t: 0 }); say('Tinh thể thời gian xuất hiện! Nhặt lấy nó!', 3); }")

# kids can be stunned by the T-Rex roar
rep("  if (p.down) return;\n  let mx = 0, my = 0, atk = false, sp = false, aim = null;",
    "  if (p.down) return;\n  if (p.stunT > 0) { p.stunT -= dt; p.moving = false; if (Math.random() < 0.3) addParts(p.x + rnd(-5, 5), p.y - 24, 1, ['#ffe066', '#fff'], 10, 0.4); return; }\n  let mx = 0, my = 0, atk = false, sp = false, aim = null;")
# falling icicles in the ice age, blizzard timer
rep("  for (const e of enemies) updEnemy(e, dt);",
    "  if (zoneKey === 'ice' && !gateOpen) { iceT -= dt; if (iceT <= 0) { iceT = 2.2 + Math.random() * 1.5; const v = pick(players.filter(q => !q.down)); if (v) warn(v.x + rnd(-24, 24), v.y + rnd(-16, 16), 1.1, 12, 1); } }\n  blizzT = Math.max(0, blizzT - dt);\n  for (const e of enemies) updEnemy(e, dt);")
rep("zoneKey === 'boat' ? ['#a8e0ff', '#fff', '#1f6fb0'] :", "zoneKey === 'ice' || zoneKey === 'icearena' ? ['#e8fbff', '#fff', '#a8d8f0'] : zoneKey === 'boat' ? ['#a8e0ff', '#fff', '#1f6fb0'] :")
rep("  if ((zoneKey === 'heaven' || zoneKey === 'palace') && Math.random() < 0.08)",
    "  if ((zoneKey === 'ice' || zoneKey === 'icearena') && Math.random() < (NX ? 0.3 : 0.6)) ambient.push({ x: rnd(-30, W), y: -4, vx: rnd(14, 30) + (blizzT > 0 ? 50 : 0), vy: rnd(24, 44), col: '#ffffff', life: 9, big: Math.random() < 0.3 });\n  if (zoneKey === 'dino' && Math.random() < 0.05) ambient.push({ x: rnd(0, W), y: -4, vx: rnd(-6, 6), vy: rnd(10, 20), col: '#7ab04a', life: 16 });\n  if ((zoneKey === 'heaven' || zoneKey === 'palace') && Math.random() < 0.08)")

# ---------------------------------------------------------------- drawing
rep("    if (boss.kind === 'sdemon') list.push({ y: boss.y + 40, f: () => sdemonStamp(boss) });",
    "    if (boss.kind === 'sdemon') list.push({ y: boss.y + 40, f: () => sdemonStamp(boss) });\n    if (boss.kind === 'trex') list.push({ y: boss.y, f: () => trexStamp(boss) });\n    if (boss.kind === 'mammoth') list.push({ y: boss.y, f: () => mammothStamp(boss) });")
rep("['npc', 'follower', 'freed', 'captive', 'citizen', 'crystal', 'totem', 'queenCage'].includes(o.type)",
    "['npc', 'follower', 'freed', 'captive', 'citizen', 'crystal', 'totem', 'queenCage', 'machine', 'house', 'block'].includes(o.type)")
rep("  if (zoneKey === 'lair' || zoneKey === 'throne') {",
    "  if (zoneKey === 'ice' || zoneKey === 'icearena') { b.globalAlpha = clamp(0.08 + (blizzT > 0 ? 0.28 : 0) + 0.04 * Math.sin(time * 1.3), 0, 1); R(b, 0, 0, W, H, '#ffffff'); b.globalAlpha = 1; }\n  if (zoneKey === 'lair' || zoneKey === 'throne') {")
# night at home: stars and the lit windows instead of the Part 3 shadow figure
i = s.index('  if (darkK > 0.02) {'); j = s.index('\n', i)
s = s[:i] + r"""  if (darkK > 0.02) {
    b.globalAlpha = darkK * 0.8; R(b, 0, 0, W, H, '#060418'); b.globalAlpha = 1;
    if (darkK > 0.5) {
      for (let i2 = 0; i2 < 30; i2++) { const tw = (Math.floor(time * 2 + i2) % 5) === 0; R(b, (i2 * 53 + 7) % W, (i2 * 29 + 3) % 70, 1, 1, tw ? '#fff' : '#c9b8e8'); }
      const hs = objs.find(o => o.type === 'house');
      if (hs) { const hx = Math.round(hs.x - cam.x), hy = Math.round(hs.y - cam.y); b.globalAlpha = Math.min(1, darkK); for (const wx of [-26, 14]) { R(b, hx + wx + 1, hy - 29, 10, 10, '#ffd86a'); R(b, hx + wx + 5, hy - 29, 1, 10, '#5a3a20'); R(b, hx + wx + 1, hy - 25, 10, 1, '#5a3a20'); } b.globalAlpha = 1; }
    }
  }""" + s[j:]
rep("    case 'throne': {", r"""    case 'machine': {
      const on = o.on ? 1 : 0, f = Math.floor(time * 6) % 4;
      if (o.fade !== undefined && STAGES[stageIdx].key === 'home' && state === 'dialog' && dialog && dialog.i >= 6) o.fade = Math.min(1, o.fade + 1 / 120);
      if (o.fade >= 1) break;
      if (o.fade) b.globalAlpha = 1 - o.fade;
      stamp(`mach|${on}|${f}`, 56, 54, 24, 50, cx, by, (c, x, y) => drawMachine(c, x, y, on, f));
      b.globalAlpha = 1;
      if (!on && Math.random() < 0.04) addParts(o.x + rnd(-10, 10), o.y - 30, 2, ['#ffe066', '#fff'], 40, 0.3);
      break;
    }
    case 'house': stamp('house', 80, 72, 40, 68, cx, by, (c, x, y) => drawHouse(c, x, y)); break;
    case 'block': {
      if (o.broken) break;
      const f = o.flash > 0, ice = zoneKey === 'ice', cr = o.hp < o.maxhp / 2 ? 1 : 0;
      stamp(`blk|${ice ? 1 : 0}|${f ? 1 : 0}|${cr}`, 18, 18, 9, 16, cx, by, (c, x, y) => {
        if (ice) { R(c, x - 8, y - 16, 16, 16, f ? '#fff' : '#a8d8f0'); R(c, x - 8, y - 16, 16, 2, '#e8fbff'); R(c, x - 6, y - 12, 3, 8, '#e8fbff'); R(c, x - 8, y - 1, 16, 1, '#6a9ac0'); if (cr) { R(c, x, y - 14, 1, 6, '#4a7aa0'); R(c, x + 1, y - 9, 3, 1, '#4a7aa0'); } }
        else { R(c, x - 8, y - 12, 16, 10, f ? '#fff' : '#8a5a33'); R(c, x - 8, y - 12, 16, 2, '#a8764a'); R(c, x - 8, y - 7, 16, 1, '#6b4226'); R(c, x + 4, y - 12, 4, 10, '#c8a06a'); R(c, x + 5, y - 10, 2, 6, '#8a5a33'); R(c, x - 8, y - 2, 16, 2, '#3a2a1a'); if (cr) R(c, x - 2, y - 12, 1, 10, '#3a2a1a'); }
      });
      break;
    }
    case 'throne': {""")
rep("    case 'chest': R(c, x - 6, y - 8, 12, 7, '#6b4226');",
    r"""    case 'shard': { const gl = (ph >> 1) % 4 === 0; R(c, x - 2, y - 11, 4, 2, '#a8f0ff'); R(c, x - 3, y - 9, 6, 5, '#4dd2ff'); R(c, x - 2, y - 4, 4, 2, '#2a8ac0'); R(c, x - 1, y - 10, 1, 5, '#fff'); if (gl) { R(c, x + 4, y - 12, 1, 1, '#fff'); R(c, x - 5, y - 7, 1, 1, '#fff'); } break; }
    case 'tcrystal': { R(c, x - 3, y - 14, 6, 3, '#ffe8ff'); R(c, x - 5, y - 11, 10, 7, '#c77dff'); R(c, x - 3, y - 4, 6, 2, '#8a3aa0'); R(c, x - 2, y - 12, 2, 7, '#fff'); if ((ph >> 1) % 3 === 0) { R(c, x + 6, y - 13, 1, 1, '#fff'); R(c, x - 7, y - 9, 1, 1, '#fff'); } break; }
    case 'chest': R(c, x - 6, y - 8, 12, 7, '#6b4226');""")
rep("    case 'bullet': R(b, x - 2, y - 1, 4, 3, '#ffe066');", "    case 'snow': R(b, x - 3, y - 3, 6, 6, '#e8f4ff'); R(b, x - 2, y - 3, 3, 2, '#fff'); R(b, x + 1, y + 1, 2, 2, '#a8c8e8'); break;\n    case 'bullet': R(b, x - 2, y - 1, 4, 3, '#ffe066');")

# ---------------------------------------------------------------- HUD, arrow, finale
i = s.index("  if (st.type === 'hub' || st.type === 'scene') obj ="); j = s.index("  if (st.type === 'boss') obj = 'BOSS';", i)
s = s[:i] + "  if (st.type === 'scene') obj = st.name || '';\n  if (st.type === 'explore') obj = gateOpen ? 'Đi lên trên!' : `Năng lượng ${prog}/${st.need}`;\n" + s[j:]
rep("T({ mega: 'MEGALODON', sdemon: 'ÁC QUỶ SIÊU CẤP' }[boss.kind], W / 2, by - 11, 9, '#ff9aa2', 'center');", "T({ trex: 'KHỦNG LONG BẠO CHÚA', mammoth: 'VOI MA MÚT' }[boss.kind] || '', W / 2, by - 11, 9, '#ff9aa2', 'center');")
rep("boss.dead ? '#ff9ec7' : boss.kind === 'sdemon' ? '#c77dff' : '#4dd2ff'", "boss.dead ? '#ff9ec7' : boss.kind === 'trex' ? '#7ad13f' : '#4dd2ff'")
i = s.index("  if (st.key === 'sea') pickups.filter"); j = s.index("  const c = { x: cam.x + W / 2", i)
s = s[:i] + "  pickups.filter(p => p.kind === 'shard' && !p.hidden).forEach(p => cands.push(p));\n  if (!cands.length) objs.filter(o => o.type === 'block' && !o.broken).forEach(o => cands.push(o));\n" + s[j:]
s = replace_fn(s, 'drawEnd', r"""function drawEnd() {
  R(b, 0, 0, W, H, '#05040c');
  for (let i = 0; i < 46; i++) { const tw = (Math.floor(time * 2 + i) % 7) === 0; R(b, (i * 73 + 11) % W, (i * 37 + 5) % 110, 1, 1, tw ? '#fff' : i % 4 ? '#5a4a8a' : '#c9b8e8'); }
  if (endT > 0.3) stamp('house', 80, 72, 40, 68, W / 2, H + 16, (c, x, y) => drawHouse(c, x, y));
  if (endT > 0.3) { R(b, W / 2 - 25, H - 13, 10, 10, '#ffd86a'); R(b, W / 2 + 15, H - 13, 10, 10, '#ffd86a'); }
  if (endT > 0.8) T('THE END', W / 2, 10, 26, '#ffd23f', 'center', '#7a1f5a');
  // first the journey and the message, then the credits
  if (endT < 8) {
    if (endT > 1.8) T('Đảo Rồng · Thành Phố Bỏ Hoang · Sa Mạc · 18 Tầng Địa Ngục', W / 2, 42, 9, '#c9b8e8', 'center', null);
    if (endT > 2.3) T('Thành Phố Thiên Đường · Thời Tiền Sử · Kỷ Băng Hà · Nhà', W / 2, 52, 9, '#c9b8e8', 'center', null);
    if (endT > 3.2) wrap('Cuộc phiêu lưu lớn nhất không phải là đi được bao xa, mà là luôn có người đồng hành để cùng trở về nhà.', 270, 11).forEach((l, i) => T(l, W / 2, 70 + i * 12, 11, '#fff', 'center'));
  } else {
    if (endT > 8.2) T('TÁC GIẢ', W / 2, 42, 9, '#ffd23f', 'center', null);
    if (endT > 8.6) T('Pham Lac Nguyen & Pham Lac Vien', W / 2, 52, 14, '#ffffff', 'center', '#4a1f6a');
    if (endT > 9.2) T('với sự hỗ trợ của Claude', W / 2, 70, 10, '#c9b8e8', 'center', null);
    if (endT > 10) T('Cảm ơn gia đình đã luôn bên con.', W / 2, 88, 11, '#ff9ec7', 'center', null);
    if (endT > 10.8) { T('Hai con yêu gia đình', W / 2, 101, 12, '#ff9ec7', 'center', null); const hw = measure('Hai con yêu gia đình', 12) / 2; drawHeart(b, Math.round(W / 2 - hw - 14), 104, 1); drawHeart(b, Math.round(W / 2 + hw + 6), 104, 1); }
    if (endT > 11.5) T('Cảm ơn bạn đã chơi!', W / 2, 116, 9, '#8fd6ff', 'center', null);
  }
  if (endT > 12.5 && Math.floor(time * 2) % 2) T(NX ? 'Nhấn A để về màn hình chính' : 'Nhấn ENTER để về màn hình chính', W / 2, 126, 10, '#fff', 'center', null);
}""")
rep("case 'end': endT += dt; if (endT > 6 && tap(CONFIRM))", "case 'end': endT += dt; if (endT > 12.5 && tap(CONFIRM))")
rep("  if (flashT > 0) { b.globalAlpha = Math.min(1, flashT);", "  if (flashT > 0 && state !== 'play') flashT = Math.max(0, flashT - 1 / 60);\n  if (flashT > 0) { b.globalAlpha = Math.min(1, flashT);")
rep("  gateOpen = false; prog = 0; toast = null; banner = null;", "  gateOpen = false; prog = 0; toast = null; banner = null; blizzT = 0; iceT = 2;")

# ---------------------------------------------------------------- the family (family.js, shared with the app's Part 2 and 3)
FAMJS = open(os.path.join(here, 'family.js'), encoding='utf-8').read()
rep('function npcStamp(', FAMJS + "const FAM_AT = { lab: ['dad', 'sister'], dino: ['dad', 'sister'], ice: ['dad', 'sister'], portal: ['dad', 'mom', 'sister'], home: ['dad', 'mom', 'sister'] };\nfunction npcStamp(")
rep("function drawNpc(c, cx, by, who, ph = 0) {\n  shadow(c, cx, by, 12);", "function drawNpc(c, cx, by, who, ph = 0) {\n  if (FAM.includes(who)) return drawFam(c, cx, by, who);\n  shadow(c, cx, by, 12);")
rep("b.drawImage(portraitCan, 11, who === 'shadow' ? 0 : 7,", "b.drawImage(portraitCan, 11, who === 'shadow' ? 0 : FAM.includes(who) ? 4 : 7,")
rep("citizen: ['#e8f0ff', '#ffe8a0'] }[who]", "citizen: ['#e8f0ff', '#ffe8a0'], sister: ['#8a4ab0', '#c77dff'], dad: ['#2a6a5a', '#3aa892'], mom: ['#b0304a', '#ff9ec7'] }[who]")
rep("shadow: ['???', '#ff4d4d'], narr: ['', '#fff'] }[L.who];", "shadow: ['???', '#ff4d4d'], sister: ['CHỊ GÁI', '#d9a0ff'], dad: ['BA', '#7ee0c8'], mom: ['MẸ', '#ff9ec7'], narr: ['', '#fff'] }[L.who];")
rep("'machine', 'house', 'block'].includes(o.type)", "'machine', 'house', 'block', 'fam', 'famCage'].includes(o.type)")
rep("    case 'house':", "    case 'fam': famStamp(o.who, o.x, o.y); break;\n    case 'famCage': drawFamObj(o); break;\n    case 'house':")
rep("  if (B.dead) {\n    B.deadT += dt;\n", "  if (B.dead) {\n    B.deadT += dt;\n    if (B.deadT > 1.2) famOpen();\n")
rep("  buildStage(st);\n  if (st.flashIn)", "  buildStage(st);\n  famPlace(st.key);\n  if (st.flashIn)")
rep("if (st.key === 'mammoth') boss = {", "if (st.key === 'mammoth') objs.push({ type: 'famCage', who: 'mom', ice: true, x: 284, y: 140, open: false });\n    if (st.key === 'mammoth') boss = {")
rep("state === 'dialog' && dialog && dialog.i >= 6)", "state === 'dialog' && dialog && dialog.i >= dialog.lines.findIndex(l => l.fade))")
s = s.replace("  hp: () => players.map(", "  grab: (k) => { const t = pickups.find(q => q.kind === k); if (t) { players[0].x = t.x; players[0].y = t.y; } return !!t; },\n  hp: () => players.map(", 1)
s = s.replace('globalThis.__trumbo3', 'globalThis.__trumbo4').replace("fillText('TRUMBO 3'", "fillText('TRUMBO 4'")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(s)
print('index.html', len(s))

# Trump-Po (Phần 1) cho Nintendo Switch (máy đã hack)

File cài làm sẵn: **`dist/trump-po.nsp`** (khoảng 31 MB). Chép vào thư mục Install của DBI là tự cài.

Muốn dùng dạng `.nro` (mở bằng Homebrew Menu) thì chạy `npm run dist` để tạo `trump-po.nro`.

## Yêu cầu

- Switch V1 (Erista, chưa vá) đã chạy custom firmware **Atmosphère** và có **Homebrew Menu (hbmenu)**.
- Thẻ microSD có thư mục `/switch/` (máy đã hack thường có sẵn).

## Cài đặt

1. Tắt máy, rút thẻ microSD, cắm vào máy tính.
2. Tạo thư mục `/switch/trump-po/` trên thẻ.
3. Chép `trump-po.nro` vào thư mục đó: `/switch/trump-po/trump-po.nro`.
4. Cắm thẻ lại vào Switch, khởi động vào Atmosphère như mọi lần.

## Mở game

- **Nên mở qua chế độ "title override":** giữ nút **R** trong lúc bấm mở một game bất kỳ trên màn hình chính, Homebrew Menu sẽ hiện ra. Cách này cho game dùng đủ bộ nhớ.
- Mở qua Album (applet mode) cũng được, nhưng bộ nhớ ít hơn nên có thể chạy chậm hoặc bị thoát.
- Trong Homebrew Menu, chọn **Trump-Po - Phieu Luu Dao Rong**.

## Tay cầm

- **2 người:** trước khi mở game, vào **Controllers > Change Grip/Order** trên màn hình chính. Mỗi người cầm 1 tay cầm (Joy-Con cầm ngang, Joy-Con ghép đôi hoặc Pro Controller). **Người số 1 là Trump, người số 2 là Poly.**
- **1 người:** chọn "1 NGƯỜI" ở màn hình đầu, máy sẽ điều khiển Poly.

| Nút | Tác dụng |
|---|---|
| Cần điều khiển / D-pad | Di chuyển, chọn trong menu |
| A hoặc B | Đánh / bắn, xác nhận |
| X hoặc Y | Chiêu đặc biệt (Trump: lốc xoáy, Poly: bong bóng hồi máu) |
| + | Tạm dừng. Ở màn hình chính thì + là thoát game |
| - | Tắt/bật nhạc. Trong lúc tạm dừng: lưu và về màn hình chính |

## Cài dạng .nsp (game hiện ngay trên màn hình chính)

File `.nsp` phải được ký bằng **khóa riêng của chính máy Switch** (`prod.keys`). Khóa này không được phép chia sẻ, nên file `.nsp` phải tự build trên máy tính của anh. Chỉ cần làm một lần, mất khoảng 5 phút:

1. **Lấy prod.keys từ máy Switch:** chép `Lockpick_RCM.bin` vào thẻ SD, khởi động vào payload này (qua Hekate: *Payloads > Lockpick_RCM*), chọn *Dump from SysNAND*. File được lưu ở `sd:/switch/prod.keys`.
2. **Cài Node.js** (bản LTS) trên máy tính: https://nodejs.org
3. **Tải mã nguồn:** https://github.com/lacphams4/erpsanxuat.com/archive/refs/heads/claude/kind-mccarthy-pzyart.zip rồi giải nén.
   (File .nsp làm sẵn: `dist/trump-po.nsp`.)
4. Chép `prod.keys` vào thư mục `games/trump-po/switch/` (cùng chỗ với file này).
5. **Windows:** bấm đúp `build-nsp.bat`. **macOS/Linux:** chạy `./build-nsp.sh`.
6. Ra file `trump-po.nsp` (khoảng 31 MB). Cài bằng **DBI, Tinfoil hoặc Goldleaf** như các game .nsp khác. Máy cần có **sigpatches** (máy đã cài .nsp được thì thường đã có sẵn).

Game sẽ hiện trên màn hình chính với tên *Trump-Po - Phieu Luu Dao Rong*, Title ID `01005452554D1000`. Bản .nsp mở thẳng từ màn hình chính, không cần giữ nút R.

`prod.keys` và `*.nsp` đã nằm trong `.gitignore` để không vô tình đưa khóa lên GitHub.

## Build lại từ mã nguồn

Mã game nằm ở `../index.html` (cùng một file chạy được trên trình duyệt). Script trong file tự nhận biết khi đang chạy trên Switch.

```bash
cd games/trump-po/switch
npm install
npm run dist     # tạo romfs/main.js từ ../index.html rồi đóng gói ra trump-po.nro
```

Công cụ đóng gói: [nx.js](https://nxjs.n8.io) (`@nx.js/nro`, chế độ `--fat`). Font VT323 dùng giấy phép SIL OFL (xem `romfs/OFL.txt`).

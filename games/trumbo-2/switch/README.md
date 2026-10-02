# Trumbo 2 cho Nintendo Switch (máy đã hack)

File cài: **`trumbo-2.nro`** (khoảng 54 MB, đã kèm sẵn bộ chạy nx.js, không cần cài thêm gì).

## Yêu cầu

- Switch V1 (Erista, chưa vá) đã chạy custom firmware **Atmosphère** và có **Homebrew Menu (hbmenu)**.
- Thẻ microSD có thư mục `/switch/` (máy đã hack thường có sẵn).

## Cài đặt

1. Tắt máy, rút thẻ microSD, cắm vào máy tính.
2. Tạo thư mục `/switch/trumbo-2/` trên thẻ.
3. Chép `trumbo-2.nro` vào thư mục đó: `/switch/trumbo-2/trumbo-2.nro`.
4. Cắm thẻ lại vào Switch, khởi động vào Atmosphère như mọi lần.

## Mở game

- **Nên mở qua chế độ "title override":** giữ nút **R** trong lúc bấm mở một game bất kỳ trên màn hình chính, Homebrew Menu sẽ hiện ra. Cách này cho game dùng đủ bộ nhớ.
- Mở qua Album (applet mode) cũng được, nhưng bộ nhớ ít hơn nên có thể chạy chậm hoặc bị thoát.
- Trong Homebrew Menu, chọn **Trumbo 2 - Thanh Pho Bi Lang Quen**.
- Lần đầu mở, máy hỏi chọn **tài khoản người dùng**. Game dùng tài khoản đó để lưu tiến độ.

## Tay cầm

- **2 người:** trước khi mở game, vào **Controllers > Change Grip/Order** trên màn hình chính. Mỗi người cầm 1 tay cầm (Joy-Con cầm ngang, Joy-Con ghép đôi hoặc Pro Controller). **Người số 1 là Trump, người số 2 là Poly.**
- **1 người:** chọn "1 NGƯỜI" ở màn hình đầu, máy sẽ điều khiển Poly.

| Nút | Tác dụng |
|---|---|
| Cần điều khiển / D-pad | Di chuyển, chọn trong menu |
| A hoặc B | Đánh / bắn, xác nhận |
| X hoặc Y | Chiêu đặc biệt (Trump: lốc xoáy, Poly: bong bóng hồi máu) |
| L / R / ZL / ZR | Đổi vũ khí (khi đã mua vũ khí thứ hai) |
| + | Tạm dừng. Ở màn hình chính thì + là thoát game |
| - | Tắt/bật nhạc. Trong lúc tạm dừng: lưu và về màn hình chính |

Pugi (chú chó) do máy điều khiển, không cần bấm nút.

## Cài dạng .nsp (game hiện ngay trên màn hình chính)

File `.nsp` phải được ký bằng **khóa riêng của chính máy Switch** (`prod.keys`). Khóa này không được phép chia sẻ, nên file `.nsp` phải tự build trên máy tính của anh. Chỉ cần làm một lần, mất khoảng 5 phút:

1. **Lấy prod.keys từ máy Switch:** chép `Lockpick_RCM.bin` vào thẻ SD, khởi động vào payload này (qua Hekate: *Payloads > Lockpick_RCM*), chọn *Dump from SysNAND*. File được lưu ở `sd:/switch/prod.keys`.
2. **Cài Node.js** (bản LTS) trên máy tính: https://nodejs.org
3. **Tải mã nguồn:** https://github.com/lacphams4/erpsanxuat.com/archive/refs/heads/claude/kind-mccarthy-pzyart.zip rồi giải nén.
4. Chép `prod.keys` vào thư mục `games/trumbo-2/switch/` (cùng chỗ với file này).
5. **Windows:** bấm đúp `build-nsp.bat`. **macOS/Linux:** chạy `./build-nsp.sh`.
6. Ra file `trumbo-2.nsp` (khoảng 31 MB). Cài bằng **DBI, Tinfoil hoặc Goldleaf** như các game .nsp khác. Máy cần có **sigpatches** (máy đã cài .nsp được thì thường đã có sẵn).

Game sẽ hiện trên màn hình chính với tên *Trumbo 2 - Thanh Pho Bi Lang Quen*, Title ID `01005452554D4000`. Bản .nsp mở thẳng từ màn hình chính, không cần giữ nút R.

`prod.keys` và `*.nsp` đã nằm trong `.gitignore` để không vô tình đưa khóa lên GitHub.

## Build lại từ mã nguồn

Mã game nằm ở `../index.html` (cùng một file chạy được trên trình duyệt). Script trong file tự nhận biết khi đang chạy trên Switch.

```bash
cd games/trumbo-2/switch
npm install
npm run dist     # tạo romfs/main.js từ ../index.html rồi đóng gói ra trumbo-2.nro
```

Công cụ đóng gói: [nx.js](https://nxjs.n8.io) (`@nx.js/nro`, chế độ `--fat`). Font VT323 dùng giấy phép SIL OFL (xem `romfs/OFL.txt`).

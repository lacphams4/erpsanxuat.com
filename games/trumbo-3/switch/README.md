# Trumbo 3 cho Nintendo Switch (máy đã hack)

File cài: **`dist/trumbo-3.nsp`** (khoảng 31 MB, đã kèm sẵn bộ chạy nx.js).

## Cài đặt bằng DBI

1. Chép `trumbo-3.nsp` vào thư mục **Install** trên thẻ SD (như các game .nsp khác).
2. Mở DBI, game tự cài. Máy cần có **sigpatches** (máy đã cài .nsp được thì thường có sẵn).
3. Game hiện trên màn hình chính với tên *Trumbo 3 - Thanh Pho Thien Duong*, Title ID `01005452554D5000`.

## Tay cầm

- **2 người:** vào **Controllers > Change Grip/Order** trước khi mở game. **Tay cầm số 1 là Trump, số 2 là Poly.**
- **1 người:** chọn "1 NGƯỜI" ở màn hình đầu, máy sẽ điều khiển Poly.

| Nút | Tác dụng |
|---|---|
| Cần điều khiển / D-pad | Di chuyển, chọn trong menu |
| A hoặc B | Đánh / bắn, xác nhận |
| X hoặc Y | Chiêu đặc biệt |
| L / R / ZL / ZR | Đổi vũ khí (Trump: Kiếm / Chùy, Poly: Ná / Súng lục) |
| + | Tạm dừng. Ở màn hình chính thì + là thoát game |
| - | Tắt/bật nhạc. Trong lúc tạm dừng: lưu và về màn hình chính |

Pugi do máy điều khiển. Pugi tự cắn, sủa, nhử quái, **đánh hơi** đồ bị giấu (để lại dấu chân dẫn đường) và **cứu chủ** khi Trump hoặc Poly bị hạ gục.

## Build lại .nsp

Cần `prod.keys` của chính máy Switch, chép vào thư mục này. Sau đó bấm đúp `build-nsp.bat` (Windows) hoặc chạy `./build-nsp.sh` (macOS/Linux). Cách lấy `prod.keys` xem `../../trumbo-2/switch/README.md`.

Mã game nằm ở `../index.html` (chơi được trên trình duyệt). `npm run build` tạo `romfs/main.js` từ file đó.

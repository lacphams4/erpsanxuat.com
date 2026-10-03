# TRUMBO - ứng dụng Android (Google Play)

Ba phần game được gộp thành một ứng dụng có màn hình chính và 3 phần nối tiếp nhau (xem `STORY.md`):
TRUMBO - Part 1: Dragon Island, Part 2: The Lost City, Part 3: Heavenly City.

- 3 ngôn ngữ: English, Tiếng Việt, 中文 (chọn trên màn hình chính; lần đầu tự theo ngôn ngữ của máy)
- Người chơi đặt tên riêng cho hai nhân vật (mặc định Trump và Poly)

- Tên gói (application ID): `com.erpsanxuat.trumbo` (không đổi được sau khi đã đăng lên Play)
- Phiên bản: 1.1.0 (versionCode 3)
- Android 7.0 trở lên, target API 36
- Không xin quyền nào, không quảng cáo, không thu thập dữ liệu, chơi không cần mạng

## Các file trong thư mục này

| Thư mục / file | Nội dung |
|---|---|
| `dist/AnhEmNhaTrumbo-1.1.0.aab` | **File để tải lên Google Play** (đã ký bằng khóa upload) |
| `dist/AnhEmNhaTrumbo-1.1.0-test.apk` | Bản chạy thử, cài thẳng vào điện thoại (tên gói có đuôi `.test`, cài song song được với bản từ Play) |
| `store/` | Icon 512, ảnh bìa 1024x500 và ảnh chụp màn hình cho từng ngôn ngữ, nội dung trang Play 3 thứ tiếng (`listing.md`) |
| `web/i18n/` | Bản dịch (`translations.py` sinh ra `en.json`, `zh.json`), script cắt phông chữ Trung |
| `web/` | Màn hình chính, `app.js` (điều khiển cảm ứng, tay cầm, chuyển chương) và `build-web.mjs` |
| `android/` | Dự án Android (Gradle). Game là các file web trong `app/src/main/assets/www` |
| `.github/workflows/trumbo-android.yml` (ở gốc repo) | GitHub Actions tự build mỗi khi `android/` thay đổi |

## Chạy thử trên điện thoại

1. Tải `dist/AnhEmNhaTrumbo-1.1.0-test.apk` về điện thoại Android.
2. Mở file, cho phép "Cài ứng dụng không rõ nguồn gốc" khi được hỏi.
3. Xoay ngang điện thoại để chơi. Nút Back: tạm dừng / chơi tiếp / về màn hình chính.

## Đăng lên Google Play

1. **Tài khoản nhà phát triển** tại https://play.google.com/console (phí một lần 25 USD).
   - Tài khoản **tổ chức** (S4 Consulting) cần số D-U-N-S của công ty, nhưng được đăng thẳng lên kênh Production.
   - Tài khoản **cá nhân** mới phải cho ít nhất 12 người thử kín (closed testing) liên tục 14 ngày rồi mới được phát hành công khai.
2. **Create app**: tên "TRUMBO", ngôn ngữ mặc định English (thêm bản dịch Tiếng Việt và 中文 cho trang Play), loại **Game**, **Free**.
3. **App content**: điền theo mục "Các mục khai báo" trong `store/listing.md`. Cần một đường link công khai tới chính sách quyền riêng tư (`web/privacy.html`).
4. **Store listing**: dán chữ và tải ảnh trong thư mục `store/`.
5. **Release**: Testing > Internal testing (nên làm trước) hoặc Production > Create new release.
   - Bật **Play App Signing** (mặc định).
   - Tải lên file `dist/AnhEmNhaTrumbo-1.1.0.aab`.
6. Gửi duyệt. Google thường duyệt trong vài ngày; ứng dụng cho trẻ em có thể lâu hơn.

## Khóa upload (quan trọng)

File `.aab` được ký bằng **khóa upload riêng** (`trumbo-upload.jks`). Khóa này **không** nằm trong repo này (repo công khai). Hãy cất khóa và mật khẩu ở nơi an toàn.

- Mọi bản cập nhật sau này phải ký bằng đúng khóa đó.
- Nếu mất khóa, có thể xin Google đặt lại khóa upload trong Play Console (Setup > App signing), vì khóa ký thật do Google giữ.

## Sửa bản dịch

1. Sửa câu trong `web/i18n/translations.py` (mỗi dòng: câu tiếng Việt gốc, tiếng Anh, tiếng Trung), chạy `python3 translations.py`.
2. Nếu có thêm chữ Trung mới: `python3 web/i18n/make-font.py <file fusion-pixel-12px-proportional-sc ... .woff2>` (gói npm `@fontsource/fusion-pixel-12px-proportional-sc`).
3. Câu tiếng Việt mới trong game: chạy `python3 web/i18n/extract.py android/app/src/main/assets/www/ch*.html` để xem danh sách cần dịch.

## Cập nhật phiên bản mới

1. Sửa game ở các thư mục `games/trump-po`, `games/trumbo-2`, `games/trumbo-3` (hoặc `web/`).
2. `cd games/trumbo-app/web && node build-web.mjs` để tạo lại `android/app/src/main/assets/www`.
3. Tăng `versionCode` (bắt buộc) và `versionName` trong `android/app/build.gradle`.
4. Đẩy lên GitHub. GitHub Actions sẽ build và ghi kết quả vào `dist/ci/` (`app-release-unsigned.aab`, `app-test.apk`).
5. Ký bundle bằng khóa upload:

   ```bash
   jarsigner -keystore trumbo-upload.jks -signedjar AnhEmNhaTrumbo-x.y.z.aab dist/ci/app-release-unsigned.aab upload
   ```

   Hoặc build trực tiếp bằng Android Studio: mở thư mục `android/`, chọn *Build > Generate Signed App Bundle*.

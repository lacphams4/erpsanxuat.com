# TRUMBO STUDIO - Play Console developer page

Play Console > Developer account > Play developer profile > Developer page.

| Field | File / text |
|---|---|
| Developer icon (512 x 512, 24-bit PNG) | `trumbo-studio-icon-512.png` |
| Header image (4096 x 2304, 24-bit PNG) | `trumbo-studio-header-4096x2304.png` |
| Featured app | TRUMBO (after the app is published) |
| Developer website | optional, leave empty |

Promotional text (max 140 characters):

- English (default): `TRUMBO STUDIO makes pixel adventures for kids and families. Our first game was dreamed up by two kids who love their family.`
- Tiếng Việt: `TRUMBO STUDIO làm game phiêu lưu pixel cho trẻ em và gia đình. Game đầu tiên do hai bạn nhỏ nghĩ ra, với tình yêu dành cho gia đình.`
- 中文: `TRUMBO STUDIO为孩子和家庭制作像素冒险游戏。我们的第一款游戏由两个深爱家人的孩子构思。`

`make-studio.js` redraws both images from the game's own sprites (Playwright, run against a page that exposes the Part 4 drawing functions).

# Email assets

Host these files on your CDN or object storage and point the template variables at the public HTTPS URLs.

## Required files

| File | Suggested path | Size | Notes |
|------|----------------|------|-------|
| `logo.png` | `/assets/email/logo.png` | ~134×67 display | Export from brand kit; PNG only (no SVG in email) |
| `icon-twitter.png` | `/assets/email/icon-twitter.png` | 20×20 | Gray `#98A2B3` |
| `icon-facebook.png` | `/assets/email/icon-facebook.png` | 20×20 | Gray `#98A2B3` |
| `icon-instagram.png` | `/assets/email/icon-instagram.png` | 20×20 | Gray `#98A2B3` |

The app logo source lives at `app/assets/svg/logo.svg` (embedded PNG). Export a clean PNG from design for best email results.

## Deliverability tips

- Serve assets from the same root domain as your sending domain when possible.
- Do not hotlink from localhost or signed URLs that expire quickly (receipt links are the exception — those should be short-lived signed URLs generated per send).

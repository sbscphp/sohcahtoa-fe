# Email assets

Host these files on your CDN or object storage and point the template variables at the public HTTPS URLs.

## Required files

| File | Suggested path | Size | Notes |
|------|----------------|------|-------|
| `logo.png` | `/assets/email/logo.png` | ~134×67 display | Export from brand kit; PNG only (no SVG in email) |

Social media links (X, Facebook, Instagram) are rendered as plain text links in the footer — no image assets required.

The app logo source lives at `app/assets/svg/logo.svg` (embedded PNG). Export a clean PNG from design for best email results.

## Deliverability tips

- Serve assets from the same root domain as your sending domain when possible.
- Do not hotlink from localhost or signed URLs that expire quickly (receipt links are the exception — those should be short-lived signed URLs generated per send).

# Email assets (app-hosted)

These files are served by the Next.js app from `public/email/` — no separate CDN required.

| File | URL path |
|------|----------|
| `logo.png` | `{APP_ORIGIN}/email/logo.png` |
| `icon-x.png` | `{APP_ORIGIN}/email/icon-x.png` |
| `icon-facebook.png` | `{APP_ORIGIN}/email/icon-facebook.png` |
| `icon-instagram.png` | `{APP_ORIGIN}/email/icon-instagram.png` |

Templates reference them via `{{app_url}}/email/...`. Backend only needs to pass `app_url` (your deployed frontend origin, e.g. `https://app.sohcahtoa.com`).

**Email requirement:** URLs must still be absolute HTTPS — email clients fetch images over the internet. “Internal” here means hosted on your app domain, not a third-party CDN.

## Updating the logo

Replace `public/email/logo.png` (exported from `app/assets/svg/logo.svg`). Re-run extraction if the SVG changes:

```bash
python3 - <<'PY'
import re, base64, pathlib
svg = pathlib.Path("app/assets/svg/logo.svg").read_text()
data = re.search(r'xlink:href="data:image/png;base64,([^"]+)"', svg).group(1)
pathlib.Path("public/email/logo.png").write_bytes(base64.b64decode(data))
PY
```

SVG sources for social icons are also in this folder; PNGs are used in emails for Outlook compatibility.

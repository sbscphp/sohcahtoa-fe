# SohCahToa Email Templates (Termii)

HTML email templates for upload to [Termii](https://developers.termii.com/email-product-notification). Zip this `templates/email` folder and hand off to backend.

## INFORMATION

- **Table-based layout** (`role="presentation"`)
- **Inline styles** on critical elements (plus a small `<style>` block for resets/media queries)
- **MSO conditionals** for Outlook buttons and DPI
- **Hidden preheader** text for inbox preview
- **Hosted images only** (no base64, no SVG in body)
- **`{{variable}}` placeholders** compatible with Termii's template API

## Folder structure

```
templates/email/
├── README.md
├── links.defaults.json       # Replace placeholder URLs before go-live
├── verify-email-otp.html
├── reset-password-otp.html
├── pta-funds-remitted.html
├── bta-funds-remitted.html
├── partials/                 # Source-of-truth snippets (not uploaded to Termii)
│   ├── head.html
│   ├── header.html
│   ├── footer.html
│   ├── otp-boxes.html
│   └── security-notice.html
└── assets/                   # Host these on CDN; update {{logo_url}} etc.
    └── README.md
```

## Before upload — fix these links

Replace every `YOUR_*` placeholder in `links.defaults.json`, then ensure the same values are passed on every Termii send (or baked into the HTML if Termii does not support a given variable globally).

| Variable | Purpose |
|----------|---------|
| `{{logo_url}}` | Hosted PNG logo (~134×67 display) |
| `{{app_url}}` | Main app / marketing site |
| `{{support_email}}` | `support@sohcahtoabdc.com` |
| `{{support_phone}}` | E.164 format, e.g. `+2348012345678` |
| `{{unsubscribe_url}}` | One-click unsubscribe (required for bulk/marketing) |
| `{{preferences_url}}` | Notification preferences page |
| `{{receipt_url}}` | Signed download link (PTA/BTA only) |
| `{{twitter_url}}`, `{{facebook_url}}`, `{{instagram_url}}` | Social profile URLs |
| `{{icon_*_url}}` | 20×20 PNG icons (gray `#98A2B3`) |

**Images must be HTTPS and publicly accessible.** Termii and most clients block remote images until the user allows them; use a stable CDN domain aligned with your sending domain for better deliverability.

## Termii variable syntax

Termii replaces `{{variable_name}}` in the template body via the `variables` object when calling:

`POST /api/templates/send-email`

Docs: https://developers.termii.com/email-product-notification

### Shared variables (all templates)

| Variable | Example | Notes |
|----------|---------|-------|
| `first_name` | `Fiyin` | Recipient greeting |
| `recipient_email` | `user@example.com` | Shown in footer |
| `company_name` | `SohCahToa Holdings` | |
| `company_address` | `Lagos State, Nigeria` | |
| `current_year` | `2026` | |
| `logo_url` | `https://cdn.../logo.png` | |
| `app_url` | `https://app...` | |
| `support_email` | `support@sohcahtoabdc.com` | |
| `unsubscribe_url` | `https://...` | |
| `preferences_url` | `https://...` | |
| `twitter_url`, `facebook_url`, `instagram_url` | | |
| `icon_twitter_url`, `icon_facebook_url`, `icon_instagram_url` | | |

### OTP templates (`verify-email-otp`, `reset-password-otp`)

| Variable | Example | Notes |
|----------|---------|-------|
| `otp_digit_1` … `otp_digit_6` | `7`, `8`, `9`… | Split 6-char OTP in backend |
| `expiry_minutes` | `10` | |

**Backend OTP split example (Node):**

```js
const digits = otpCode.padStart(6, "0").split("");
const variables = {
  first_name: user.firstName,
  otp_digit_1: digits[0],
  otp_digit_2: digits[1],
  otp_digit_3: digits[2],
  otp_digit_4: digits[3],
  otp_digit_5: digits[4],
  otp_digit_6: digits[5],
  expiry_minutes: "10",
  // ...shared variables
};
```

### Remittance templates (`pta-funds-remitted`, `bta-funds-remitted`)

| Variable | Example |
|----------|---------|
| `transaction_id` | `TXN-2026-001234` |
| `amount_display` | `five thousand US dollars ($5,000)` |
| `bank_name` | `Access Bank` |
| `account_number` | `0123456789` |
| `branch_name` | `Victoria Island Branch` |
| `street_address` | `123 Adeola Odeku Street` |
| `city_state` | `Victoria Island, Lagos` |
| `support_phone` | `+2348012345678` |
| `support_agent_name` | `Mary Adeola` |
| `receipt_url` | Signed PDF/receipt URL |

## Suggested Termii subjects

| Template file | Subject line |
|---------------|--------------|
| `verify-email-otp.html` | Verify your SohCahToa email |
| `reset-password-otp.html` | Reset your SohCahToa password |
| `pta-funds-remitted.html` | Your PTA funds have been remitted |
| `bta-funds-remitted.html` | Your BTA funds have been remitted |

## Sample API payload

```json
{
  "template_id": "TERMII_TEMPLATE_ID",
  "email_configuration_id": "TERMII_EMAIL_CONFIG_ID",
  "api_key": "YOUR_API_KEY",
  "email": "customer@example.com",
  "subject": "Verify your SohCahToa email",
  "variables": {
    "first_name": "Fiyin",
    "recipient_email": "customer@example.com",
    "otp_digit_1": "7",
    "otp_digit_2": "8",
    "otp_digit_3": "9",
    "otp_digit_4": "5",
    "otp_digit_5": "2",
    "otp_digit_6": "0",
    "expiry_minutes": "10",
    "company_name": "SohCahToa Holdings",
    "company_address": "Lagos State, Nigeria",
    "current_year": "2026",
    "support_email": "support@sohcahtoabdc.com",
    "logo_url": "https://cdn.example.com/email/logo.png",
    "app_url": "https://app.example.com",
    "unsubscribe_url": "https://app.example.com/unsubscribe?token=abc",
    "preferences_url": "https://app.example.com/settings/notifications",
    "twitter_url": "https://twitter.com/sohcahtoa",
    "facebook_url": "https://facebook.com/sohcahtoa",
    "instagram_url": "https://instagram.com/sohcahtoa",
    "icon_twitter_url": "https://cdn.example.com/email/icon-twitter.png",
    "icon_facebook_url": "https://cdn.example.com/email/icon-facebook.png",
    "icon_instagram_url": "https://cdn.example.com/email/icon-instagram.png"
  }
}
```

## Testing checklist

1. Upload each `.html` file to Termii dashboard.
2. Send test to Gmail, Outlook.com, and Apple Mail.
3. Confirm logo and social icons load (HTTPS CDN).
4. Confirm OTP digits render in all six boxes.
5. Confirm "Download Receipt" button works on mobile (PTA/BTA).
6. Confirm `mailto:` and `tel:` links open correctly.
7. Validate unsubscribe/preferences URLs return 200.

## Updating shared chrome

Edit files in `partials/`, then copy changes into each full template (Termii requires one file per template). Header, footer, OTP row, and security notice are identical across OTP emails; remittance emails share header/footer only.

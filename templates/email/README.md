# SohCahToa Email Templates (Termii)

HTML email templates for upload to [Termii](https://developers.termii.com/email-product-notification). Zip this `templates/email` folder and hand off to backend.

## Technical notes

- **Table-based layout** (`role="presentation"`)
- **Inline styles** on critical elements (plus a small `<style>` block for resets/media queries)
- **MSO conditionals** for Outlook buttons and DPI
- **Hidden preheader** text for inbox preview
- **Hosted images only** (no base64, no SVG in body)
- **`{{variable}}` placeholders** compatible with Termii's template API

## Backend template routing

Backend chooses template by **event**, then **transaction type** (settled only). Only templates that exist in Figma/design are included — there is **no** "transaction created/submitted" email until design adds one.

| Event | Condition | Template file | Termii subject (suggested) |
|-------|-----------|---------------|----------------------------|
| `EMAIL_VERIFY` | — | `verify-email-otp.html` | Verify your SohCahToa email |
| `PASSWORD_RESET` | — | `reset-password-otp.html` | Reset your SohCahToa password |
| `REFUND_REQUIRED` | any transaction type | `refund-bank-details-request.html` | Complete your refund request |
| `SETTLED` | `transaction_type = pta` | `pta-funds-remitted.html` | Your PTA funds have been remitted |
| `SETTLED` | `transaction_type = bta` | `bta-funds-remitted.html` | Your BTA funds have been remitted |
| `SETTLED` | `transaction_type = school_fees` | `school-fee-disbursed.html` | Your school fee has been disbursed |
| `SETTLED` | `transaction_type = medical` | `medical-fee-disbursed.html` | Your medical fee payment has been disbursed |
| `SETTLED` | `transaction_type = professional_body` | `professional-body-fee-disbursed.html` | Your professional body fee has been disbursed |
| `SETTLED` | `transaction_type = tourist` | `tourist-card-pickup.html` | Your prepaid card is ready for pickup |

### Pseudocode (backend)

```js
function resolveEmailTemplate(event, transactionType) {
  if (event === "EMAIL_VERIFY") return "verify-email-otp";
  if (event === "PASSWORD_RESET") return "reset-password-otp";
  if (event === "REFUND_REQUIRED") return "refund-bank-details-request";

  if (event === "SETTLED") {
    const map = {
      pta: "pta-funds-remitted",
      bta: "bta-funds-remitted",
      school_fees: "school-fee-disbursed",
      medical: "medical-fee-disbursed",
      professional_body: "professional-body-fee-disbursed",
      tourist: "tourist-card-pickup",
    };
    const template = map[transactionType];
    if (!template) throw new Error(`No settled email for type: ${transactionType}`);
    return template;
  }

  throw new Error(`Unsupported email event: ${event}`);
}
```

### URL variables by event

| Variable | SETTLED templates | REFUND template |
|----------|-------------------|-----------------|
| `{{receipt_url}}` | Required | Do not send |
| `{{provide_bank_details_url}}` | Do not send | Required |

## Folder structure

```
templates/email/
├── README.md
├── links.defaults.json
├── verify-email-otp.html
├── reset-password-otp.html
├── pta-funds-remitted.html
├── bta-funds-remitted.html
├── school-fee-disbursed.html
├── medical-fee-disbursed.html
├── professional-body-fee-disbursed.html
├── tourist-card-pickup.html
├── refund-bank-details-request.html
├── partials/
└── assets/                   # Docs only — image files live in public/email/

public/email/                 # Served by Next.js at {app_url}/email/*
├── logo.png
├── icon-x.png
├── icon-facebook.png
└── icon-instagram.png
```

## App-hosted images (no separate CDN)

Logo and social icons are in `public/email/`. Templates reference them as:

- `{{app_url}}/email/logo.png`
- `{{app_url}}/email/icon-x.png`
- `{{app_url}}/email/icon-facebook.png`
- `{{app_url}}/email/icon-instagram.png`

Backend only passes `app_url` (your deployed frontend origin). Email clients still need **absolute HTTPS URLs** — “internal” means your app domain, not a third-party CDN.

## Before upload — fix these links

Replace every `YOUR_*` placeholder in `links.defaults.json`. Pass values on every Termii send via the `variables` object.

| Variable | Purpose |
|----------|---------|
| `{{app_url}}` | Deployed frontend origin (also serves `/email/*` assets) |
| `{{support_email}}` | `support@sohcahtoabdc.com` |
| `{{support_phone}}` | E.164 format, e.g. `+2348012345678` |
| `{{unsubscribe_url}}` | One-click unsubscribe |
| `{{preferences_url}}` | Notification preferences page |
| `{{receipt_url}}` | Signed receipt download (SETTLED only) |
| `{{provide_bank_details_url}}` | Refund bank-details form (REFUND only) |
| `{{x_url}}`, `{{facebook_url}}`, `{{instagram_url}}` | Social profile link targets |

## Termii variable reference

Termii replaces `{{variable_name}}` via the `variables` object on `POST /api/templates/send-email`.

Docs: https://developers.termii.com/email-product-notification

### Shared variables (all templates)

| Variable | Example |
|----------|---------|
| `first_name` | `Fiyin` |
| `recipient_email` | `user@example.com` |
| `company_name` | `SohCahToa Holdings` |
| `company_address` | `Lagos State, Nigeria` |
| `current_year` | `2026` |
| `app_url` | e.g. `https://app.sohcahtoa.com` — logo/icons use `/email/*` on this origin |
| `support_email` | See links.defaults.json |
| `support_phone`, `support_agent_name` | |
| `unsubscribe_url`, `preferences_url` | |
| `x_url`, `facebook_url`, `instagram_url` | Where social icon links go |

### OTP templates

| Variable | Notes |
|----------|-------|
| `otp_digit_1` … `otp_digit_6` | Split 6-char OTP in backend |
| `expiry_minutes` | e.g. `10` |

```js
const digits = otpCode.padStart(6, "0").split("");
// otp_digit_1: digits[0], etc.
```

### Remittance split — PTA / BTA (`pta-funds-remitted`, `bta-funds-remitted`)

| Variable | Example |
|----------|---------|
| `transaction_id` | `TXN-2026-001234` |
| `amount_display` | `five thousand US dollars ($5,000)` |
| `bank_name` | `Access Bank` |
| `account_number` | `0123456789` |
| `branch_name` | `Victoria Island Branch` |
| `street_address` | `123 Adeola Odeku Street` |
| `city_state` | `Victoria Island, Lagos` |
| `receipt_url` | Signed PDF URL |

### Beneficiary disbursement — School / Medical / Professional Body

| Variable | Example |
|----------|---------|
| `transaction_id` | `TXN-2026-001234` |
| `amount_display` | `$5,000 (N7,500,000)` |
| `beneficiary_name` | School / hospital / professional body name |
| `beneficiary_account` | Masked or full account details |
| `disbursement_date` | `7 July 2026` |
| `receipt_url` | Signed PDF URL |

### Tourist card pickup

| Variable | Example |
|----------|---------|
| `transaction_id` | `TXN-2026-001234` |
| `branch_name` | `Victoria Island Branch` |
| `street_address` | `123 Adeola Odeku Street` |
| `city_state` | `Victoria Island, Lagos` |
| `pickup_date` | `Available Immediately` or specific date |
| `receipt_url` | Signed PDF URL |

### Refund bank details (all transaction types)

| Variable | Example |
|----------|---------|
| `transaction_id` | `TXN-2026-001234` |
| `transaction_type_label` | `PTA`, `School Fees`, `Medical`, etc. |
| `refund_amount_display` | `N750,000` |
| `provide_bank_details_url` | Deep link to refund bank-details form |

## Sample API payload (settled — school fees)

```json
{
  "template_id": "TERMII_TEMPLATE_ID",
  "email_configuration_id": "TERMII_EMAIL_CONFIG_ID",
  "api_key": "YOUR_API_KEY",
  "email": "customer@example.com",
  "subject": "Your school fee has been disbursed",
  "variables": {
    "first_name": "Fiyin",
    "recipient_email": "customer@example.com",
    "transaction_id": "TXN-2026-001234",
    "amount_display": "$5,000 (N7,500,000)",
    "beneficiary_name": "University of Lagos",
    "beneficiary_account": "Access Bank •••• 6789",
    "disbursement_date": "7 July 2026",
    "receipt_url": "https://app.example.com/receipts/signed/abc",
    "support_phone": "+2348012345678",
    "support_agent_name": "Mary Adeola",
    "company_name": "SohCahToa Holdings",
    "company_address": "Lagos State, Nigeria",
    "current_year": "2026",
    "support_email": "support@sohcahtoabdc.com",
    "app_url": "https://app.example.com",
    "unsubscribe_url": "https://app.example.com/unsubscribe?token=abc",
    "preferences_url": "https://app.example.com/settings/notifications",
    "x_url": "https://x.com/sohcahtoa",
    "facebook_url": "https://facebook.com/sohcahtoa",
    "instagram_url": "https://instagram.com/sohcahtoa"
  }
}
```

## Testing checklist

1. Upload each `.html` file to Termii dashboard.
2. Send test to Gmail, Outlook.com, and Apple Mail.
3. Confirm logo and social icons load from `{app_url}/email/*`.
4. OTP: confirm all six digit boxes render.
5. PTA/BTA/Refund: confirm CTA buttons work on mobile.
6. School/Medical/Professional/Tourist: confirm receipt link works.
7. Refund: confirm `provide_bank_details_url` opens correct form.
8. Validate unsubscribe/preferences URLs return 200.

## Out of scope (no template yet)

- Transaction created / submitted acknowledgment
- Transaction approved / in-progress updates
- Any transaction type not listed in the routing table above

Add new templates only when design provides them.

## Updating shared chrome

Edit files in `partials/`, then copy changes into each full template. Termii requires one self-contained HTML file per template.

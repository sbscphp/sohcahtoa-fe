# Agent Auth Components

This directory contains reusable authentication components for the Agent application.

## Components

### `AuthLayout.tsx`
Two-column layout component for agent authentication screens:
- Left column: Branding with logo, welcome message, and country flags
- Right column: Form content area

### `PasswordRequirements.tsx`
Reusable component that displays password validation requirements:
- Shows checkmarks when requirements are met
- Displays all requirements when `showAll` prop is true
- Validates: length (8-12), uppercase/lowercase, numbers, special characters

### `PasswordCreatedModal.tsx`
Success modal displayed after password creation:
- Green checkmark icon with animated effect
- Success message
- "Continue to log in" button

## Usage

These components are used in the agent auth flow:
1. `/agent/auth/login` - Login page
2. `/agent/auth/create-password` - Password creation page
3. `/agent/auth/verify-otp` - OTP verification page

## Design Flow

1. **Login** → User enters email and password
2. **OTP Verification** → If login successful, OTP is sent
3. **Create Password** → After OTP verification (for new users)
4. **Password Created Success** → Modal shown after password creation
5. **Dashboard** → Redirect after successful authentication

## Reused Components

- `CustomButton` from `/app/admin/_components/CustomButton`
- `OtpModal` from `/app/admin/_components/OtpModal`
- Mantine UI components (`PasswordInput`, `TextInput`, `PinInput`, etc.)

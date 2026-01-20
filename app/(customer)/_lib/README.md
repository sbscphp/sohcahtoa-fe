# Design Tokens & Theme Setup

This directory contains utilities for configuring Mantine UI alongside Tailwind CSS v4 using colors extracted from Figma design tokens.

## Files

- **`mantine-theme.ts`** - Mantine theme configuration with extracted colors

## Colors Source

Colors are extracted directly from `Light Mode.tokens.json` and defined in:
- `mantine-theme.ts` - For Mantine components
- `globals.css` - For Tailwind CSS classes

All colors are raw hex values extracted from the Figma tokens file.

## Using Colors in Your Code

### In Mantine Components

```tsx
import { Button } from '@mantine/core';

// Mantine automatically uses the theme colors
<Button color="orange">Primary Button</Button>
<Button color="gray">Secondary Button</Button>
```

### In Tailwind CSS

```tsx
// Use the CSS variables defined in globals.css
<div className="bg-primary-400 text-white">
  Primary background
</div>

<div className="bg-gray-100 text-gray-800">
  Gray background
</div>
```

### Direct Color Values

Colors are defined directly in `mantine-theme.ts` and `globals.css`. You can reference them:

```tsx
// In Mantine theme
const primaryColor = '#DD4F05'; // primary-400

// In Tailwind/CSS
const primaryColor = 'var(--color-primary-400)'; // or use Tailwind class bg-primary-400
```

## Color Scales

### Primary (Orange)
- `00` - Lightest (#FFF6F1)
- `25` - Very Light (#F8DCCD)
- `50` - Light (#F4C4AC)
- `100` - Lighter (#EEA782)
- `200` - Light (#E88A58)
- `300` - Medium Light (#E36C2F)
- `400` - Base (#DD4F05) ⭐
- `500` - Medium Dark (#B84204)
- `600` - Dark (#933503)
- `700` - Darker (#6F2803)
- `800` - Very Dark (#4A1A02)
- `900` - Darkest (#2C1001)

### Gray
- `25` - Lightest (#F9F9F9)
- `50` - Very Light (#E1E0E0)
- `100` - Light (#CCCACA)
- `200` - Medium Light (#B2AFAF)
- `300` - Medium (#8F8B8B)
- `400` - Medium Dark (#6C6969)
- `500` - Dark (#4D4B4B)
- `600` - Darker (#323131)
- `700` - Very Dark (#1F1E1E)
- `800` - Darkest (#131212)
- `900` - Black (#0B0A0A)

### System Colors
- **Error (Red)**: `25` through `900`
- **Success (Green)**: `25` through `900`
- **Warning (Yellow)**: `25` through `900`

## Updating Tokens

When new updated tokens:

1. Replace `Light Mode.tokens.json` in the root directory
2. Extract the new hex color values from the JSON file
3. Update colors in `mantine-theme.ts` with the new hex values
4. Update CSS variables in `globals.css` with the new hex values

## Folder Structure

```
app/(customer)/
├── _components/     # Shared components
├── _lib/           # Utilities and theme config
├── _hooks/         # Custom React hooks
├── _types/         # TypeScript types
└── _utils/         # Helper functions
```

The `_` prefix indicates these folders are not part of Next.js routing.

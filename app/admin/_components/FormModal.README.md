# FormModal Component

A fully dynamic, reusable form modal component for the admin application. This component supports various input types, validation, file uploads, and loading states.

## Features

✅ **Dynamic Input Types**: text, email, tel, number, select, file, textarea  
✅ **Built-in Validation**: Required fields, email, phone, number ranges, file size  
✅ **File Upload Support**: With size limits and type restrictions  
✅ **Loading States**: Disable inputs and show loading spinner during submission  
✅ **Initial Values**: Support for edit forms with pre-filled data  
✅ **Fully Typed**: Complete TypeScript support  
✅ **Responsive Grid Layout**: 2-column layout on larger screens, single column on mobile  
✅ **Smart Field Sizing**: File and textarea inputs automatically span full width  
✅ **Brand Styling**: Matches admin app design system  

## Basic Usage

```tsx
import { useState } from "react";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";

function MyComponent() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const fields: FormField[] = [
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "Enter username",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    // Your API call here
    await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setLoading(false);
    setOpened(false);
  };

  return (
    <>
      <button onClick={() => setOpened(true)}>Open Form</button>
      
      <FormModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create User"
        description="Fill in user details"
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
}
```

## Props

### FormModalProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `opened` | `boolean` | Yes | - | Controls modal visibility |
| `onClose` | `() => void` | Yes | - | Called when modal should close |
| `title` | `string` | Yes | - | Modal title |
| `description` | `string` | No | - | Optional subtitle text |
| `fields` | `FormField[]` | Yes | - | Array of form fields |
| `onSubmit` | `(data: Record<string, any>) => void \| Promise<void>` | Yes | - | Form submission handler |
| `submitLabel` | `string` | No | `"Submit"` | Submit button text |
| `cancelLabel` | `string` | No | `"Close"` | Cancel button text |
| `loading` | `boolean` | No | `false` | Shows loading state |
| `initialValues` | `Record<string, any>` | No | `{}` | Pre-fill form values |

### FormField

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Field name (used as key in form data) |
| `label` | `string` | Yes | Field label shown to user |
| `type` | `InputType` | Yes | Input type: `"text"`, `"email"`, `"tel"`, `"number"`, `"select"`, `"file"`, `"textarea"` |
| `required` | `boolean` | No | Whether field is required |
| `placeholder` | `string` | No | Placeholder text |
| `options` | `string[]` or `{value: string, label: string}[]` | No* | Options for select type (*required for select) |
| `accept` | `string` | No | File types for file input (e.g., `".pdf,.jpg"`) |
| `maxSize` | `number` | No | Max file size in MB (default: 2) |
| `rows` | `number` | No | Rows for textarea |
| `minRows` | `number` | No | Min rows for textarea |
| `min` | `number` | No | Min value for number input |
| `max` | `number` | No | Max value for number input |
| `disabled` | `boolean` | No | Disable the field |
| `description` | `string` | No | Helper text below field |

## Input Types

### Text, Email, Tel

```tsx
{
  name: "email",
  label: "Email Address",
  type: "email",
  required: true,
  placeholder: "user@example.com",
}
```

### Number

```tsx
{
  name: "age",
  label: "Age",
  type: "number",
  required: true,
  min: 18,
  max: 100,
}
```

### Select (Dropdown)

```tsx
// Simple array
{
  name: "status",
  label: "Status",
  type: "select",
  required: true,
  options: ["Active", "Inactive", "Pending"],
}

// With labels
{
  name: "role",
  label: "User Role",
  type: "select",
  required: true,
  options: [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "Regular User" },
  ],
}
```

### File Upload

```tsx
{
  name: "document",
  label: "Upload Document",
  type: "file",
  required: true,
  accept: ".pdf,.jpg,.jpeg,.png",
  maxSize: 5, // 5 MB
  description: "Max file size: 5 MB",
}
```

**Note**: File uploads return a `File` object. To send to API:

```tsx
const handleSubmit = async (data: Record<string, any>) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    if (data[key] instanceof File) {
      formData.append(key, data[key]);
    } else {
      formData.append(key, String(data[key]));
    }
  });
  
  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
};
```

### Textarea

```tsx
{
  name: "description",
  label: "Description",
  type: "textarea",
  required: false,
  placeholder: "Enter description...",
  minRows: 4,
}
```

## Validation

The FormModal includes built-in validation:

- **Required Fields**: Validates non-empty values
- **Email**: Validates proper email format
- **Phone**: Validates phone number format
- **Number Range**: Validates min/max values
- **File Size**: Validates file doesn't exceed maxSize

Errors are displayed below each field and clear when the user starts typing.

## Examples

### Create Form

```tsx
const createFields: FormField[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
  },
];

<FormModal
  opened={opened}
  onClose={() => setOpened(false)}
  title="Create User"
  fields={createFields}
  onSubmit={handleCreate}
  submitLabel="Create"
  loading={loading}
/>
```

### Edit Form (with initial values)

```tsx
const editFields: FormField[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: ["Active", "Inactive"],
  },
];

const existingData = {
  name: "John Doe",
  status: "Active",
};

<FormModal
  opened={opened}
  onClose={() => setOpened(false)}
  title="Edit User"
  fields={editFields}
  onSubmit={handleUpdate}
  submitLabel="Update"
  loading={loading}
  initialValues={existingData}
/>
```

### Complex Form with All Input Types

```tsx
const complexFields: FormField[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    required: true,
    placeholder: "+234 00 0000 0000",
  },
  {
    name: "age",
    label: "Age",
    type: "number",
    min: 18,
    max: 100,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
  },
  {
    name: "bio",
    label: "Bio",
    type: "textarea",
    minRows: 3,
  },
  {
    name: "avatar",
    label: "Profile Picture",
    type: "file",
    accept: ".jpg,.jpeg,.png",
    maxSize: 2,
  },
];
```

## Integration with Notifications

```tsx
import { notifications } from "@mantine/notifications";

const handleSubmit = async (data: Record<string, any>) => {
  try {
    setLoading(true);
    await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    notifications.show({
      title: "Success",
      message: "Form submitted successfully",
      color: "green",
    });
    
    setOpened(false);
  } catch (error) {
    notifications.show({
      title: "Error",
      message: "Failed to submit form",
      color: "red",
    });
  } finally {
    setLoading(false);
  }
};
```

## Styling

The FormModal uses Mantine components and follows the admin app design system:

- **Primary Color**: `#DD4F05` (orange brand color)
- **Border Radius**: `xl` (rounded)
- **Centered Modal**: Opens in center of screen
- **Responsive**: Adapts to different screen sizes

## Responsive Grid Layout

The form automatically arranges fields in a responsive grid:

### Layout Behavior

- **Large Screens (≥768px)**: Regular inputs (text, email, tel, number, select) display in **2 columns**
- **Small Screens (<768px)**: All inputs stack in a **single column**
- **File & Textarea Inputs**: Always span **full width** on all screen sizes

### Example Layout

```tsx
const fields: FormField[] = [
  { name: "firstName", type: "text" },     // Left column
  { name: "lastName", type: "text" },      // Right column
  { name: "email", type: "email" },        // Left column
  { name: "phone", type: "tel" },          // Right column
  { name: "document", type: "file" },      // Full width
  { name: "notes", type: "textarea" },     // Full width
];

// Result on large screens:
// [firstName] [lastName]
// [email]     [phone]
// [document - full width]
// [notes - full width]
```

### Benefits

- **Better Space Utilization**: Makes efficient use of modal width
- **Improved UX**: Related fields appear side-by-side
- **Mobile Optimized**: Automatically stacks on small screens
- **Smart Sizing**: File uploads and long text areas get full width

## Tips

1. **Keep it Simple**: Only include necessary fields
2. **Clear Labels**: Use descriptive, user-friendly labels
3. **Helpful Placeholders**: Show format examples
4. **Validate Early**: Mark required fields clearly
5. **Loading States**: Always use loading prop during API calls
6. **Error Handling**: Show notifications on success/error
7. **File Uploads**: Clearly state size and type limits

## Common Patterns

### Conditional Fields

```tsx
const [formData, setFormData] = useState<Record<string, any>>({});

const fields: FormField[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["Individual", "Company"],
    required: true,
  },
  // Show company name only if type is "Company"
  ...(formData.type === "Company" ? [{
    name: "companyName",
    label: "Company Name",
    type: "text" as const,
    required: true,
  }] : []),
];
```

### Multi-step Forms

For multi-step forms, use multiple FormModals or consider creating a wizard component.

## See Also

- `FormModal.examples.tsx` - More usage examples
- `AgentTable.tsx` - Real-world implementation
- [Mantine Docs](https://mantine.dev/) - Component library documentation

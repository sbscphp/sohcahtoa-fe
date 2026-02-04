# FileUpload Component

A beautiful, reusable file upload component with drag-and-drop support, matching the admin app design system.

## Features

✅ **Drag & Drop**: Intuitive drag-and-drop file upload  
✅ **File Validation**: Size and type validation built-in  
✅ **Beautiful UI**: Matches the design with empty and filled states  
✅ **File Info Display**: Shows file name and size when uploaded  
✅ **Delete Functionality**: Easy file removal with trash icon  
✅ **Error Handling**: Clear error messages for validation failures  
✅ **Disabled State**: Proper disabled styling and behavior  
✅ **Accessibility**: Keyboard accessible and ARIA labels  

## Design States

### Empty State
```
┌─────────────────────────────────────────────────┐
│  📄  Click or drag to upload KYC                │
│      Max. 2 MB                                  │
└─────────────────────────────────────────────────┘
```

### Filled State
```
┌─────────────────────────────────────────────────┐
│  📄  Kunle's International passport.pdf    🗑️   │
│      200 KB                                     │
└─────────────────────────────────────────────────┘
```

## Basic Usage

```tsx
import { useState } from "react";
import FileUpload from "@/app/admin/_components/FileUpload";

function MyComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    setError(""); // Clear error when file changes
  };

  return (
    <FileUpload
      label="KYC Document"
      value={file}
      onChange={handleFileChange}
      accept=".pdf,.jpg,.jpeg,.png"
      maxSize={2}
      required
      error={error}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | - | Label text displayed above the input |
| `value` | `File \| null` | Yes | - | Current file value |
| `onChange` | `(file: File \| null) => void` | Yes | - | Callback when file changes |
| `accept` | `string` | No | `".pdf,.jpg,.jpeg,.png"` | Accepted file types |
| `maxSize` | `number` | No | `2` | Maximum file size in MB |
| `required` | `boolean` | No | `false` | Whether field is required |
| `disabled` | `boolean` | No | `false` | Disable the input |
| `error` | `string` | No | - | Error message to display |

## Usage Examples

### PDF Upload
```tsx
<FileUpload
  label="Upload Contract"
  value={contract}
  onChange={setContract}
  accept=".pdf"
  maxSize={5}
  required
/>
```

### Image Upload
```tsx
<FileUpload
  label="Profile Picture"
  value={avatar}
  onChange={setAvatar}
  accept=".jpg,.jpeg,.png,.webp"
  maxSize={3}
/>
```

### Document Upload with Custom Types
```tsx
<FileUpload
  label="Supporting Documents"
  value={document}
  onChange={setDocument}
  accept=".pdf,.doc,.docx,.txt"
  maxSize={10}
  required
/>
```

### Disabled State
```tsx
<FileUpload
  label="ID Document"
  value={idDoc}
  onChange={setIdDoc}
  disabled={isSubmitting}
/>
```

## Validation

The component includes built-in validation for:

### File Size
```tsx
// Files larger than maxSize are rejected
<FileUpload
  label="Small File"
  maxSize={1} // Only accept files up to 1 MB
  // ...
/>
```

When a file exceeds the size limit, an alert is shown and the file is not accepted.

### File Type
```tsx
// Only specified file types are accepted
<FileUpload
  label="PDF Only"
  accept=".pdf"
  // ...
/>
```

Invalid file types trigger an alert with the accepted types.

## Integration with Forms

### With FormModal Component

The FileUpload component is automatically used in FormModal for file type fields:

```tsx
const fields: FormField[] = [
  {
    name: "document",
    label: "KYC Document",
    type: "file",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSize: 2,
  },
];

<FormModal
  fields={fields}
  onSubmit={handleSubmit}
  // ... other props
/>
```

### Standalone Usage

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});
const [formData, setFormData] = useState({
  kycDocument: null as File | null,
});

const handleFileChange = (file: File | null) => {
  setFormData(prev => ({ ...prev, kycDocument: file }));
  
  // Clear error when file is selected
  if (file && errors.kycDocument) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.kycDocument;
      return newErrors;
    });
  }
};

<FileUpload
  label="KYC Document"
  value={formData.kycDocument}
  onChange={handleFileChange}
  accept=".pdf,.jpg,.jpeg,.png"
  maxSize={2}
  required
  error={errors.kycDocument}
/>
```

## Styling & Customization

The component uses Tailwind CSS classes and can be customized:

### Colors
- Default border: `border-gray-300`
- Hover border: `border-orange-400`
- Dragging border: `border-orange-500`
- Error border: `border-red-500`
- File icon background: `bg-orange-100`
- Delete button: `text-red-500` with `hover:bg-red-50`

### Spacing
- Padding: `p-4`
- Gap between elements: `gap-3`
- Icon size: `w-10 h-10`
- Border radius: `rounded-lg`

## Accessibility

- ✅ Hidden file input with proper labeling
- ✅ ARIA labels for delete button
- ✅ Keyboard accessible (click to browse)
- ✅ Clear focus states
- ✅ Required field indicator (red asterisk)

## File Size Formatting

The component automatically formats file sizes:

- Bytes: `1024 B`
- Kilobytes: `200 KB`
- Megabytes: `1.5 MB`
- Gigabytes: `2.3 GB`

## Drag & Drop Behavior

1. User drags file over the component
2. Border changes to orange and background lightens
3. User drops file
4. File is validated (size and type)
5. If valid, file is set; if invalid, alert is shown

## Best Practices

1. **Set Appropriate Max Size**: Match your backend limitations
   ```tsx
   maxSize={5} // 5 MB for most documents
   maxSize={10} // 10 MB for large files
   ```

2. **Clear Accept Types**: Be specific about file types
   ```tsx
   accept=".pdf" // Only PDFs
   accept=".jpg,.jpeg,.png" // Only images
   ```

3. **Show Required Indicator**: Use the required prop
   ```tsx
   required={true}
   ```

4. **Handle Errors**: Always pass error prop from validation
   ```tsx
   error={errors.document}
   ```

5. **Disable During Submission**: Prevent changes while processing
   ```tsx
   disabled={isSubmitting}
   ```

## Common Use Cases

### Profile Picture Upload
```tsx
<FileUpload
  label="Profile Picture"
  value={avatar}
  onChange={setAvatar}
  accept=".jpg,.jpeg,.png,.webp"
  maxSize={2}
  required
/>
```

### ID Verification
```tsx
<FileUpload
  label="Government ID"
  value={govId}
  onChange={setGovId}
  accept=".pdf,.jpg,.jpeg,.png"
  maxSize={3}
  required
/>
```

### Contract Upload
```tsx
<FileUpload
  label="Signed Contract"
  value={contract}
  onChange={setContract}
  accept=".pdf"
  maxSize={5}
  required
/>
```

### Resume/CV Upload
```tsx
<FileUpload
  label="Resume/CV"
  value={resume}
  onChange={setResume}
  accept=".pdf,.doc,.docx"
  maxSize={5}
/>
```

## API Integration

When submitting to an API, convert to FormData:

```tsx
const handleSubmit = async () => {
  const formData = new FormData();
  
  if (file) {
    formData.append("document", file);
  }
  
  formData.append("name", name);
  formData.append("email", email);
  
  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
};
```

## Troubleshooting

### File Not Uploading
- Check that `onChange` is properly connected
- Verify file size is within limit
- Ensure file type matches `accept` prop

### Validation Not Working
- Make sure you're passing the `error` prop
- Check that size limit matches your requirements
- Verify accept string format (e.g., `.pdf` not `pdf`)

### Styling Issues
- Ensure Tailwind CSS is configured
- Check that parent container has proper width
- Verify z-index if dropdown is hidden

---

**Questions?** Check the FormModal documentation for integration examples!

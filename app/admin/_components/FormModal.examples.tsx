/**
 * FormModal Usage Examples
 * 
 * This file demonstrates various ways to use the dynamic FormModal component
 * throughout your admin application.
 */

import { useState } from "react";
import FormModal, { FormField } from "./FormModal";

/* --------------------------------------------
| Example 1: Simple Contact Form
--------------------------------------------- */
export function ContactFormExample() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const contactFields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "John Doe",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "john@example.com",
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      placeholder: "Your message here...",
      minRows: 4,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    // API call here
    console.log("Contact form data:", data);
    setLoading(false);
    setOpened(false);
  };

  return (
    <FormModal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Contact Us"
      description="Send us a message and we'll get back to you soon"
      fields={contactFields}
      onSubmit={handleSubmit}
      submitLabel="Send Message"
      loading={loading}
    />
  );
}

/* --------------------------------------------
| Example 2: Product Creation Form
--------------------------------------------- */
export function ProductFormExample() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const productFields: FormField[] = [
    {
      name: "productName",
      label: "Product Name",
      type: "text",
      required: true,
      placeholder: "Enter product name",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
        { value: "food", label: "Food & Beverage" },
        { value: "books", label: "Books" },
      ],
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      required: true,
      placeholder: "0.00",
      min: 0,
    },
    {
      name: "quantity",
      label: "Stock Quantity",
      type: "number",
      required: true,
      min: 0,
      max: 10000,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Product description...",
      minRows: 3,
    },
    {
      name: "productImage",
      label: "Product Image",
      type: "file",
      required: true,
      accept: ".jpg,.jpeg,.png,.webp",
      maxSize: 5,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, String(data[key]));
      }
    });

    // API call with FormData
    // await fetch("/api/products", { method: "POST", body: formData });
    
    console.log("Product data:", data);
    setLoading(false);
    setOpened(false);
  };

  return (
    <FormModal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Add New Product"
      description="Enter product details to add to inventory"
      fields={productFields}
      onSubmit={handleSubmit}
      submitLabel="Create Product"
      loading={loading}
    />
  );
}

/* --------------------------------------------
| Example 3: User Registration Form
--------------------------------------------- */
export function UserRegistrationExample() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const registrationFields: FormField[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "+234 00 0000 0000",
    },
    {
      name: "role",
      label: "User Role",
      type: "select",
      required: true,
      options: ["Admin", "Manager", "Agent", "Viewer"],
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: false,
      options: [
        { value: "sales", label: "Sales" },
        { value: "support", label: "Customer Support" },
        { value: "operations", label: "Operations" },
        { value: "finance", label: "Finance" },
      ],
    },
    {
      name: "idDocument",
      label: "ID Document",
      type: "file",
      required: true,
      accept: ".pdf,.jpg,.jpeg,.png",
      maxSize: 3,
      description: "Upload a valid government-issued ID",
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    // API call here
    console.log("User registration data:", data);
    setLoading(false);
    setOpened(false);
  };

  return (
    <FormModal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Register New User"
      description="Fill in user information to create account"
      fields={registrationFields}
      onSubmit={handleSubmit}
      submitLabel="Register User"
      cancelLabel="Cancel"
      loading={loading}
    />
  );
}

/* --------------------------------------------
| Example 4: Edit Form with Initial Values
--------------------------------------------- */
export function EditFormExample() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  // Existing data to edit
  const initialData = {
    name: "John Doe",
    email: "john@example.com",
    status: "active",
  };

  const editFields: FormField[] = [
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
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    // API call to update
    console.log("Updated data:", data);
    setLoading(false);
    setOpened(false);
  };

  return (
    <FormModal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Edit User"
      fields={editFields}
      onSubmit={handleSubmit}
      submitLabel="Update"
      loading={loading}
      initialValues={initialData}
    />
  );
}

/* --------------------------------------------
| Example 5: Complex Transaction Form
--------------------------------------------- */
export function TransactionFormExample() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const transactionFields: FormField[] = [
    {
      name: "transactionType",
      label: "Transaction Type",
      type: "select",
      required: true,
      options: [
        { value: "deposit", label: "Deposit" },
        { value: "withdrawal", label: "Withdrawal" },
        { value: "transfer", label: "Transfer" },
      ],
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      min: 1,
      placeholder: "0.00",
    },
    {
      name: "recipientAccount",
      label: "Recipient Account",
      type: "text",
      required: true,
      placeholder: "Account number",
    },
    {
      name: "recipientName",
      label: "Recipient Name",
      type: "text",
      required: true,
    },
    {
      name: "narration",
      label: "Narration",
      type: "textarea",
      required: false,
      placeholder: "Transaction description...",
      minRows: 2,
    },
    {
      name: "attachReceipt",
      label: "Attach Receipt",
      type: "file",
      required: false,
      accept: ".pdf,.jpg,.jpeg,.png",
      maxSize: 2,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    // Process transaction
    console.log("Transaction data:", data);
    setLoading(false);
    setOpened(false);
  };

  return (
    <FormModal
      opened={opened}
      onClose={() => setOpened(false)}
      title="New Transaction"
      description="Process a new transaction"
      fields={transactionFields}
      onSubmit={handleSubmit}
      submitLabel="Process Transaction"
      loading={loading}
    />
  );
}

/* --------------------------------------------
| Usage Notes:
--------------------------------------------- 
1. The FormModal component is fully typed and supports:
   - text, email, tel, number, select, file, textarea input types
   - Required field validation
   - Email and phone number validation
   - File size validation
   - Number min/max validation
   - Initial values for edit forms
   - Loading states
   - Custom labels for buttons

2. File uploads:
   - Files are stored in formData as File objects
   - You need to create FormData for API calls with files
   - Use the accept prop to restrict file types
   - Use maxSize (in MB) to limit file size

3. Validation:
   - Required fields are validated automatically
   - Email and phone formats are validated
   - Custom error messages can be shown
   - Errors clear when user starts typing

4. Styling:
   - The modal uses Mantine components
   - Colors match your brand (#DD4F05)
   - Fully responsive
   - Rounded corners (radius="xl")
   
5. Loading state:
   - Pass loading={true} to disable all inputs
   - Submit button shows loading spinner
   - Modal prevents closing while loading
--------------------------------------------- */

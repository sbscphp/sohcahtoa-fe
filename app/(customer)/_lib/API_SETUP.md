# API Setup Guide

## Quick Start

### 1. Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_API_URL=http://104.45.229.69:3000
```

### 2. Auth Token Management

The API client automatically reads auth tokens from Jotai atoms. Set tokens after login:

```tsx
import { useAtom } from 'jotai';
import { authTokensAtom } from '@/app/_lib/atoms/auth-atom';

function LoginComponent() {
  const [, setAuthTokens] = useAtom(authTokensAtom);
  
  const handleLogin = async (credentials) => {
    const response = await loginApi(credentials);
    
    // Store tokens in Jotai atom
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  };
}
```

### 3. Using Hooks in Components

```tsx
import { useFetchData, useCreateData } from '@/app/_lib/api/hooks';
import { customerApi } from '@/app/_lib/api/customer-api';
import { customerKeys } from '@/app/_lib/api/query-keys';

function MyComponent() {
  // Fetch data
  const { data, isLoading } = useFetchData(
    customerKeys.transactions.list({ page: 1, limit: 10 }),
    () => customerApi.transactions.list({ page: 1, limit: 10 }),
    true
  );
  
  // Mutations
  const createMutation = useCreateData(customerApi.transactions.create, {
    onSuccess: () => console.log('Created!'),
  });
  
  return (
    <div>
      {isLoading ? 'Loading...' : data?.data.map(t => <div key={t.id}>{t.id}</div>)}
    </div>
  );
}
```

## Migration from Old Pattern

### Old (Axios-based):
```tsx
const mutation = useCreateData('/api/transactions');
mutation.mutate({ data: {...} });
```

### New (Type-safe, Generic):
```tsx
import { useCreateData } from '@/app/_lib/api/hooks';
import { customerApi } from '@/app/_lib/api/customer-api';

const mutation = useCreateData(customerApi.transactions.create, {
  onSuccess: (data) => console.log('Created:', data.id),
});
mutation.mutate({
  type: 'PTA',
  amount: 5000,
  currency: 'USD',
  purpose: 'Travel',
  beneficiaryDetails: {},
});
```

## File Upload Example

```tsx
import { useUploadData } from '@/app/_lib/api/hooks';
import { customerApi } from '@/app/_lib/api/customer-api';

function UploadComponent({ transactionId }: { transactionId: string }) {
  const uploadMutation = useUploadData(
    (formData: FormData) => customerApi.transactions.uploadDocuments(transactionId, formData)
  );
  
  const handleUpload = (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('documents', file);
    });
    
    uploadMutation.mutate(formData);
  };
  
  return <input type="file" multiple onChange={(e) => handleUpload(e.target.files!)} />;
}
```

## Error Handling

Handled and shown via Mantine notifications. You can customize:

```tsx
import { useCreateData } from '@/app/_lib/api/hooks';
import { customerApi } from '@/app/_lib/api/customer-api';
import { handleApiError } from '@/app/_lib/api/error-handler';

const mutation = useCreateData(customerApi.transactions.create, {
  onError: (error) => {
    // Custom error handling 
    handleApiError(error, { customMessage: error.message });
  },
});
```

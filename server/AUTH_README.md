# Authentication Implementation

## Overview

QuoteDrop has **two authentication implementations** to choose from:

### 1. Standard Supabase Auth (Recommended)
**File**: `server/src/routes/auth.routes.ts`

Uses Supabase's built-in authentication which already handles password encryption internally.

**Features**:
- ✅ Passwords encrypted by Supabase (bcrypt internally)
- ✅ Automatic session management
- ✅ Email verification support
- ✅ Password reset flows
- ✅ OAuth providers (Google, etc.)

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

**Register Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### 2. Custom Password Storage (Alternative)
**File**: `server/src/routes/auth.custom.routes.ts`

Stores password hashes in a custom `user_credentials` table with manual bcrypt comparison.

**Features**:
- ✅ Full control over password storage
- ✅ Custom bcrypt hashing (10 rounds)
- ✅ Manual password comparison
- ✅ Password change functionality

**Setup Required**:
1. Run `server/src/db/custom_auth_schema.sql` in Supabase
2. Mount custom routes in `server/src/index.ts`

**Endpoints**:
- `POST /api/auth-custom/register` - Register with custom password storage
- `POST /api/auth-custom/login-custom` - Login with custom password verification
- `POST /api/auth-custom/change-password` - Change password

## Password Security

Both implementations use **bcrypt** for password hashing:

```typescript
import bcrypt from 'bcryptjs';

// Hashing (10 salt rounds)
const hashedPassword = await bcrypt.hash(password, 10);

// Comparison
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Security Features:
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Salted hashes (unique per password)
- ✅ Never store plain text passwords
- ✅ Secure password comparison
- ✅ Minimum 6 character requirement

## Which Implementation to Use?

### Use **Standard Supabase Auth** if:
- You want OAuth (Google, GitHub, etc.)
- You need email verification
- You want password reset flows
- You prefer managed authentication
- **This is the recommended approach**

### Use **Custom Password Storage** if:
- You need full control over password logic
- You want to implement custom password policies
- You're migrating from another system
- You need custom password validation

## Current Setup

The project is currently using **Standard Supabase Auth** (`auth.routes.ts`).

To switch to custom password storage:
1. Run the custom schema SQL
2. Update `server/src/index.ts`:
   ```typescript
   import authCustomRoutes from './routes/auth.custom.routes';
   app.use('/api/auth-custom', authCustomRoutes);
   ```

## Testing

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Frontend Integration

Update the Register page to send the correct fields:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    })
  });
  
  const data = await response.json();
  // Handle response
};
```

# 🔐 Planify Login Test Cases

## Primary Test Account
- **Email:** `admin@planify.com`
- **Password:** `password123`

## Test Scenarios

### ✅ Valid Login Tests
1. **Standard Login:**
   - Email: `admin@planify.com`
   - Password: `password123`
   - Expected: Successful login, redirect to dashboard

2. **Case Sensitivity Test:**
   - Email: `ADMIN@PLANIFY.COM`
   - Password: `password123`
   - Expected: Should work (email is case-insensitive in most systems)

### ❌ Invalid Login Tests
1. **Wrong Password:**
   - Email: `admin@planify.com`
   - Password: `wrongpassword`
   - Expected: Error message "Invalid credentials"

2. **Wrong Email:**
   - Email: `nonexistent@test.com`
   - Password: `password123`
   - Expected: Error message "Invalid credentials"

3. **Empty Fields:**
   - Email: (empty)
   - Password: (empty)
   - Expected: Validation errors in French

4. **Invalid Email Format:**
   - Email: `invalid-email`
   - Password: `password123`
   - Expected: Email validation error

5. **Short Password:**
   - Email: `admin@planify.com`
   - Password: `123`
   - Expected: Password length validation error

## Manual Testing Steps

### 1. Frontend Testing
```bash
# Start the application
cd planify
npm start

# Navigate to: http://localhost:3000/authentication/sign-in
```

### 2. Backend API Testing (Optional)
```bash
# Test login endpoint directly
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planify.com","password":"password123"}'
```

### 3. Expected Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@planify.com",
    "name": "Admin User"
  }
}
```

## Troubleshooting

### Backend Not Running
- Check: `http://localhost:3001/api/login` returns a response
- Start backend: `cd backend && node index.js`

### Database Issues
- Ensure MySQL is running
- Database name: `planify`
- Check if `users` table exists with test data

### Frontend Issues
- Check browser console for errors
- Verify API calls are going to `http://localhost:3001`
- Check network tab for failed requests

## Security Features Tested

1. **JWT Token Generation:** 24-hour expiration
2. **Password Validation:** Minimum 6 characters
3. **Email Validation:** Proper email format required
4. **SQL Injection Protection:** Parameterized queries
5. **CORS Enabled:** Cross-origin requests allowed
6. **Error Handling:** Proper error messages without exposing sensitive data

## Post-Login Features to Test

After successful login, test these protected features:
- Dashboard access
- Store management
- Schedule generation
- Analytics dashboard
- Profile management
- Logout functionality

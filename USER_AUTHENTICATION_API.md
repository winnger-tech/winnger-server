# User Authentication API Documentation

## Base URLs
- **Drivers:** `/api/drivers-staged`
- **Restaurants:** `/api/restaurants-staged`

## Authentication Response Format

All authentication responses now include a `type` field to distinguish between different user types:
- `driver` - for driver users
- `restaurant` - for restaurant users
- `admin` - for admin users

## Driver Authentication

### POST /drivers-staged/register
Register a new driver (Stage 1)

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver registered successfully",
  "type": "driver",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "registrationStage": 1,
    "isRegistrationComplete": false
  },
  "token": "jwt_token_here"
}
```

### POST /drivers-staged/login
Login as a driver

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "type": "driver",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "registrationStage": 3,
    "isRegistrationComplete": false
  },
  "token": "jwt_token_here"
}
```

## Restaurant Authentication

### POST /restaurants-staged/register
Register a new restaurant (Stage 1)

**Request:**
```json
{
  "ownerName": "Jane Smith",
  "email": "jane.smith@restaurant.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant registered successfully",
  "type": "restaurant",
  "restaurant": {
    "id": "uuid",
    "ownerName": "Jane Smith",
    "email": "jane.smith@restaurant.com",
    "registrationStage": 1,
    "isRegistrationComplete": false
  },
  "token": "jwt_token_here"
}
```

### POST /restaurants-staged/login
Login as a restaurant

**Request:**
```json
{
  "email": "jane.smith@restaurant.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "type": "restaurant",
  "restaurant": {
    "id": "uuid",
    "ownerName": "Jane Smith",
    "email": "jane.smith@restaurant.com",
    "registrationStage": 4,
    "isRegistrationComplete": false
  },
  "token": "jwt_token_here"
}
```

## JWT Token Structure

All JWT tokens include the user type in the payload:

**Driver Token:**
```json
{
  "id": "driver_uuid",
  "email": "driver@example.com",
  "type": "driver",
  "iat": 1640995200,
  "exp": 1641600000
}
```

**Restaurant Token:**
```json
{
  "id": "restaurant_uuid",
  "email": "restaurant@example.com",
  "type": "restaurant",
  "iat": 1640995200,
  "exp": 1641600000
}
```

**Admin Token:**
```json
{
  "id": "admin_uuid",
  "role": "admin",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Frontend Implementation

### 1. Store User Type
Store the user type in your frontend state management:

```javascript
// After successful login/register
const handleAuthSuccess = (response) => {
  const { type, token, driver, restaurant, admin } = response;
  
  // Store user type
  localStorage.setItem('userType', type);
  localStorage.setItem('token', token);
  
  // Store user data based on type
  switch (type) {
    case 'driver':
      setUser(driver);
      break;
    case 'restaurant':
      setUser(restaurant);
      break;
    case 'admin':
      setUser(admin);
      break;
  }
};
```

### 2. Route Based on User Type
Use the user type to determine routing:

```javascript
const getUserDashboard = (userType) => {
  switch (userType) {
    case 'driver':
      return '/driver/dashboard';
    case 'restaurant':
      return '/restaurant/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};
```

### 3. Conditional Rendering
Show different UI elements based on user type:

```javascript
const renderUserSpecificContent = () => {
  const userType = localStorage.getItem('userType');
  
  switch (userType) {
    case 'driver':
      return <DriverDashboard />;
    case 'restaurant':
      return <RestaurantDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <LoginForm />;
  }
};
```

### 4. API Calls with Type Validation
Include user type validation in your API calls:

```javascript
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  const response = await fetch(`/api/${userType}/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return response.json();
};
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error scenarios:
- `400` - Validation errors (missing fields, invalid format)
- `401` - Invalid credentials
- `409` - User already exists (registration)
- `500` - Server error 
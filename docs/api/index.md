# API Reference

This document provides detailed information about the Attendance Management System's API endpoints, request/response formats, and authentication mechanisms.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.yourdomain.com/v1
```

For local development:

```
http://localhost:3000/api/v1
```

## Authentication

Most API endpoints require authentication using a JWT (JSON Web Token). Include the token in the `Authorization` header:

```http
Authorization: Bearer your_jwt_token_here
```

### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "employee"
  }
}
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Invalidate current token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users

- `GET /api/v1/users` - List all users (Admin only)
- `POST /api/v1/users` - Create a new user (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Attendance

- `POST /api/v1/attendance/clock-in` - Record clock-in
- `POST /api/v1/attendance/clock-out` - Record clock-out
- `GET /api/v1/attendance` - Get attendance records
- `GET /api/v1/attendance/:id` - Get attendance record by ID
- `PUT /api/v1/attendance/:id` - Update attendance record (Admin/Manager)

### Leave

- `GET /api/v1/leave` - Get leave requests
- `GET /api/v1/leave/:id` - Get leave request by ID
- `POST /api/v1/leave` - Create leave request
- `PUT /api/v1/leave/:id` - Update leave request
- `DELETE /api/v1/leave/:id` - Cancel leave request
- `PUT /api/v1/leave/:id/status` - Update leave status (Approve/Reject)

### Reports

- `GET /api/v1/reports/attendance` - Generate attendance report
- `GET /api/v1/reports/leave` - Generate leave report
- `GET /api/v1/reports/summary` - Get summary statistics

## Rate Limiting

API requests are rate limited to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field1": "Validation error for field1",
      "field2": "Validation error for field2"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Webhooks

### Available Webhooks

- `attendance.clock_in` - Triggered when a user clocks in
- `attendance.clock_out` - Triggered when a user clocks out
- `leave.requested` - Triggered when a leave request is submitted
- `leave.approved` - Triggered when a leave request is approved
- `leave.rejected` - Triggered when a leave request is rejected

### Webhook Payload Example

```json
{
  "event": "attendance.clock_in",
  "data": {
    "id": 123,
    "user_id": 456,
    "timestamp": "2023-04-01T09:00:00Z",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

## SDKs

Official SDKs are available for the following platforms:

- [JavaScript/Node.js](https://github.com/your-org/attendance-sdk-js)
- [Python](https://github.com/your-org/attendance-sdk-python)
- [Java](https://github.com/your-org/attendance-sdk-java)

## Versioning

API versioning is handled through the URL path:

```
/api/v1/endpoint
```

Breaking changes will be released as a new major version (e.g., v2).

## Support

For API support, please contact `api-support@yourdomain.com` or open an issue on our [GitHub repository](https://github.com/your-username/attendance-system/issues).

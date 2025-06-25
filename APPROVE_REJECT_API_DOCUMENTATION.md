# **Approve/Reject Button API Documentation**

## **Driver Approval/Rejection**

### **Approve Driver**
```
PUT /api/admin/drivers/:id/status
Headers: 
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Request Body:
{
  "status": "approved",
  "notes": "Driver approved after document verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver status updated successfully",
  "data": {
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "status": "approved",
      "approvedAt": "2024-01-15T10:30:00Z",
      "approvedBy": "admin_uuid"
    }
  }
}
```

### **Reject Driver**
```
PUT /api/admin/drivers/:id/status
Headers: 
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Request Body:
{
  "status": "rejected",
  "reason": "Incomplete documentation",
  "notes": "Missing vehicle insurance documents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver status updated successfully",
  "data": {
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "status": "rejected",
      "rejectedAt": "2024-01-15T10:30:00Z",
      "rejectedBy": "admin_uuid",
      "rejectionReason": "Incomplete documentation"
    }
  }
}
```

## **Restaurant Approval/Rejection**

### **Approve Restaurant**
```
PUT /api/admin/restaurants/:id/status
Headers: 
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Request Body:
{
  "status": "approved",
  "notes": "Restaurant approved after business verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant status updated successfully",
  "data": {
    "restaurant": {
      "id": "uuid",
      "restaurantName": "Pizza Palace",
      "ownerName": "Jane Smith",
      "email": "jane@pizzapalace.com",
      "status": "approved",
      "approvedAt": "2024-01-15T10:30:00Z",
      "approvedBy": "admin_uuid"
    }
  }
}
```

### **Reject Restaurant**
```
PUT /api/admin/restaurants/:id/status
Headers: 
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Request Body:
{
  "status": "rejected",
  "reason": "Invalid business license",
  "notes": "Business license expired on 2023-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant status updated successfully",
  "data": {
    "restaurant": {
      "id": "uuid",
      "restaurantName": "Pizza Palace",
      "ownerName": "Jane Smith",
      "email": "jane@pizzapalace.com",
      "status": "rejected",
      "rejectedAt": "2024-01-15T10:30:00Z",
      "rejectedBy": "admin_uuid",
      "rejectionReason": "Invalid business license"
    }
  }
}
```

## **Status Values**

### **Available Status Options**
- `pending` - Initial status after registration
- `approved` - Admin approved the application
- `rejected` - Admin rejected the application
- `suspended` - Temporarily suspended
- `active` - Fully active and operational

### **Status Transitions**
- `pending` → `approved` (Approve button)
- `pending` → `rejected` (Reject button)
- `rejected` → `pending` (Re-review button)
- `approved` → `suspended` (Suspend button)
- `suspended` → `approved` (Re-activate button)

## **Request Body Parameters**

### **Required Fields**
- `status` (string) - New status to set

### **Optional Fields**
- `reason` (string) - Reason for rejection/suspension
- `notes` (string) - Additional admin notes
- `effectiveDate` (date) - When status change takes effect

## **Error Responses**

### **Invalid Status**
```json
{
  "success": false,
  "message": "Invalid status provided",
  "errors": {
    "status": "Status must be one of: pending, approved, rejected, suspended, active"
  }
}
```

### **Unauthorized**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required"
}
```

### **User Not Found**
```json
{
  "success": false,
  "message": "Driver/Restaurant not found"
}
```

### **Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "reason": "Reason is required when rejecting"
  }
}
```

## **Additional Features**

### **Bulk Operations**
```
PUT /api/admin/drivers/bulk-status
PUT /api/admin/restaurants/bulk-status

Request Body:
{
  "ids": ["uuid1", "uuid2", "uuid3"],
  "status": "approved",
  "notes": "Bulk approval after system update"
}
```

### **Status History**
```
GET /api/admin/drivers/:id/status-history
GET /api/admin/restaurants/:id/status-history

Response:
{
  "success": true,
  "data": [
    {
      "status": "pending",
      "changedAt": "2024-01-10T09:00:00Z",
      "changedBy": "system"
    },
    {
      "status": "approved",
      "changedAt": "2024-01-15T10:30:00Z",
      "changedBy": "admin_uuid",
      "notes": "Documents verified"
    }
  ]
}
```

## **Email Notifications**

### **Automatic Notifications**
- **Approval**: Email sent to user with welcome message
- **Rejection**: Email sent with rejection reason and next steps
- **Suspension**: Email sent with suspension details and appeal process

### **Email Templates**
- Approval confirmation with next steps
- Rejection notification with specific reasons
- Suspension notice with reactivation process
- Status change confirmation

## **Audit Trail**

### **Logged Information**
- Previous status
- New status
- Admin who made the change
- Timestamp of change
- Reason/notes provided
- IP address of admin
- User agent information

### **Audit Log Response**
```json
{
  "success": true,
  "data": {
    "auditLog": {
      "id": "audit_uuid",
      "entityType": "driver",
      "entityId": "driver_uuid",
      "previousStatus": "pending",
      "newStatus": "approved",
      "changedBy": "admin_uuid",
      "changedAt": "2024-01-15T10:30:00Z",
      "reason": "Documents verified",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

## **Frontend Integration**

### **Button States**
- **Approve Button**: Green, enabled for pending users
- **Reject Button**: Red, enabled for pending users
- **Suspend Button**: Orange, enabled for approved users
- **Re-activate Button**: Blue, enabled for suspended users

### **Confirmation Dialogs**
- **Approve**: "Are you sure you want to approve this user?"
- **Reject**: "Are you sure you want to reject this user?" (with reason field)
- **Suspend**: "Are you sure you want to suspend this user?" (with reason field)

### **Success Notifications**
- Toast notification on successful status change
- Dashboard refresh to show updated status
- Email notification sent to user

### **Error Handling**
- Display validation errors in form
- Show network error messages
- Retry mechanism for failed requests
- Loading states during API calls

## **Security Considerations**

### **Authorization**
- Only admin and super_admin roles can change status
- Audit trail for all status changes
- Rate limiting on status change endpoints

### **Validation**
- Status must be valid enum value
- Reason required for rejection/suspension
- User must exist and be in valid state for transition

### **Data Protection**
- Sensitive information masked in logs
- Secure transmission of admin credentials
- Session timeout for admin sessions 
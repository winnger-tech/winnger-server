# **Frontend Implementation Guide for Staged Registration Dashboard**

## **Overview**

This guide provides a comprehensive implementation plan for building a staged registration dashboard for both drivers and restaurants. The system allows users to register in stages, navigate between stages freely, and continue from where they left off.

## **API Endpoints Reference**

### **Driver Endpoints**

#### **Authentication**
```
POST /api/drivers-staged/register
POST /api/drivers-staged/login
```

#### **Dashboard & Navigation**
```
GET /api/drivers-staged/dashboard
GET /api/drivers-staged/stage/:stage
PUT /api/drivers-staged/update-specific-stage
GET /api/drivers-staged/profile
```

### **Restaurant Endpoints**

#### **Authentication**
```
POST /api/restaurants-staged/register
POST /api/restaurants-staged/login
```

#### **Dashboard & Navigation**
```
GET /api/restaurants-staged/dashboard
GET /api/restaurants-staged/stage/:stage
PUT /api/restaurants-staged/update-specific-stage
GET /api/restaurants-staged/profile
```

## **API Request/Response Details**

### **1. Dashboard Endpoint**
```
GET /api/drivers-staged/dashboard
Headers: Authorization: Bearer <token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "driver": { /* user profile data */ },
    "currentStage": 2,
    "isRegistrationComplete": false,
    "stages": {
      "1": {
        "title": "Basic Information",
        "description": "Complete your basic profile information",
        "fields": ["firstName", "lastName", "email", "password"],
        "completed": true,
        "isCurrentStage": false
      },
      "2": {
        "title": "Personal Details",
        "description": "Provide your personal and address information",
        "fields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
        "completed": false,
        "isCurrentStage": true
      }
      // ... stages 3-5
    },
    "currentStageInfo": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
      "optionalFields": ["appUniteNumber"]
    },
    "progress": {
      "totalStages": 5,
      "completedStages": 1,
      "currentStage": 2,
      "percentage": 20
    }
  }
}
```

### **2. Get Stage Data**
```
GET /api/drivers-staged/stage/2
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stage": 2,
    "data": {
      "dateOfBirth": "1990-01-01",
      "cellNumber": "+1-555-123-4567",
      "streetNameNumber": "123 Main St",
      "city": "Toronto",
      "province": "ON",
      "postalCode": "M5V2H1"
    },
    "stageInfo": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

### **3. Update Specific Stage**
```
PUT /api/drivers-staged/update-specific-stage
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "stage": 2,
  "data": {
    "dateOfBirth": "1990-01-01",
    "cellNumber": "+1-555-123-4567",
    "streetNameNumber": "123 Main St",
    "city": "Toronto",
    "province": "ON",
    "postalCode": "M5V2H1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage 2 updated successfully",
  "data": {
    "driver": { /* updated user data */ },
    "currentStage": 2,
    "isRegistrationComplete": false
  }
}
```

## **Registration Stages**

### **Driver Stages**
1. **Stage 1:** Basic Information (firstName, lastName, email, password)
2. **Stage 2:** Personal Details (dateOfBirth, cellNumber, address, etc.)
3. **Stage 3:** Vehicle Information (vehicleType, make, model, etc.)
4. **Stage 4:** Documents Upload (licenses, insurance, etc.)
5. **Stage 5:** Banking & Consent (banking info, consent forms)

### **Restaurant Stages**
1. **Stage 1:** Basic Information (ownerName, restaurantName, email, password)
2. **Stage 2:** Business Details (phone, address, identification, etc.)
3. **Stage 3:** Documents Upload (business documents, licenses, etc.)
4. **Stage 4:** Menu & Hours (menu details, operating hours)
5. **Stage 5:** Banking & Tax (banking info, tax information)

## **Frontend Implementation Plan**

### **Phase 1: Project Setup & Authentication**

#### **1.1 Project Structure**
```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── StageCard.jsx
│   │   └── Navigation.jsx
│   ├── stages/
│   │   ├── StageContainer.jsx
│   │   ├── Stage1BasicInfo.jsx
│   │   ├── Stage2PersonalDetails.jsx
│   │   ├── Stage3VehicleInfo.jsx
│   │   ├── Stage4Documents.jsx
│   │   └── Stage5Banking.jsx
│   └── common/
│       ├── FormInput.jsx
│       ├── FileUpload.jsx
│       ├── LoadingSpinner.jsx
│       └── ErrorBoundary.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   └── stageService.js
├── context/
│   ├── AuthContext.jsx
│   └── DashboardContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useDashboard.js
│   └── useStages.js
└── utils/
    ├── validation.js
    ├── formatters.js
    └── constants.js
```

#### **1.2 Authentication Flow**
- Login/Register pages with form validation
- JWT token storage in localStorage
- Protected route wrapper
- Auto-redirect based on registration status
- Token refresh mechanism

#### **1.3 State Management**
- User authentication context
- Dashboard data context
- Form state management
- Loading and error states
- File upload progress tracking

### **Phase 2: Dashboard Implementation**

#### **2.1 Dashboard Layout**
- **Progress Bar:** Visual progress indicator
- **Stage Cards:** Clickable stage navigation
- **Current Stage Highlight:** Prominent display of current stage
- **Completion Indicators:** Visual cues for completed stages
- **User Profile Section:** Basic user information

#### **2.2 Dashboard Data Flow**
- Fetch dashboard data on login/refresh
- Display current stage prominently
- Show progress percentage
- List all stages with completion status
- Handle loading and error states

#### **2.3 Navigation Logic**
- Click any stage to navigate
- Back/forward navigation between stages
- Stage completion validation
- Auto-save functionality
- Breadcrumb navigation

### **Phase 3: Stage Components**

#### **3.1 Stage Container**
- Dynamic stage loading based on route
- Form validation and error handling
- File upload management
- Progress tracking and auto-save
- Navigation controls

#### **3.2 Individual Stage Forms**

**Stage 1: Basic Information**
- Read-only after initial registration
- Display user information
- Edit option (if needed)

**Stage 2: Personal Details**
- Date picker for date of birth
- Phone number input with formatting
- Address form with validation
- Province/state selection

**Stage 3: Vehicle Information**
- Vehicle type selection
- Make/model inputs
- Year selection
- License plate input
- Delivery type selection

**Stage 4: Documents Upload**
- File upload components
- Progress indicators
- File type validation
- Preview functionality
- Retry mechanism for failed uploads

**Stage 5: Banking & Consent**
- Banking information form
- Consent checkboxes
- Terms and conditions
- Electronic signature (if required)

#### **3.3 Form Features**
- Pre-populate with existing data
- Real-time validation
- File upload progress
- Save draft functionality
- Form state persistence

### **Phase 4: User Experience**

#### **4.1 Responsive Design**
- Mobile-first approach
- Touch-friendly navigation
- Form optimization for mobile devices
- Progress indicators for mobile
- Responsive file upload components

#### **4.2 Error Handling**
- Network error recovery
- Validation error display
- File upload retry mechanism
- Graceful degradation
- User-friendly error messages

#### **4.3 Loading States**
- Skeleton loading for dashboard
- Progress indicators for API calls
- Disabled states during operations
- Optimistic updates
- Loading spinners for file uploads

### **Phase 5: Advanced Features**

#### **5.1 Data Persistence**
- Auto-save drafts every 30 seconds
- Form state restoration on page refresh
- Browser refresh handling
- Offline capability (basic)
- Data synchronization

#### **5.2 Navigation Enhancements**
- Breadcrumb navigation
- Stage completion badges
- Skip optional fields option
- Review mode for completed stages
- Quick navigation menu

#### **5.3 Analytics & Tracking**
- Stage completion tracking
- Time spent per stage
- Drop-off point analysis
- User behavior insights
- Performance metrics

## **Implementation Flow**

### **User Journey**

1. **Landing Page** → User clicks "Register as Driver/Restaurant"
2. **Stage 1 Registration** → Basic info collection and account creation
3. **Login Redirect** → Dashboard with current stage highlighted
4. **Stage Navigation** → Click any stage to edit or continue
5. **Data Persistence** → All changes saved automatically
6. **Completion** → Full registration complete, redirect to main app

### **Technical Flow**

1. **Authentication** → Store JWT token in localStorage
2. **Dashboard Load** → Fetch current stage and progress data
3. **Stage Selection** → Load stage-specific data and form
4. **Form Interaction** → Real-time validation and auto-save
5. **Stage Update** → API call to update specific stage
6. **Navigation** → Update dashboard state and progress

### **State Management Strategy**

#### **Global State**
- User authentication status
- Current registration stage
- Dashboard data and progress
- Loading and error states
- File upload progress

#### **Local State**
- Form data and validation
- UI interactions and animations
- File upload states
- Navigation history

#### **Persistence Strategy**
- JWT token in localStorage
- Form drafts in sessionStorage
- User preferences in localStorage
- File upload cache

## **Testing Strategy**

### **Unit Testing**
- API service functions
- Form validation logic
- State management
- Component rendering
- Utility functions

### **Integration Testing**
- Authentication flow
- Stage navigation
- Data persistence
- Error handling
- File upload functionality

### **User Testing**
- Complete registration flow
- Stage navigation
- Mobile experience
- Error recovery
- Performance testing

## **Deployment Considerations**

### **Environment Setup**
- Development API endpoints
- Staging environment
- Production deployment
- Feature flags for gradual rollout

### **Performance Optimization**
- Lazy loading of stage components
- Image optimization for uploads
- API response caching
- Bundle size optimization
- Code splitting

### **Security Measures**
- JWT token security
- Input sanitization
- File upload validation
- HTTPS enforcement
- XSS protection

## **API Error Handling**

### **Common Error Responses**
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific field error"
  }
}
```

### **Error Scenarios**
- **401 Unauthorized** → Redirect to login
- **400 Bad Request** → Display validation errors
- **500 Server Error** → Show retry option
- **Network Error** → Offline mode or retry

## **File Upload Guidelines**

### **Supported Formats**
- Images: JPG, PNG, PDF
- Documents: PDF, DOC, DOCX
- Maximum size: 10MB per file

### **Upload Process**
1. File selection and validation
2. Upload progress indicator
3. Server processing
4. URL return for form submission
5. Error handling and retry

## **Browser Compatibility**

### **Supported Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Mobile Support**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## **Performance Targets**

### **Load Times**
- Dashboard: < 2 seconds
- Stage forms: < 1 second
- File uploads: Progress indicator
- API responses: < 500ms

### **User Experience**
- Smooth navigation between stages
- Real-time form validation
- Auto-save every 30 seconds
- Responsive design on all devices

This implementation guide provides a comprehensive roadmap for building a robust, user-friendly staged registration dashboard that handles all the requirements for both drivers and restaurants. 
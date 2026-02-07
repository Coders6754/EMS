# Employee and Project Management System

A comprehensive full-stack application built with React, Node.js, Express, MongoDB, and Tailwind CSS for managing employees, departments, projects, invoices, and leave requests.

## Features

### 📋 Forms
- **Employee Form**: Manage employee details with auto-generated employee IDs (ER0001, ER0002...)
- **Department Form**: Create and manage departments with department heads
- **Project Proposal Form**: Submit projects with team member subforms and approval workflow
- **Invoice Form**: Generate invoices with auto-numbered invoicing (INV001, INV002...)
- **Leave Request Form**: Submit and manage leave requests with confirmation popup

### 📊 Reports
- **Employee Report**: Filter by department and joining date
- **Department Report**: View all departments and their details
- **Project Proposal Report**: Filter by status (Submitted, Under Review, Approved, Rejected)
- **Invoice Report**: Filter by status with PDF download capability
- **Leave Request Report**: Filter by leave status
- **Role-Based Reports**: Different views for Admin, Manager, and Employee roles

### 🔐 User Roles & Permissions
- **Admin**: Full access to all records
- **Manager**: View and edit employee and project records
- **Employee**: View only their own records

### ✅ Validations
- Email format validation
- Numeric-only contact numbers
- Date validations (no future joining dates, no past due dates)
- Auto-generated employee IDs and invoice numbers
- Budget must be positive
- At least one team member required for projects
- Leave balance checking

### 🔄 Workflows
- **Blueprint Approval Process**: Submitted → Under Review → Approved/Rejected
- **Leave Request Workflow**: Confirmation popup before submission
- **Email Notifications**: Automated emails for project submissions, invoice generation, and leave requests

### 📈 Dashboard
- Summary cards showing total counts
- **Charts**:
  - Employee distribution by department (Bar Chart)
  - Projects by status (Pie Chart)
  - Leave requests by type and status (Pie/Bar Charts)
- **Leave Widget**: Interactive leave management with search and filtering

### 🎨 Design
- Modern, responsive UI built with Tailwind CSS
- Beautiful gradient cards and interactive elements
- Mobile-friendly design
- Intuitive navigation

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Recharts for data visualization
- React Hot Toast for notifications
- Tailwind CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email notifications
- PDFKit for PDF generation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd zoho_as
```

2. **Install all dependencies**
```bash
npm run install-all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `backend` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=employee_management_secret_2026
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

5. **Run the Application**

Option 1 - Run both servers concurrently:
```bash
npm run dev
```

Option 2 - Run servers separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### First Time Setup

1. **Register an Admin Account**
   - Go to http://localhost:3000
   - Click "Register"
   - Create an account with role "Admin"

2. **Create Departments**
   - Navigate to Departments
   - Add departments (e.g., IT, HR, Finance)

3. **Add Employees**
   - Navigate to Employees
   - Add employees to departments
   - Employee IDs are auto-generated (ER0001, ER0002...)

4. **Start Managing**
   - Create projects with team members
   - Generate invoices
   - Submit and approve leave requests
   - View reports and dashboard analytics

### Default Test Credentials
After registration, you can create test accounts for different roles:
- Admin: Full access
- Manager: Can manage employees and projects
- Employee: Limited to own records

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `PUT /api/projects/:id/status` - Update project status
- `DELETE /api/projects/:id` - Delete project

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Leaves
- `GET /api/leaves` - Get all leaves
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id/status` - Update leave status
- `DELETE /api/leaves/:id` - Delete leave

### Reports
- `GET /api/reports/employees` - Employee report
- `GET /api/reports/departments` - Department report
- `GET /api/reports/projects` - Project report
- `GET /api/reports/invoices` - Invoice report
- `GET /api/reports/leaves` - Leave report

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/employees-by-department` - Employee distribution
- `GET /api/dashboard/projects-by-status` - Project status distribution
- `GET /api/dashboard/monthly-invoices` - Monthly invoice stats
- `GET /api/dashboard/leaves-analysis` - Leave analysis
- `GET /api/dashboard/leave-widget` - Current month leaves

## Project Structure

```
zoho_as/
├── backend/
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── middleware/       # Authentication middleware
│   ├── utils/            # Utility functions
│   ├── server.js         # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── utils/        # API utilities
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json          # Root package.json
```

## Key Features Implemented

✅ Employee management with auto-generated IDs  
✅ Department management with lookups  
✅ Project proposals with subforms and approval workflow  
✅ Invoice generation with auto-numbering and PDF export  
✅ Leave request management with confirmation popup  
✅ Role-based access control (Admin, Manager, Employee)  
✅ Comprehensive reports with filtering  
✅ Interactive dashboard with charts  
✅ Email notifications for workflows  
✅ Form validations  
✅ Responsive design with Tailwind CSS  

## Screenshots & Demo

The application includes:
- Clean, modern login/register interface
- Comprehensive dashboard with KPIs and charts
- Easy-to-use forms with validation
- Filterable reports
- Role-based navigation
- PDF generation for invoices
- Confirmation popups for critical actions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.

## Acknowledgments

- Built as a comprehensive employee management system
- Implements best practices for React and Node.js applications
- Clean, maintainable code structure
- Production-ready architecture

---

**Note**: Email notifications are optional. The application will run without them if not configured. To enable email notifications:
1. Configure your email settings in the `.env` file
2. For Gmail, you may need to enable "Less secure app access" or use an App Password
3. If you encounter nodemailer issues, the application will continue to work without email features

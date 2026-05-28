# QR Attendance System 🎓

A secure, production-ready QR code-based attendance system with multi-language support and comprehensive security features.

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- MySQL/Laragon
- Latest version of your browser

### Installation

1. **Clone/Download the project**

```bash
cd qr-attendance
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Environment Configuration**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

4. **Generate Strong Session Secret** (Important!)

```bash
# Generate a random secret in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output to SESSION_SECRET in .env
```

5. **Setup Database**

```bash
# Run the migration SQL file in MySQL
mysql -u root -p qr_attendance_db < database-migration.sql

# Or manually run in your MySQL client:
# - Copy all SQL from database-migration.sql
# - Execute in your database
```

6. **Set Admin Password**

```bash
# Run the password setup script
node fix-pass.js
# Output will show: Username: admin, Password: admin123 (change this!)
```

7. **Start the Server**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

8. **Access the Application**

- **Admin Panel**: http://localhost:3000/admin/login
- **Attendance Form**: http://localhost:3000/scan
- **Manager Dashboard**: http://localhost:3000/manager/qr (requires login)

---

## 📋 Project Structure

```
qr-attendance/
├── src/
│   ├── config/
│   │   ├── env.js              # Environment configuration
│   │   └── database.js         # MySQL connection
│   ├── controllers/
│   │   ├── authController.js   # Login/Logout logic
│   │   ├── attendanceController.js  # Form submission
│   │   └── managerController.js     # List/Create/Update/Delete
│   ├── middleware/
│   │   ├── auth.js             # Authentication checks
│   │   ├── errorHandler.js     # Error handling
│   │   ├── security.js         # Helmet, CSRF, Rate limiting
│   │   └── validation.js       # Input validation
│   ├── routes/
│   │   ├── authRoutes.js       # /admin routes
│   │   ├── attendanceRoutes.js # /scan routes
│   │   └── managerRoutes.js    # /manager routes
│   └── utils/
│       └── logger.js           # Winston logging
├── views/                      # EJS templates
├── assets/                     # Static files (CSS, images)
├── locales/                    # Translation files
├── logs/                       # Application logs
├── .env                        # Configuration (local)
├── .env.example                # Configuration template
├── .gitignore                  # Git ignore rules
├── server.js                   # Main entry point
├── database-migration.sql      # Database schema updates
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🔐 Security Features Implemented

✅ **Environment Variables** - All secrets in .env (not committed)
✅ **Helmet.js** - Security headers (CSP, X-Frame-Options, etc.)
✅ **CSRF Protection** - All forms protected with CSRF tokens
✅ **Rate Limiting** - 5 attempts per 15 min for login
✅ **Input Validation** - All inputs validated and sanitized
✅ **Parameterized Queries** - Protection against SQL injection
✅ **Bcrypt Password Hashing** - Secure password storage
✅ **Secure Sessions** - HTTPOnly, SameSite, Secure cookies
✅ **Error Handling** - Comprehensive error handlers
✅ **Request Logging** - Morgan + Winston logging
✅ **Soft Delete** - Non-destructive record deletion
✅ **Duplicate Prevention** - Prevents same-day duplicate check-ins
✅ **Session Timeout** - Auto-logout after inactivity
✅ **Graceful Shutdown** - Clean database closure on exit

---

## 📖 Usage Guide

### Admin Login

1. Go to http://localhost:3000/admin/login
2. Username: `admin`
3. Password: `admin123` (Change this!)
4. You're redirected to the Manager Dashboard

### Manager Dashboard

**Two main tabs:**

1. **QR Code Tab** (`/manager/qr`)
   - Displays scannable QR code
   - Download QR code as PNG (High Quality 4x)
   - Share QR code
   - Network connectivity hint

2. **Attendance List** (`/manager/list`)
   - View all checked-in attendees
   - Pagination (10 per page)
   - Create new attendance records
   - Edit records
   - Delete records (soft delete)
   - Total count display

### Employee Check-in

1. Open http://localhost:3000/scan
2. Fill in form:
   - Full Name
   - Gender
   - Phone Number
   - Place (where from)
3. Submit
4. See success confirmation with name

### Multi-Language Support

- Click **KM** (ខ្មែរ) or **EN** (English) buttons
- Language preference saved in session

---

## 🔧 Configuration (.env File)

```ini
# Server
NODE_ENV=development              # development or production
PORT=3000                        # Server port
APP_HOST=localhost               # Server hostname

# Database
DB_HOST=localhost               # MySQL host
DB_USER=root                    # MySQL user
DB_PASS=                        # MySQL password
DB_NAME=qr_attendance_db        # Database name

# Session (IMPORTANT: Change this!)
SESSION_SECRET=your_strong_random_secret_here_minimum_32_characters

# Logging
LOG_LEVEL=info                  # debug, info, warn, error
LOG_DIR=./logs                  # Log file directory

# Security
BCRYPT_ROUNDS=10                # Password hashing rounds (10-12 recommended)
SESSION_MAX_AGE=3600000         # Session timeout: 1 hour in milliseconds
```

---

## 📊 Database Schema

### attendance Table

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  gender VARCHAR(10),
  phone VARCHAR(20),
  place VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_deleted TINYINT(1),
  deleted_at TIMESTAMP
);
```

### admins Table

```sql
CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🚨 Important Security Tasks

Before deploying to production:

- [ ] Change admin password immediately
- [ ] Set a strong SESSION_SECRET in .env
- [ ] Set strong database password
- [ ] Update APP_HOST to your actual IP/domain
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Backup database regularly
- [ ] Monitor logs in /logs directory
- [ ] Test rate limiting and CSRF protection
- [ ] Review security headers in browser DevTools

---

## 🐛 Troubleshooting

### "Cannot find module" error

```bash
# Reinstall all dependencies
rm -rf node_modules
npm install
```

### Database connection error

- Check .env DATABASE configuration
- Verify MySQL is running
- Check database name exists
- Run database migration: `mysql -u root -p qr_attendance_db < database-migration.sql`

### CSRF token errors

- Don't disable CSRF (it's a security feature)
- Make sure cookies are enabled
- Clear browser cache/cookies if persists

### Rate limiting blocking legitimate traffic

- Adjust `max: 5` in `/src/middleware/security.js`
- Set `skip: (req) => true` to disable for testing

### Port already in use

```bash
# Change PORT in .env
# Or kill process using port:
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000
```

---

## 📝 API Endpoints

### Auth Routes

| Method | Endpoint        | Protection   | Description   |
| ------ | --------------- | ------------ | ------------- |
| GET    | `/admin/login`  | Public       | Login page    |
| POST   | `/admin/login`  | Rate Limited | Process login |
| GET    | `/admin/logout` | Auth         | Logout        |

### Attendance Routes

| Method | Endpoint                  | Protection | Description     |
| ------ | ------------------------- | ---------- | --------------- |
| GET    | `/scan`                   | Public     | Attendance form |
| POST   | `/scan/submit-attendance` | Validated  | Submit form     |
| GET    | `/scan/success`           | Public     | Success page    |

### Manager Routes

| Method | Endpoint              | Protection | Description     |
| ------ | --------------------- | ---------- | --------------- |
| GET    | `/manager/qr`         | Auth       | QR code page    |
| GET    | `/manager/list`       | Auth       | Attendance list |
| POST   | `/manager/create`     | Auth       | Create record   |
| PUT    | `/manager/update/:id` | Auth       | Update record   |
| DELETE | `/manager/delete/:id` | Auth       | Delete record   |

---

## 🔍 Logging

Application logs are stored in `/logs` directory:

- **error.log** - Error logs only
- **combined.log** - All logs

Example log entry:

```json
{
  "timestamp": "2024-05-28 10:30:45",
  "level": "info",
  "message": "Attendance recorded",
  "name": "John Doe",
  "phone": "+855973123456",
  "service": "qr-attendance"
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Try multiple failed logins (should be rate limited)
- [ ] Submit attendance (should succeed)
- [ ] Submit duplicate attendance (should fail)
- [ ] Create/Edit/Delete records as admin
- [ ] Switch between KM/EN languages
- [ ] Check logs for errors
- [ ] Test on different browsers

---

## 📦 Dependencies

| Package            | Purpose             | Version |
| ------------------ | ------------------- | ------- |
| express            | Web framework       | ^5.2.1  |
| ejs                | Templating engine   | ^6.0.1  |
| mysql2             | MySQL driver        | ^3.22.4 |
| bcrypt             | Password hashing    | ^6.0.0  |
| helmet             | Security headers    | ^7.1.0  |
| express-validator  | Input validation    | ^7.0.0  |
| express-rate-limit | Rate limiting       | ^7.1.5  |
| csurf              | CSRF protection     | ^1.11.0 |
| morgan             | Request logging     | ^1.10.0 |
| winston            | Application logging | ^3.11.0 |
| dotenv             | Environment config  | ^16.3.1 |
| qrcode             | QR code generation  | ^1.5.4  |

---

## 📚 Further Improvements (Optional)

Consider adding these for a more complete system:

1. **Two-Factor Authentication** - SMS or TOTP
2. **Dashboard Statistics** - Charts, trends, analytics
3. **Export to CSV/Excel** - Download attendance data
4. **Email Notifications** - Attendance confirmations
5. **Mobile App** - React Native or Flutter
6. **Backup & Recovery** - Automated backups
7. **User Roles** - Different permission levels
8. **Event Management** - Multiple events support
9. **Real-time Notifications** - Socket.io updates
10. **API Documentation** - Swagger/OpenAPI

---

## 📄 License

This project is for educational purposes. Modify and use as needed for your institution.

---

## 👨‍💻 Support

For issues or questions:

1. Check `/logs` directory for error messages
2. Review this README troubleshooting section
3. Check browser DevTools console for client-side errors
4. Review Node.js console output for server errors

---

## ✅ Checklist for Production Deployment

- [ ] All security issues fixed
- [ ] .env file configured with production values
- [ ] DATABASE backups configured
- [ ] HTTPS enabled via reverse proxy
- [ ] Error logging tested and working
- [ ] Rate limiting configured appropriately
- [ ] Database migration applied
- [ ] Admin password changed
- [ ] Security headers verified
- [ ] CORS configured if needed
- [ ] Load balancer configured (if applicable)
- [ ] Database connection pooling verified
- [ ] Log rotation configured
- [ ] Monitoring and alerting setup
- [ ] Documentation accessible to admins

---

**Last Updated**: May 28, 2024
**Version**: 2.0 (Production Ready)

# 🚀 QR Attendance System - Complete Setup Guide

This guide will help you set up the entire QR Attendance System from scratch.

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:

- Express (web framework)
- MySQL2 (database)
- Helmet (security headers)
- Express-validator (input validation)
- Winston (logging)
- And more...

---

## Step 2: Environment Configuration

### 2.1 Create .env File

```bash
# Copy the example file
cp .env.example .env
```

### 2.2 Edit .env File

Open `.env` and fill in your configuration:

```ini
# Server Configuration
NODE_ENV=development
PORT=3000
APP_HOST=localhost          # Change to your IP (e.g., 10.10.16.129)

# Database Configuration
DB_HOST=localhost           # Your MySQL host
DB_USER=root               # MySQL username
DB_PASS=                   # MySQL password (empty for Laragon)
DB_NAME=qr_attendance_db   # Database name

# Session Secret (IMPORTANT!)
SESSION_SECRET=generate_a_strong_random_secret_using_crypto

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Security
BCRYPT_ROUNDS=10
SESSION_MAX_AGE=3600000
```

### 2.3 Generate Session Secret

Run this command to generate a strong random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output example:**

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

Copy this and paste it in `.env` as `SESSION_SECRET=...`

---

## Step 3: Database Setup

### 3.1 Create Database (if not exists)

```bash
mysql -u root -p
# Enter password (press enter if empty)

# Then in MySQL prompt:
CREATE DATABASE IF NOT EXISTS qr_attendance_db;
USE qr_attendance_db;
```

### 3.2 Run Migration

```bash
# Option 1: Using command line
mysql -u root -p qr_attendance_db < database-migration.sql

# Option 2: Manual in MySQL
mysql -u root -p
# In MySQL prompt:
USE qr_attendance_db;
# Copy and paste all SQL from database-migration.sql
```

### 3.3 Verify Database

```bash
mysql -u root -p qr_attendance_db
SHOW TABLES;
DESCRIBE attendance;
DESCRIBE admins;
```

You should see:

- `attendance` table with columns: id, name, gender, phone, place, created_at, updated_at, is_deleted, deleted_at
- `admins` table with columns: id, username, password, created_at, updated_at

---

## Step 4: Set Up Admin Account

### 4.1 Run Password Setup Script

```bash
node fix-pass.js
```

**Output:**

```
----------------------------------------------------
✅ បានធ្វើបច្ចុប្បន្នភាព Password ជោគជ័យ!
👤 Username: admin
🔑 Password: admin123
🔒 Secure Hash នៅក្នុង DB គឺ: $2b$10$...
----------------------------------------------------
```

### 4.2 Change Default Password (Recommended)

1. Login to admin at http://localhost:3000/admin/login
2. After login, there should be a password change option (add this feature if needed)

---

## Step 5: Start the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

**Output:**

```
================================================
✅ Server is running: http://localhost:3000
📋 Admin Panel: http://localhost:3000/admin/login
📱 Attendance Form: http://localhost:3000/scan
🔍 Manager Panel: http://localhost:3000/manager/qr
================================================
```

### Production Mode

```bash
npm start
```

---

## Step 6: Verify Installation

### 6.1 Check Server is Running

Open your browser and visit:

- http://localhost:3000/admin/login

Should see login page with:

- Logo image
- Khmer/English text
- Username and Password fields
- Styled login form

### 6.2 Test Admin Login

1. Username: `admin`
2. Password: `admin123`
3. Should redirect to Manager Dashboard

### 6.3 Test Attendance Form

Visit http://localhost:3000/scan

Should see:

- Attendance form with fields
- Khmer/English language options
- Submit button

---

## Step 7: Security Verification

### Check Security Headers

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on any response
5. Check Headers tab for:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: ...`

### Check Logs

```bash
# View recent logs
tail -f logs/combined.log

# View only errors
tail -f logs/error.log
```

---

## Step 8: Firewall & Network (for Production)

### If accessing from other machines:

1. **Allow Port 3000 in Firewall**

   **Windows:**

   ```bash
   netsh advfirewall firewall add rule name="Node.js Port 3000" dir=in action=allow protocol=tcp localport=3000
   ```

   **Linux:**

   ```bash
   sudo ufw allow 3000
   ```

2. **Update APP_HOST in .env**

   ```ini
   APP_HOST=10.10.16.129  # Your actual IP address
   ```

3. **Restart Server**
   ```bash
   npm run dev
   ```

---

## Common Issues & Solutions

### Issue: "Cannot find module 'express'"

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "ECONNREFUSED" - Database Connection Error

**Solution:**

- Check MySQL is running
- Check DB_HOST and DB_USER in .env
- Verify database name exists
- Test MySQL connection:
  ```bash
  mysql -u root -p -h localhost qr_attendance_db
  ```

### Issue: "Port 3000 already in use"

**Solution - Windows:**

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Solution - Mac/Linux:**

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: Session Secret Error

**Solution:**

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
SESSION_SECRET=your_generated_secret_here

# Restart server
```

### Issue: CSRF Token Errors

**Solution:**

- Enable cookies in browser
- Clear browser cache
- Check that forms include CSRF token:
  ```html
  <input type="hidden" name="_csrf" value="<%= csrfToken %>" />
  ```

### Issue: Khmer Font Not Displaying

**Solution:**

- Check network tab - fonts should load from Google Fonts
- Clear browser cache
- Try different browser
- Check that .env APP_HOST is correct

---

## Next Steps

### Recommended Changes Before Production:

1. **Change Admin Password**
   - Login with admin/admin123
   - Implement password change feature if needed

2. **Set Production Mode**

   ```ini
   NODE_ENV=production
   ```

3. **Update Database Password**

   ```ini
   DB_PASS=your_strong_password
   ```

4. **Enable HTTPS**
   - Use Nginx reverse proxy
   - Install SSL certificate (Let's Encrypt free)
   - Configure reverse proxy to forward to Node.js

5. **Setup Backups**

   ```bash
   # Backup database weekly
   mysqldump -u root -p qr_attendance_db > backup_$(date +%Y%m%d).sql
   ```

6. **Monitor Logs**
   ```bash
   # Keep logs clean
   find logs/ -name "*.log" -mtime +30 -delete
   ```

---

## Performance Optimization

### 1. Add Database Connection Pooling

Already configured in `src/config/database.js` with:

- connectionLimit: 10
- queueLimit: 0

### 2. Enable Compression

Add to server.js:

```javascript
const compression = require("compression");
app.use(compression());
```

Then install:

```bash
npm install compression
```

### 3. Use Reverse Proxy

Setup Nginx to proxy Node.js and serve static files.

---

## Deployment Checklist

- [ ] All dependencies installed
- [ ] .env file configured with production values
- [ ] Database created and migrated
- [ ] Admin password changed
- [ ] Security headers verified
- [ ] Logging working
- [ ] Firewall rules added
- [ ] IP address in APP_HOST
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Error monitoring setup
- [ ] Rate limiting tested
- [ ] CSRF protection verified

---

## Support & Troubleshooting

1. **Check Logs:**

   ```bash
   tail -f logs/combined.log
   ```

2. **Check Network:**

   ```bash
   curl http://localhost:3000/admin/login
   ```

3. **Check MySQL:**

   ```bash
   mysql -u root -p qr_attendance_db -e "SELECT * FROM attendance LIMIT 1;"
   ```

4. **Restart Server:**
   ```bash
   npm run dev
   ```

---

## Useful Commands

```bash
# View logs in real-time
tail -f logs/combined.log

# Search logs for errors
grep "error" logs/error.log

# Count attendance records
mysql -u root -p qr_attendance_db -e "SELECT COUNT(*) FROM attendance WHERE is_deleted=0;"

# Backup database
mysqldump -u root -p qr_attendance_db > qr_attendance_backup.sql

# Restore database
mysql -u root -p qr_attendance_db < qr_attendance_backup.sql

# Clear logs
rm logs/*.log

# Kill all Node processes
pkill -f "node server.js"
```

---

**Congratulations! Your QR Attendance System is now set up and ready to use! 🎉**

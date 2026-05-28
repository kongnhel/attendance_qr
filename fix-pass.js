const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// ភ្ជាប់ទៅកាន់ Database របស់អ្នក
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'qr_attendance_db'
});

async function resetPassword() {
    const rawPassword = 'admin123'; // នេះជា password ដែលអ្នកចង់ប្រើសម្រាប់ login
    
    // បង្កើត Hash ដែលត្រឹមត្រូវស្របតាម Version របស់ bcrypt ក្នុងម៉ាស៊ីនរបស់អ្នក
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(rawPassword, saltRounds);
    
    // បញ្ចូល ឬ ធ្វើបច្ចុប្បន្នភាពទៅក្នុង Database ដោយផ្ទាល់
    const sql = `
        INSERT INTO admins (username, password) 
        VALUES ('admin', ?) 
        ON DUPLICATE KEY UPDATE password = ?
    `;
    
    db.query(sql, [hashedPass, hashedPass], (err, result) => {
        if (err) {
            console.error('❌ មានបញ្ហាក្នុងការបញ្ចូលទៅ Database:', err);
        } else {
            console.log('----------------------------------------------------');
            console.log('✅ បានធ្វើបច្ចុប្បន្នភាព Password ជោគជ័យ!');
            console.log('👤 Username: admin');
            console.log('🔑 Password: admin123');
            console.log('🔒 Secure Hash នៅក្នុង DB គឺ:', hashedPass);
            console.log('----------------------------------------------------');
        }
        db.end();
    });
}

resetPassword();
-- ============================================
-- QR Attendance System - Database Migration
-- Run this to update your database schema
-- ============================================

-- Add new columns to attendance table for soft delete support
ALTER TABLE `attendance` 
ADD COLUMN `age` INT NULL AFTER `gender`,
ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 AFTER `place`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`,
ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `updated_at`;

-- Add index for deleted records query optimization
CREATE INDEX `idx_is_deleted` ON `attendance` (`is_deleted`);
CREATE INDEX `idx_created_date` ON `attendance` (`created_at`);
CREATE INDEX `idx_phone_date` ON `attendance` (`phone`, `created_at`);

-- Make sure admins table exists
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Display results
SELECT '✅ Migration completed successfully!' AS Status;
SHOW COLUMNS FROM attendance;

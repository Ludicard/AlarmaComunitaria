-- Estructura de Base de Datos para Alarma Comunitaria

CREATE TABLE IF NOT EXISTS `zones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `invite_code` VARCHAR(10) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `zone_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('residente', 'admin') DEFAULT 'residente',
  `status` ENUM('activo', 'bloqueado') DEFAULT 'activo',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `incidents` (
  `id` VARCHAR(50) PRIMARY KEY,
  `zone_id` INT NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `priority` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'activo',
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `reporter_id` VARCHAR(50) NOT NULL,
  `reporter_name` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `address` VARCHAR(200),
  `image_uri` VARCHAR(255),
  `is_sos` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(50) PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `text` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `safety_confirmations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `confirmed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_confirmation` (`incident_id`, `user_id`),
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `esp32_commands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `zone_id` INT NOT NULL,
  `audio_to_play` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE CASCADE
);

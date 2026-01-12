-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         5.7.33 - MySQL Community Server (GPL)
-- SO del servidor:              Win64
-- HeidiSQL Versión:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para cnc_campas
CREATE DATABASE IF NOT EXISTS `cnc_campas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `cnc_campas`;

-- Volcando estructura para tabla cnc_campas.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.categories: ~6 rows (aproximadamente)
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `color`, `created_at`) VALUES
	(1, 'Mecanizado CNC', 'mecanizado-cnc', 'fa-cog', '#6B4423', '2026-01-11 09:19:02'),
	(2, 'Corte y Grabado Láser', 'corte-grabado-laser', 'fa-cut', '#C77340', '2026-01-11 09:19:02'),
	(3, 'Impresión UV', 'impresion-uv', 'fa-print', '#3D5A3C', '2026-01-11 09:19:02'),
	(4, 'Prototipos e Impresión 3D', 'prototipos-impresion-3d', 'fa-cube', '#8b5cf6', '2026-01-11 09:19:02'),
	(5, 'Letreros y Señalética', 'letreros-senaletica', 'fa-lightbulb', '#f59e0b', '2026-01-11 09:19:02'),
	(6, 'Publicidad y Rotulación', 'publicidad-rotulacion', 'fa-image', '#ec4899', '2026-01-11 09:19:02');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.coupons
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT '0.00',
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.coupons: ~3 rows (aproximadamente)
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_purchase`, `max_uses`, `used_count`, `expires_at`, `active`, `created_at`, `updated_at`) VALUES
	(1, 'BIENVENIDO10', 'Cupón de bienvenida - 10% de descuento', 'percentage', 10.00, 50.00, 100, 0, '2026-02-10 20:09:58', 1, '2026-01-11 20:09:58', '2026-01-11 20:09:58'),
	(2, 'PRIMERACOMPRA', 'Primera compra - $15 de descuento', 'fixed', 15.00, 75.00, 50, 0, '2026-03-12 20:09:58', 1, '2026-01-11 20:09:58', '2026-01-11 20:09:58'),
	(3, 'VERANO2026', 'Promoción de verano - 15% descuento', 'percentage', 15.00, 100.00, NULL, 0, '2026-04-11 20:09:58', 1, '2026-01-11 20:09:58', '2026-01-11 20:09:58');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.gallery
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `order_index` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`active`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.gallery: ~6 rows (aproximadamente)
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
INSERT INTO `gallery` (`id`, `title`, `description`, `image`, `category`, `active`, `order_index`, `created_at`, `updated_at`) VALUES
	(1, 'Letras Corpóreas 3D', 'Corte CNC en acrílico con iluminación LED. Instalación en fachada comercial.', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop', 'CNC', 1, 1, '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(2, 'Grabado Láser Detallado', 'Grabado láser de precisión en madera maciza. Diseño personalizado para cliente corporativo.', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', 'Láser', 1, 2, '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(3, 'Lona Publicitaria Premium', 'Impresión gran formato para exterior. Campaña publicitaria de marca reconocida.', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop', 'Impresión', 1, 3, '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(4, 'Impresión UV Personalizada', 'Impresión directa UV sobre superficie rígida. Alta calidad y durabilidad.', 'https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=600&h=400&fit=crop', 'UV', 1, 4, '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(5, 'Prototipo Funcional 3D', 'Pieza técnica impresa en 3D con alta precisión. Prototipo para industria automotriz.', 'https://images.unsplash.com/photo-1614025767867-c072ca0cdc18?w=600&h=400&fit=crop', '3D', 1, 5, '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(6, 'Letrero LED Iluminado', 'Señalética luminosa de bajo consumo. Instalación en local comercial.', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop', 'LED', 1, 6, '2026-01-11 09:19:02', '2026-01-11 09:19:02');
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','processing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'transfer',
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_customer_email` (`customer_email`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.orders: ~9 rows (aproximadamente)
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `notes`, `status`, `payment_status`, `payment_method`, `subtotal`, `tax`, `total`, `coupon_code`, `discount`, `created_at`, `updated_at`) VALUES
	(1, NULL, 'Administrador', 'admin@designshop.com', '+593968526332', NULL, 'pending', 'pending', 'transfer', 59.98, 7.20, 67.18, NULL, 0.00, '2026-01-11 09:19:09', '2026-01-11 09:19:09'),
	(2, NULL, 'Administrador', 'admin@designshop.com', '+593968526332', NULL, 'pending', 'pending', 'transfer', 104.99, 12.60, 117.59, NULL, 0.00, '2026-01-11 09:19:55', '2026-01-11 09:19:55'),
	(3, NULL, 'Administrador', 'admin@designshop.com', '+593968526332', NULL, 'pending', 'pending', 'transfer', 39.99, 4.80, 44.79, NULL, 0.00, '2026-01-11 09:26:48', '2026-01-11 09:26:48'),
	(4, NULL, 'Administrador', 'admin@designshop.com', '+593968526332', NULL, 'pending', 'pending', 'transfer', 39.99, 4.80, 44.79, NULL, 0.00, '2026-01-11 09:32:34', '2026-01-11 09:32:34'),
	(5, NULL, 'Administrador', 'admin@designshop.com', '0968526332', NULL, 'pending', 'pending', 'transfer', 104.99, 12.60, 117.59, NULL, 0.00, '2026-01-11 09:37:52', '2026-01-11 09:37:52'),
	(6, NULL, 'Test Diagnóstico', 'diagnostico@test.com', '+593991234567', 'Pedido creado desde SQL', 'completed', 'paid', 'transfer', 100.00, 12.00, 112.00, NULL, 0.00, '2026-01-11 09:44:02', '2026-01-11 21:59:43'),
	(7, NULL, 'Administrador', 'admin@cnccampas.com', '0968526332', NULL, 'pending', 'pending', 'transfer', 39.99, 4.80, 44.79, NULL, 0.00, '2026-01-11 10:04:05', '2026-01-11 10:04:05'),
	(8, NULL, 'Administrador', 'lady.vargas.santana@gmail.com', '0968526332', NULL, 'cancelled', 'pending', 'transfer', 39.99, 4.80, 44.79, NULL, 0.00, '2026-01-11 10:09:27', '2026-01-11 20:20:17'),
	(9, NULL, 'Administrador', 'admin@designshop.com', '0968526332', NULL, 'completed', 'paid', 'transfer', 45.00, 5.40, 50.40, NULL, 0.00, '2026-01-11 21:18:46', '2026-01-11 21:57:13');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.order_items: ~11 rows (aproximadamente)
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES
	(1, 1, 3, NULL, 1, 19.99),
	(2, 1, 1, NULL, 1, 39.99),
	(3, 2, 1, NULL, 1, 39.99),
	(4, 2, 2, NULL, 1, 65.00),
	(5, 3, 1, NULL, 1, 39.99),
	(6, 4, 1, NULL, 1, 39.99),
	(7, 5, 1, NULL, 1, 39.99),
	(8, 5, 2, NULL, 1, 65.00),
	(9, 6, 1, NULL, 1, 45.00),
	(10, 6, 2, NULL, 1, 65.00),
	(12, 7, 1, NULL, 1, 39.99),
	(13, 8, 1, NULL, 1, 39.99),
	(14, 9, 1, NULL, 1, 45.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `featured` tinyint(1) DEFAULT '0',
  `trending` tinyint(1) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `stock` int(11) DEFAULT '100',
  `downloads` int(11) DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '5.00',
  `file_format` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_featured` (`featured`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.products: ~12 rows (aproximadamente)
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (`id`, `name`, `description`, `price`, `sale_price`, `category`, `image`, `featured`, `trending`, `active`, `stock`, `downloads`, `rating`, `file_format`, `created_at`, `updated_at`) VALUES
	(1, 'Letrero Corpóreo CNC', 'Letrero corpóreo en MDF cortado con precisión CNC. Acabado profesional para interiores y exteriores. Incluye diseño personalizado según sus necesidades.', 45.00, NULL, 'Mecanizado CNC', '/uploads/1768185320502-665522706.jpg', 1, 1, 1, 1, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-11 21:35:20'),
	(2, 'Display Publicitario CNC', 'Display de exhibición cortado en acrílico con router CNC. Diseño personalizable según necesidades. Ideal para promociones y exhibiciones.', 65.00, NULL, 'Mecanizado CNC', '/uploads/1768185330995-892728871.png', 1, 0, 1, 30, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-11 21:35:31'),
	(3, 'Grabado Láser en Madera', 'Grabado láser de alta precisión en madera maciza. Ideal para placas conmemorativas, señalética y regalos personalizados. Acabado profesional.', 25.00, 19.99, 'Corte y Grabado Láser', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80', 1, 1, 1, 100, 0, 5.00, 'Madera', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(4, 'Corte Láser Acrílico', 'Corte láser de precisión en acrílico de 3mm. Bordes pulidos y acabado profesional. Múltiples colores disponibles.', 35.00, NULL, 'Corte y Grabado Láser', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80', 0, 0, 1, 75, 0, 5.00, 'Acrílico 3mm', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(5, 'Impresión UV sobre Madera', 'Impresión UV directa sobre madera con colores vibrantes y alta resolución. Alta durabilidad para exteriores. Resistente a rayos UV.', 55.00, 49.99, 'Impresión UV', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80', 1, 1, 1, 40, 0, 5.00, 'Madera/MDF', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(6, 'Impresión UV Acrílico', 'Impresión UV sobre acrílico transparente. Efecto flotante y alta calidad de imagen. Perfecto para decoración moderna.', 70.00, NULL, 'Impresión UV', '/uploads/1768188151844-105780410.jpg', 1, 0, 1, 25, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-11 22:22:31'),
	(7, 'Prototipo Funcional 3D', 'Impresión 3D de prototipos funcionales en PLA. Alta precisión y acabado limpio. Ideal para pruebas y desarrollo de productos.', 40.00, NULL, 'Prototipos e Impresión 3D', '/uploads/1768185364161-207705079.jpg', 1, 1, 1, 60, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-11 21:36:04'),
	(8, 'Figura Decorativa 3D', 'Figuras decorativas impresas en 3D. Material resistente y múltiples acabados disponibles. Personalización completa.', 30.00, NULL, 'Prototipos e Impresión 3D', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80', 0, 0, 1, 80, 0, 5.00, 'PLA', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(9, 'Letrero LED Personalizado', 'Letrero LED luminoso con bajo consumo energético. Ideal para negocios, eventos y decoración. Incluye fuente de alimentación.', 120.00, 99.99, 'Letreros y Señalética', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80', 1, 1, 1, 15, 0, 5.00, 'LED/Acrílico', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(10, 'Señalética Corporativa', 'Señalética profesional para empresas. Incluye diseño gráfico y fabricación. Materiales de alta calidad y durabilidad.', 85.00, NULL, 'Letreros y Señalética', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80', 0, 0, 1, 20, 0, 5.00, 'PVC/Acrílico', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(11, 'Lona Publicitaria Gran Formato', 'Impresión en lona de alta calidad con tintas eco-solventes. Resistente a intemperie con ojales reforzados. Ideal para exteriores.', 95.00, 79.99, 'Publicidad y Rotulación', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80', 1, 1, 1, 35, 0, 5.00, 'Lona', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(12, 'Vinilo Decorativo', 'Vinilo adhesivo de alta adherencia para aplicaciones en vitrinas, paredes y vehículos. Múltiples colores y acabados.', 45.00, NULL, 'Publicidad y Rotulación', '/uploads/1768188114393-294796897.jpg', 1, 0, 1, 90, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-11 22:21:54');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.promotions
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `applies_to` enum('all','products','categories') COLLATE utf8mb4_unicode_ci DEFAULT 'all',
  `product_ids` json DEFAULT NULL,
  `category_ids` json DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.promotions: ~3 rows (aproximadamente)
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` (`id`, `name`, `description`, `discount_type`, `discount_value`, `applies_to`, `product_ids`, `category_ids`, `start_date`, `end_date`, `active`, `created_at`, `updated_at`) VALUES
	(2, 'Oferta de Temporada', 'Descuento especial en productos seleccionados', 'percentage', 20.00, 'products', NULL, NULL, '2026-01-11 20:09:58', '2026-01-26 20:09:58', 1, '2026-01-11 20:09:58', '2026-01-11 20:09:58'),
	(3, 'Black Friday 2026', 'Gran descuento en categorías específicas', 'percentage', 25.00, 'categories', NULL, NULL, '2026-03-12 20:09:58', '2026-03-17 20:09:58', 0, '2026-01-11 20:09:58', '2026-01-11 20:09:58');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.reviews: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;

-- Volcando estructura para tabla cnc_campas.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.users: ~2 rows (aproximadamente)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
	(2, 'Cliente Demo', 'usuario@test.com', '$2a$10$rS7kGJGvYXxQZQXOJQXOJu5kGJGvYXxQZQXOJQXOJu5kGJGvYXxQZQ', 'user', '2026-01-11 09:19:02', '2026-01-11 09:19:02'),
	(7, 'Administrador CNC', 'admin@cnccampas.com', '$2b$10$wReLLUNK7jbLXRyQnFbBjOGXHtaWKkmTPTfkL0kHc1qR4hegYdXXW', 'admin', '2026-01-11 10:20:50', '2026-01-11 10:26:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

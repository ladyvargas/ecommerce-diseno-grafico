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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.categories: ~7 rows (aproximadamente)
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `color`, `created_at`) VALUES
	(1, 'Mecanizado CNC', 'mecanizado-cnc', 'fa-cog', '#6B4423', '2026-01-11 09:19:02'),
	(2, 'Corte y Grabado Láser', 'corte-grabado-laser', 'fa-cut', '#C77340', '2026-01-11 09:19:02'),
	(3, 'Impresión UV', 'impresion-uv', 'fa-print', '#3D5A3C', '2026-01-11 09:19:02'),
	(4, 'Prototipos e Impresión 3D', 'prototipos-impresion-3d', 'fa-cube', '#8b5cf6', '2026-01-11 09:19:02'),
	(5, 'Letreros y Señalética', 'letreros-senaletica', 'fa-lightbulb', '#f59e0b', '2026-01-11 09:19:02'),
	(6, 'Publicidad y Rotulación', 'publicidad-rotulacion', 'fa-image', '#ec4899', '2026-01-11 09:19:02'),
	(7, 'Servicios', 'servicios', 'fa-briefcase', '#0ea5e9', '2026-01-20 20:25:02');
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

-- Volcando datos para la tabla cnc_campas.order_items: ~13 rows (aproximadamente)
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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla cnc_campas.products: ~36 rows (aproximadamente)
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (`id`, `name`, `description`, `price`, `sale_price`, `category`, `image`, `featured`, `trending`, `active`, `stock`, `downloads`, `rating`, `file_format`, `created_at`, `updated_at`) VALUES
	(1, 'Letrero Corpóreo CNC', 'Servicio de corte preciso y profesional para madera, plywood y MDF. Ideal para\npiezas personalizadas, producción en serie  y acabados limpios con alta exactitud.\nPrecisión y calidad en cada corte', 45.00, NULL, 'Servicios', '/uploads/1768875123468-563330462.png', 1, 1, 1, 1, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-20 20:26:37'),
	(3, 'CORTE Y GRABADO LASER PROFESIONAL', 'Cortamos y grabamos con láser de alta precisión, logrando detalles finos, bordes limpios y resultados exactos. Ideal para madera, acrílico y otros materiales,  tanto en piezas únicas como en producción\nen serie.  Precisión total para llevar tus ideas al siguiente nivel.', 25.00, NULL, 'Servicios', '/uploads/1768872885866-680053875.png', 1, 1, 1, 100, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-20 20:26:37'),
	(5, 'SERVICIO DE IMPRESION UV DTF', 'Que no pares de crear, nuestra impresora de alta calidad, imprime sobre una amplia variedad de materiales como madera, acrilico, vidrio, metal,\nPVC y más.\nEsta tecnología permite colores intensos, alta durabilidad y secado instantáneo, ideal para productos personalizados, señaleticas, regalos  corporativos y puezas decorativas.', 55.00, NULL, 'Servicios', '/uploads/1768875184339-899806244.png', 1, 1, 1, 40, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-20 20:26:37'),
	(7, 'IMPRESION PROFESIONAL 3D', 'Realizamos impresión 3D personalizada para la creación de piezas únicas, prototipos, repuestos, accesorios y objetos decorativos.\nTransformamos tus ideas en modelos físicos con precisión, rapidez y adaptados a tus necesidades funcionales o estéticas', 40.00, NULL, 'Servicios', '/uploads/1768875274478-596987597.png', 1, 1, 1, 60, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-20 20:26:37'),
	(9, 'GRABADO LASER DE FIBRA', 'Precisión sobre materiales industriales, ideal para marcaje permanente, logotipos, códigos, numeración, plaas, herramientas y productos personalizados de\nalta resistencia.', 120.00, NULL, 'Servicios', '/uploads/1768875422200-307740949.png', 1, 1, 1, 15, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-20 20:26:37'),
	(11, 'PLOTTER DE IMPRESIÓN', 'Gran formato hasta 1.80 metros, ideal para banner, vinilos, adhesivos, gigantografías, rotulación  comercial y meterial publicitario. Colores vivos, alta \nresolución y acabados profesionales para destacar tu marca de forma porfesional.', 95.00, NULL, 'Servicios', '/uploads/1768875422200-307740949.png', 1, 1, 1, 35, 0, 5.00, '', '2026-01-11 09:19:02', '2026-01-20 21:53:42'),
	(37, 'Corte CNC en MDF', 'Corte CNC de alta precisión en MDF para proyectos personalizados.', 45.00, NULL, 'Mecanizado CNC', 'https://images.unsplash.com/photo-1581092334651-ddf26d9f6b6b?w=800&q=80', 1, 1, 1, 50, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(38, 'Corte CNC Acrílico', 'Corte profesional en acrílico con acabados limpios.', 60.00, NULL, 'Mecanizado CNC', 'https://images.unsplash.com/photo-1621905252472-943afaa20e20?w=800&q=80', 0, 1, 1, 40, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(39, 'Corte CNC Plywood', 'Servicio de corte CNC en plywood para muebles y decoración.', 55.00, NULL, 'Mecanizado CNC', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80', 0, 0, 1, 30, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(40, 'Letras Corpóreas CNC', 'Fabricación de letras corpóreas con router CNC.', 80.00, NULL, 'Mecanizado CNC', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80', 1, 0, 1, 20, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(41, 'Grabado Láser en Madera', 'Grabado láser detallado en madera natural.', 25.00, NULL, 'Corte y Grabado Láser', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80', 1, 1, 1, 100, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(42, 'Corte Láser Acrílico', 'Corte láser preciso en acrílico de colores.', 35.00, NULL, 'Corte y Grabado Láser', 'https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=800&q=80', 0, 1, 1, 80, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(43, 'Grabado Láser Cuero', 'Personalización en cuero con tecnología láser.', 30.00, NULL, 'Corte y Grabado Láser', 'https://images.unsplash.com/photo-1603575448363-7b0c64d1b8a6?w=800&q=80', 0, 0, 1, 60, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(44, 'Corte Láser MDF', 'Corte rápido y preciso en MDF.', 28.00, NULL, 'Corte y Grabado Láser', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80', 0, 0, 1, 70, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(45, 'Impresión UV sobre Acrílico', 'Impresión UV directa sobre acrílico rígido.', 70.00, NULL, 'Impresión UV', 'https://images.unsplash.com/photo-1600372004613-b24a0e2f8a2b?w=800&q=80', 1, 1, 1, 40, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(46, 'Impresión UV en Madera', 'Colores intensos impresos con tecnología UV.', 65.00, NULL, 'Impresión UV', 'https://images.unsplash.com/photo-1620283085439-39620a1b8c74?w=800&q=80', 0, 1, 1, 35, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(47, 'Impresión UV en Vidrio', 'Impresión decorativa sobre vidrio templado.', 90.00, NULL, 'Impresión UV', 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80', 0, 0, 1, 20, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(48, 'Impresión UV Señalética', 'Señalética profesional con impresión UV.', 85.00, NULL, 'Impresión UV', 'https://images.unsplash.com/photo-1582719478170-2cfc2b1fdf9b?w=800&q=80', 1, 0, 1, 25, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(49, 'Prototipo 3D Funcional', 'Prototipos técnicos impresos en 3D.', 50.00, NULL, 'Prototipos e Impresión 3D', 'https://images.unsplash.com/photo-1581091012184-5c3d3cdd2c1d?w=800&q=80', 1, 1, 1, 60, 0, 5.00, 'PLA', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(50, 'Pieza Mecánica 3D', 'Fabricación de piezas mecánicas en impresión 3D.', 45.00, NULL, 'Prototipos e Impresión 3D', 'https://images.unsplash.com/photo-1581092334675-0a7b0f69c38d?w=800&q=80', 0, 1, 1, 50, 0, 5.00, 'PLA', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(51, 'Figura Decorativa 3D', 'Figuras decorativas impresas en 3D.', 30.00, NULL, 'Prototipos e Impresión 3D', 'https://images.unsplash.com/photo-1614025767867-c072ca0cdc18?w=800&q=80', 0, 0, 1, 80, 0, 5.00, 'PLA', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(52, 'Repuesto Técnico 3D', 'Repuestos personalizados mediante impresión 3D.', 40.00, NULL, 'Prototipos e Impresión 3D', 'https://images.unsplash.com/photo-1620283085439-39620a1b8c74?w=800&q=80', 0, 0, 1, 70, 0, 5.00, 'PLA', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(53, 'Letrero LED', 'Letrero luminoso LED de bajo consumo.', 120.00, NULL, 'Letreros y Señalética', 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80', 1, 1, 1, 15, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(54, 'Señalética Corporativa', 'Señalización profesional para empresas.', 85.00, NULL, 'Letreros y Señalética', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', 0, 1, 1, 25, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(55, 'Placa Acrílica', 'Placas acrílicas personalizadas.', 45.00, NULL, 'Letreros y Señalética', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', 0, 0, 1, 40, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(56, 'Letrero Exterior', 'Letreros resistentes para exteriores.', 150.00, NULL, 'Letreros y Señalética', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80', 1, 0, 1, 10, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(57, 'Rotulación Vehicular', 'Rotulación profesional para vehículos.', 180.00, NULL, 'Publicidad y Rotulación', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80', 1, 1, 1, 20, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(58, 'Banner Publicitario', 'Banner publicitario en lona de alta calidad.', 60.00, NULL, 'Publicidad y Rotulación', 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=800&q=80', 0, 1, 1, 50, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(59, 'Vinilo Adhesivo', 'Vinilo adhesivo decorativo y publicitario.', 45.00, NULL, 'Publicidad y Rotulación', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80', 0, 0, 1, 90, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(60, 'Gigantografía', 'Impresión gran formato para exteriores.', 200.00, NULL, 'Publicidad y Rotulación', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80', 1, 0, 1, 8, 0, 5.00, '', '2026-01-20 20:35:07', '2026-01-20 20:35:07'),
	(61, 'SUBLIMACIÓN PROFESIONAL', 'Servicio de sublimación profesional en textiles y productos promocionales. Colores intensos y duraderos en camisetas, tazas, gorras, mouse pads y artículos personalizados.', 30.00, NULL, 'Servicios', '/uploads/1768875477652-155628555.png', 1, 1, 1, 0, 0, 5.00, NULL, '2026-01-20 21:51:57', '2026-01-20 21:52:50');
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

-- Volcando datos para la tabla cnc_campas.promotions: ~2 rows (aproximadamente)
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

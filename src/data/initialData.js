const bcrypt = require('bcryptjs');

module.exports = () => {
    // Usuarios de prueba
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const userPassword = bcrypt.hashSync('user123', 10);
    
    global.db.users = [
        {
            id: 1,
            name: 'Administrador',
            email: 'admin@CNC CAMPAS.com',
            password: adminPassword,
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Usuario Demo',
            email: 'usuario@test.com',
            password: userPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        }
    ];

    // Productos/Servicios de CNC CAMPAS
    global.db.products = [
        {
            id: 1,
            name: 'Letrero LED Luminoso Personalizado',
            description: 'Letrero LED de alta luminosidad para exteriores e interiores. Diseño 100% personalizado según tu marca. Incluye transformador y sistema de montaje.',
            price: 299.99,
            salePrice: 249.99,
            category: 'Letreros y Señalética',
            image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&h=400&fit=crop',
            featured: true,
            downloads: 156,
            rating: 4.9,
            fileFormat: 'Personalizado',
            stock: 25,
            active: true,
            lowStockThreshold: 5,
            trending: true
        },
        {
            id: 2,
            name: 'Valla Publicitaria Impresa',
            description: 'Impresión de vallas publicitarias en lona de alta resistencia con plotter gran formato. Ideal para publicidad exterior. Incluye ojales reforzados.',
            price: 149.99,
            category: 'Publicidad y Rotulación',
            image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop',
            featured: true,
            downloads: 234,
            rating: 4.8,
            fileFormat: 'Lona, Vinil',
            stock: 50,
            active: true,
            lowStockThreshold: 10
        },
        {
            id: 3,
            name: 'Corte CNC en Acrílico',
            description: 'Servicio de corte y mecanizado CNC en acrílico de 3mm hasta 20mm. Ideal para displays, señalética, exhibidores y piezas decorativas. Cortes de alta precisión.',
            price: 89.99,
            category: 'Mecanizado CNC',
            image: 'https://images.unsplash.com/photo-1565024640326-b2ae7c1c2fd9?w=600&h=400&fit=crop',
            featured: true,
            downloads: 189,
            rating: 5.0,
            fileFormat: 'Acrílico 3mm-20mm',
            stock: 40,
            active: true,
            lowStockThreshold: 8,
            trending: true
        },
        {
            id: 4,
            name: 'Impresión UV DTF',
            description: 'Impresión directa DTF (Direct to Film) y sobre superficies sólidas como madera, MDF, acrílico, metal. Colores vibrantes y alta durabilidad.',
            price: 79.99,
            category: 'Impresión UV',
            image: 'https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=600&h=400&fit=crop',
            featured: false,
            downloads: 98,
            rating: 4.7,
            fileFormat: 'Madera, MDF, Acrílico, Metal',
            stock: 30,
            active: true,
            lowStockThreshold: 10
        },
        {
            id: 5,
            name: 'Corte y Grabado Láser',
            description: 'Corte y grabado láser de alta precisión en madera, MDF, acrílico y otros materiales. Ideal para piezas decorativas, señalética y productos personalizados.',
            price: 59.99,
            category: 'Corte y Grabado Láser',
            image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
            featured: true,
            downloads: 312,
            rating: 4.9,
            fileFormat: 'Madera, Acrílico, MDF',
            stock: 60,
            active: true,
            lowStockThreshold: 15
        },
        {
            id: 6,
            name: 'Letras Corpóreas 3D',
            description: 'Letras corpóreas tridimensionales fabricadas con Router CNC en PVC, acrílico o madera. Acabados profesionales para fachadas y espacios comerciales.',
            price: 199.99,
            salePrice: 179.99,
            category: 'Letreros y Señalética',
            image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop',
            featured: true,
            downloads: 145,
            rating: 4.8,
            fileFormat: 'PVC, Acrílico, Madera',
            stock: 20,
            active: true,
            lowStockThreshold: 5,
            trending: true
        },
        {
            id: 7,
            name: 'Banner Roll Up Publicitario',
            description: 'Banner roll up portátil con impresión en alta calidad. Incluye estructura retráctil y bolso de transporte. Ideal para ferias y eventos.',
            price: 89.99,
            category: 'Publicidad y Rotulación',
            image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
            featured: false,
            downloads: 267,
            rating: 4.6,
            fileFormat: 'Lona + Estructura',
            stock: 35,
            active: true,
            lowStockThreshold: 10
        },
        {
            id: 8,
            name: 'Prototipo Funcional 3D',
            description: 'Impresión 3D de prototipos funcionales y maquetas. Alta precisión y múltiples materiales disponibles. Ideal para validación de diseño.',
            price: 129.99,
            category: 'Prototipos e Impresión 3D',
            image: 'https://images.unsplash.com/photo-1614025767867-c072ca0cdc18?w=600&h=400&fit=crop',
            featured: false,
            downloads: 87,
            rating: 4.9,
            fileFormat: 'PLA, ABS, PETG',
            stock: 15,
            active: true,
            lowStockThreshold: 5
        },
        {
            id: 9,
            name: 'Display Exhibidor en Acrílico',
            description: 'Exhibidor personalizado fabricado en acrílico con Router CNC. Ideal para productos, menús, promociones. Diseño a medida según tus necesidades.',
            price: 119.99,
            category: 'Mecanizado CNC',
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop',
            featured: true,
            downloads: 176,
            rating: 4.8,
            fileFormat: 'Acrílico transparente/color',
            stock: 25,
            active: true,
            lowStockThreshold: 5
        },
        {
            id: 10,
            name: 'Placa Conmemorativa Grabada',
            description: 'Placas conmemorativas con grabado láser de alta precisión en acrílico, madera o metal. Personalización completa de diseño y texto.',
            price: 49.99,
            category: 'Corte y Grabado Láser',
            image: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&h=400&fit=crop',
            featured: false,
            downloads: 423,
            rating: 4.7,
            fileFormat: 'Madera, Acrílico, Metal',
            stock: 80,
            active: true,
            lowStockThreshold: 20
        },
        {
            id: 11,
            name: 'Señalización Corporativa Completa',
            description: 'Sistema completo de señalización para oficinas, comercios o edificios. Incluye directorios, placas de puerta, señalética de baños y emergencia.',
            price: 459.99,
            category: 'Letreros y Señalética',
            image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop',
            featured: false,
            downloads: 54,
            rating: 5.0,
            fileFormat: 'Acrílico, PVC, Alucobond',
            stock: 8,
            active: true,
            lowStockThreshold: 3
        },
        {
            id: 12,
            name: 'Rótulo Backlight Iluminado',
            description: 'Rótulo retroiluminado con tecnología LED. Acrílico de alta calidad con iluminación uniforme. Bajo consumo y máxima visibilidad nocturna.',
            price: 329.99,
            salePrice: 289.99,
            category: 'Letreros y Señalética',
            image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop',
            featured: true,
            downloads: 198,
            rating: 4.9,
            fileFormat: 'Acrílico + LED',
            stock: 18,
            active: true,
            lowStockThreshold: 5,
            trending: true
        }
    ];

    // Categorías basadas en servicios reales
    global.db.categories = [
        { 
            id: 1, 
            name: 'Letreros y Señalética', 
            icon: 'fa-sign', 
            color: '#3d4d9e',
            description: 'Letreros LED, corpóreos, directorios y señalización' 
        },
        { 
            id: 2, 
            name: 'Publicidad y Rotulación', 
            icon: 'fa-bullhorn', 
            color: '#10b981',
            description: 'Vallas, rótulos, banners y lonas publicitarias' 
        },
        { 
            id: 3, 
            name: 'Mecanizado CNC', 
            icon: 'fa-cog', 
            color: '#f59e0b',
            description: 'Corte y fresado CNC en acrílico, PVC, madera y más' 
        },
        { 
            id: 4, 
            name: 'Corte y Grabado Láser', 
            icon: 'fa-cut', 
            color: '#ec4899',
            description: 'Corte y grabado láser de precisión' 
        },
        { 
            id: 5, 
            name: 'Impresión UV', 
            icon: 'fa-print', 
            color: '#8b5cf6',
            description: 'Impresión UV sobre superficies y DTF' 
        },
        { 
            id: 6, 
            name: 'Prototipos e Impresión 3D', 
            icon: 'fa-cube', 
            color: '#14b8a6',
            description: 'Prototipos funcionales y maquetas 3D' 
        }
    ];

    // Órdenes de ejemplo
    global.db.orders = [
        {
            id: 1,
            userId: 2,
            userName: 'Usuario Demo',
            userEmail: 'usuario@test.com',
            customerName: 'Usuario Demo',
            customerEmail: 'usuario@test.com',
            customerPhone: '+593 99 123 4567',
            items: [
                {
                    productId: 1,
                    productName: 'Letrero LED Personalizado',
                    name: 'Letrero LED Personalizado',
                    quantity: 1,
                    price: 299.99,
                    salePrice: 249.99,
                    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80'
                },
                {
                    productId: 3,
                    productName: 'Corte CNC en Acrílico',
                    name: 'Corte CNC en Acrílico',
                    quantity: 2,
                    price: 89.99,
                    salePrice: null,
                    image: 'https://images.unsplash.com/photo-1565024640326-b2ae7c1c2fd9?w=600&q=80'
                }
            ],
            subtotal: 429.97,
            tax: 51.60,
            total: 481.57,
            status: 'completed',
            paymentStatus: 'paid',
            paymentMethod: 'transfer',
            notes: 'Letrero para fachada de negocio',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            userId: null,
            userName: 'María García',
            userEmail: 'maria@example.com',
            customerName: 'María García',
            customerEmail: 'maria@example.com',
            customerPhone: '+593 98 765 4321',
            items: [
                {
                    productId: 5,
                    productName: 'Corte Láser Personalizado',
                    name: 'Corte Láser Personalizado',
                    quantity: 3,
                    price: 59.99,
                    salePrice: null,
                    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80'
                }
            ],
            subtotal: 179.97,
            tax: 21.60,
            total: 201.57,
            status: 'processing',
            paymentStatus: 'pending',
            paymentMethod: 'transfer',
            notes: 'Corte láser para regalos corporativos',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            userId: null,
            userName: 'Carlos López',
            userEmail: 'carlos@example.com',
            customerName: 'Carlos López',
            customerEmail: 'carlos@example.com',
            customerPhone: '+593 97 654 3210',
            items: [
                {
                    productId: 2,
                    productName: 'Rótulo Impreso Gran Formato',
                    name: 'Rótulo Impreso Gran Formato',
                    quantity: 1,
                    price: 149.99,
                    salePrice: null,
                    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80'
                }
            ],
            subtotal: 149.99,
            tax: 18.00,
            total: 167.99,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'transfer',
            notes: 'Valla para evento deportivo',
            createdAt: new Date().toISOString()
        }
    ];
    
    global.db.cart = {};

    console.log('✅ Datos iniciales de CNC CAMPAS cargados');
    console.log(`📦 ${global.db.products.length} servicios disponibles`);
    console.log(`📂 ${global.db.categories.length} categorías`);
    console.log(`👤 Usuario admin: admin@CNC CAMPAS.com / admin123`);
    console.log(`👤 Usuario demo: usuario@test.com / user123`);
};

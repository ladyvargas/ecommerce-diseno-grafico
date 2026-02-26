// ========================================
// CNC CAMPAS PRO - FRONTEND REDESIGN FIXED
// ========================================

const API_URL = '/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('user'));
let allProducts = [];
let currentFilter = 'all';

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initAOS();
});

function initializeApp() {
    updateCartBadge();
    loadProducts();
    updateAuthUI();
    
    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
}

function initAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100
    });
}

function setupEventListeners() {
    // Cart
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(e.target.dataset.filter);
        });
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========================================
// HEADER EFFECTS
// ========================================

function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// ========================================
// AUTH Y MENÚ DE USUARIO
// ========================================

function updateAuthUI() {
    const userMenuContainer = document.querySelector('.header-actions > div[style*="position: relative"]');
    
    if (!userMenuContainer) {
        console.warn('User menu container not found');
        return;
    }
    
    if (currentUser) {
        // Usuario autenticado - mostrar menú completo con logout
        userMenuContainer.innerHTML = `
            <button class="cart-btn" id="userMenuBtn" onclick="toggleUserMenu()" style="width: auto; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-user-circle" style="font-size: 1.25rem;"></i>
                <span style="font-weight: 500;">${currentUser.name}</span>
                <i class="fas fa-chevron-down" style="font-size: 0.75rem;"></i>
            </button>
            
            <div id="userMenu" style="position: absolute; top: 55px; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); min-width: 220px; display: none; z-index: 1000; border: 1px solid #e2e8f0;">
                <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-weight: 600; color: #1e293b;">${currentUser.name}</div>
                    <div style="font-size: 0.875rem; color: #64748b;">${currentUser.email}</div>
                </div>
                ${currentUser.role === 'admin' ? `
                <a href="/pages/admin-pro.html" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <i class="fas fa-tachometer-alt" style="width: 20px; color: #4a2f1a;"></i>
                    <span>Panel Admin</span>
                </a>
                ` : ''}
                <a href="/pages/mis-pedidos.html" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <i class="fas fa-shopping-bag" style="width: 20px; color: #4a2f1a;"></i>
                    <span>Mis Pedidos</span>
                </a>
                <a href="#" onclick="event.preventDefault(); viewProfile();" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <i class="fas fa-user" style="width: 20px; color: #4a2f1a;"></i>
                    <span>Mi Perfil</span>
                </a>
                <div style="border-top: 1px solid #e2e8f0;"></div>
                <a href="#" onclick="event.preventDefault(); logout();" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #ef4444; text-decoration: none; transition: background 0.3s; font-weight: 500;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">
                    <i class="fas fa-sign-out-alt" style="width: 20px;"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </div>
        `;
    } else {
        // Usuario no autenticado - mostrar menú básico
        userMenuContainer.innerHTML = `
            <button class="cart-btn" id="userMenuBtn" onclick="toggleUserMenu()" style="width: 44px; height: 44px;">
                <i class="fas fa-user"></i>
            </button>
            
            <div id="userMenu" style="position: absolute; top: 55px; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); min-width: 200px; display: none; z-index: 1000; border: 1px solid #e2e8f0;">
                <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-weight: 600; color: #1e293b;">Mi Cuenta</div>
                    <div style="font-size: 0.875rem; color: #64748b;">Invitado</div>
                </div>
                <a href="/pages/orders.html" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <i class="fas fa-shopping-bag" style="width: 20px; color: #4a2f1a;"></i>
                    <span>Mis Pedidos</span>
                </a>
                <a href="/pages/login.html" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s; border-top: 1px solid #e2e8f0;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <i class="fas fa-sign-in-alt" style="width: 20px; color: #4a2f1a;"></i>
                    <span>Ingresar</span>
                </a>
            </div>
        `;
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

function viewProfile() {
    showToast('Función de perfil en desarrollo', 'info');
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        currentUser = null;
        showToast('Sesión cerrada correctamente', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// ========================================
// PRODUCTOS
// ========================================

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        
        allProducts = data.products || data || [];
        
        console.log(`📦 Productos cargados: ${allProducts.length}`);
        
        // Mostrar TODOS los productos destacados (o primeros 6 si no hay destacados)
        const featuredProducts = allProducts.filter(p => p.featured === true);
        const productsToShow = featuredProducts.length > 0 
            ? featuredProducts 
            : allProducts.slice(0, 6);
        
        console.log(`✨ Mostrando ${productsToShow.length} productos (${featuredProducts.length} destacados)`);
        
        renderProducts(productsToShow);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
                    <p style="color: var(--gray-600);">Error al cargar productos. Por favor, intenta de nuevo.</p>
                    <button onclick="loadProducts()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #4a2f1a; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

function filterProducts(filter) {
    currentFilter = filter;
    
    console.log(`🔍 Filtrando por: ${filter}`);
    
    // Obtener productos destacados
    const featuredProducts = allProducts.filter(p => p.featured === true);
    const productsToFilter = featuredProducts.length > 0 ? featuredProducts : allProducts;
    
    if (filter === 'all') {
        renderProducts(productsToFilter);
    } else {
        const filtered = productsToFilter.filter(p => p.category === filter);
        renderProducts(filtered);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) {
        console.warn('Products grid not found');
        return;
    }
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                <p style="color: var(--gray-600);">No se encontraron productos en esta categoría</p>
            </div>
        `;
        return;
    }
    
    console.log(`🎨 Renderizando ${products.length} productos`);
    
    grid.innerHTML = products.map((product, index) => {
        const isOutOfStock = product.stock === 0;
        const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
        
        return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-aos="fade-up" data-aos-delay="${index * 50}" onclick="${isOutOfStock ? '' : `viewProduct(${product.id})`}" style="${isOutOfStock ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                
                <div class="product-badges">
                    ${isOutOfStock ? '<span class="product-badge" style="background: #ef4444;">❌ Sin Stock</span>' : ''}
                    ${isLowStock && !isOutOfStock ? '<span class="product-badge" style="background: #f59e0b;">⚠️ Últimas unidades</span>' : ''}
                    ${product.featured ? '<span class="product-badge badge-new">✨ Destacado</span>' : ''}
                    ${product.trending ? '<span class="product-badge badge-trending">🔥 Tendencia</span>' : ''}
                    ${product.salePrice ? '<span class="product-badge badge-sale">-' + Math.round((1 - product.salePrice / product.price) * 100) + '%</span>' : ''}
                </div>
                
                ${!isOutOfStock ? `
                <div class="product-actions">
                    <button class="product-action-btn" onclick="event.stopPropagation(); quickView(${product.id})" title="Vista rápida">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="product-action-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id})" title="Favoritos">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                ` : ''}
            </div>
            
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-footer">
                    <div>
                        <div class="product-price-container">
                            ${product.salePrice ? `
                                <span class="product-price">$${product.salePrice}</span>
                                <span class="product-price-old">$${product.price}</span>
                            ` : `
                                <span class="product-price">$${product.price}</span>
                            `}
                        </div>
                        <div class="product-rating">
                            <span class="product-stars">
                                ${'★'.repeat(Math.floor(product.rating || 5))}${'☆'.repeat(5 - Math.floor(product.rating || 5))}
                            </span>
                            <span class="product-reviews">(${product.downloads || 0})</span>
                        </div>
                    </div>
                    ${!isOutOfStock ? `
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})" title="Agregar al carrito">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Reiniciar AOS para las nuevas tarjetas
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function viewProduct(productId) {
    window.location.href = `/pages/product.html?id=${productId}`;
}

function quickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    showToast(`Vista rápida: ${product.name}`, 'info');
}

function toggleWishlist(productId) {
    showToast('Agregado a favoritos ❤️', 'success');
}

// ========================================
// CARRITO
// ========================================

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
    }
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    const overlay = document.getElementById('cartOverlay');
    
    if (modal && overlay) {
        const isOpen = modal.classList.contains('active');
        
        if (isOpen) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            modal.classList.add('active');
            overlay.classList.add('active');
            updateCartDisplay();
        }
    }
}

async function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }
    
    // Si allProducts no está cargado, cargarlo primero
    if (allProducts.length === 0) {
        try {
            const response = await fetch(`${API_URL}/products`);
            const data = await response.json();
            allProducts = data.products || data || [];
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }
    
    // NUEVO: Limpiar productos que ya no existen
    const validCart = cart.filter(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) {
            console.warn('Eliminando producto inexistente del carrito:', item.productId);
            return false;
        }
        return true;
    });
    
    // Si se eliminaron productos, actualizar localStorage
    if (validCart.length !== cart.length) {
        cart = validCart;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }
    
    // Si después de limpiar está vacío
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) return '';
        
        const itemTotal = (product.salePrice || product.price) * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${product.name}</h4>
                    <p class="cart-item-price">$${(product.salePrice || product.price).toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.productId}, -1)" style="display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.productId}, 1)" style="display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.productId})" style="display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');
    
    if (cartFooter) cartFooter.style.display = 'block';
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

async function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            productId: productId,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`${product.name} agregado al carrito`, 'success');
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    updateCartDisplay();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    updateCartDisplay();
    showToast('Producto eliminado del carrito', 'info');
}

function proceedToCheckout() {
    if (!currentUser) {
        showToast('Por favor inicia sesión para continuar', 'warning');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1500);
        return;
    }
    
    window.location.href = '/pages/checkout.html';
}

// ========================================
// UTILIDADES
// ========================================

function showToast(message, type = 'info') {
    // Remover toast anterior si existe
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#4a2f1a'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid ${colors[type]};
    `;
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 1.25rem;"></i>
        <span style="color: #1e293b; font-weight: 500;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Agregar animaciones
if (!document.getElementById('toastAnimations')) {
    const style = document.createElement('style');
    style.id = 'toastAnimations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

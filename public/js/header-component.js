// Header Component para CNC CAMPAS
// Este archivo genera el header consistente en todas las páginas

function createHeader() {
    const headerHTML = `
    <header class="header" id="header" style="position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-bottom: 1px solid #e5e7eb;">
        <div class="header-container" style="max-width: 1400px; margin: 0 auto; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center;">
            <a href="/" class="logo" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none;">
                <div class="logo-icon">
                    <img src="/img/logo.png" alt="CNC CAMPAS" class="logo-img" style="height: 50px; width: auto; object-fit: contain;">
                </div>
            </a>
            
            <nav class="nav" style="display: flex; gap: 2rem;">
                <a href="/" class="nav-link" style="color: #1e293b; font-weight: 500; text-decoration: none; transition: color 0.3s;">Inicio</a>
                <a href="/pages/productos.html" class="nav-link" style="color: #1e293b; font-weight: 500; text-decoration: none; transition: color 0.3s;">Productos</a>
                <a href="/pages/about.html" class="nav-link" style="color: #1e293b; font-weight: 500; text-decoration: none; transition: color 0.3s;">Sobre Nosotros</a>
                <a href="/#contacto" class="nav-link" style="color: #1e293b; font-weight: 500; text-decoration: none; transition: color 0.3s;">Contacto</a>
            </nav>
            
            <div class="header-actions" style="display: flex; gap: 0.75rem; align-items: center;">
                <button class="cart-btn" id="cartBtn" style="position: relative; width: 44px; height: 44px; border-radius: 12px; border: none; background: #f3f4f6; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-shopping-cart" style="color: #3d4d9e;"></i>
                    <span class="cart-badge" id="cartBadge" style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 0.75rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">0</span>
                </button>
                
                <div style="position: relative;">
                    <button class="cart-btn" id="userMenuBtn" onclick="toggleUserMenu()" style="width: 44px; height: 44px; border-radius: 12px; border: none; background: #f3f4f6; cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-user" style="color: #3d4d9e;"></i>
                    </button>
                    
                    <div id="userMenu" style="position: absolute; top: 55px; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); min-width: 200px; display: none; z-index: 1000;">
                        <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                            <div style="font-weight: 600; color: #1e293b;">Mi Cuenta</div>
                            <div style="font-size: 0.875rem; color: #64748b;">Invitado</div>
                        </div>
                        <a href="/pages/mis-pedidos.html" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                            <i class="fas fa-shopping-bag" style="width: 20px; color: #3d4d9e;"></i>
                            <span>Mis Pedidos</span>
                        </a>
                        <a href="/pages/login.html" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #1e293b; text-decoration: none; transition: background 0.3s; border-top: 1px solid #e2e8f0;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                            <i class="fas fa-sign-in-alt" style="width: 20px; color: #3d4d9e;"></i>
                            <span>Ingresar</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <div style="height: 80px;"></div>
    `;
    
    return headerHTML;
}

// Función para toggle del menú de usuario
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    const btn = document.getElementById('userMenuBtn');
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Actualizar badge del carrito
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Inicializar header cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const headerContainer = document.getElementById('header-placeholder');
        if (headerContainer) {
            headerContainer.outerHTML = createHeader();
            updateCartBadge();
        }
    });
} else {
    const headerContainer = document.getElementById('header-placeholder');
    if (headerContainer) {
        headerContainer.outerHTML = createHeader();
        updateCartBadge();
    }
}

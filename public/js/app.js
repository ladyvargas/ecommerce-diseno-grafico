// API Base URL
const API_URL =
  window.location.hostname === 'localhost'
    ? 'https://ecommerce-diseno-grafico-production.up.railway.app/api'
    : 'https://ecommerce-diseno-grafico-production.up.railway.app/api';

// Estado global
let currentUser = null;
let currentToken = null;
let allProducts = [];
let cart = { items: [], total: 0, count: 0 };

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadProducts();
});

function initializeApp() {
    // Cargar usuario desde localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        currentToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
        loadCart();
    }
}

function setupEventListeners() {
    // Navegación
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));
    document.getElementById('cartIcon')?.addEventListener('click', () => openCart());
    document.getElementById('userBtn')?.addEventListener('click', toggleDropdown);
    document.getElementById('logoutLink')?.addEventListener('click', logout);
    document.getElementById('adminPanelLink')?.addEventListener('click', openAdminPanel);
    document.getElementById('myOrdersLink')?.addEventListener('click', showMyOrders);
    
    // Búsqueda
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterProducts(e.target.dataset.category));
    });
    
    // Formularios
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckout);
    document.getElementById('productForm')?.addEventListener('submit', handleProductFormSubmit);
    
    // Modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            closeModal(e.target.dataset.modal);
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    // Switch entre login y registro
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('loginModal');
        openModal('registerModal');
    });
    
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('registerModal');
        openModal('loginModal');
    });
    
    // Admin
    document.getElementById('closeAdminBtn')?.addEventListener('click', closeAdminPanel);
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        openProductForm();
    });
    
    // Checkout
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckout);
}

// Productos
async function loadProducts(category = 'all', search = '') {
    try {
        let url = `${API_URL}/products?`;
        if (category !== 'all') url += `category=${category}&`;
        if (search) url += `search=${search}`;
        
        const response = await fetch(url);
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        showToast('Error al cargar productos', 'error');
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-message">No se encontraron productos</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price}</span>
                    <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function showProductDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const details = document.getElementById('productDetails');
    
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    details.innerHTML = `
        <div class="product-details">
            <div>
                <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            </div>
            <div class="product-detail-info">
                <span class="product-category">${product.category}</span>
                <h2>${product.name}</h2>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span>${product.rating}</span>
                </div>
                <p>${product.description}</p>
                <div class="product-format">
                    <strong>Formato:</strong> ${product.fileFormat}
                </div>
                <div class="product-detail-price">$${product.price}</div>
                <button class="btn-add-cart" style="width: 100%; padding: 1rem;" onclick="addToCart(${product.id}); closeModal('productModal')">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    
    openModal('productModal');
}

function filterProducts(category) {
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadProducts(category);
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    loadProducts('all', searchTerm);
}

// Autenticación
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            updateUIForLoggedInUser();
            closeModal('loginModal');
            showToast('¡Bienvenido de vuelta!', 'success');
            loadCart();
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            updateUIForLoggedInUser();
            closeModal('registerModal');
            showToast('¡Cuenta creada exitosamente!', 'success');
        } else {
            showToast(data.error || 'Error al registrarse', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

function logout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    updateUIForLoggedOutUser();
    showToast('Sesión cerrada', 'info');
}

function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('userMenu').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.role === 'admin') {
        document.getElementById('adminPanelLink').style.display = 'block';
    }
}

function updateUIForLoggedOutUser() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('registerBtn').style.display = 'block';
    document.getElementById('userMenu').style.display = 'none';
}

function toggleDropdown() {
    document.getElementById('dropdownMenu').classList.toggle('show');
}

// Carrito
async function loadCart() {
    if (!currentToken) return;
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartUI();
        }
    } catch (error) {
        console.error('Error al cargar carrito:', error);
    }
}

async function addToCart(productId) {
    if (!currentToken) {
        showToast('Debes iniciar sesión para agregar productos', 'info');
        openModal('loginModal');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartUI();
            showToast('Producto agregado al carrito', 'success');
        } else {
            showToast('Error al agregar producto', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function updateCartQuantity(productId, quantity) {
    try {
        const response = await fetch(`${API_URL}/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartUI();
            renderCartItems();
        }
    } catch (error) {
        showToast('Error al actualizar carrito', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartUI();
            renderCartItems();
            showToast('Producto eliminado del carrito', 'info');
        }
    } catch (error) {
        showToast('Error al eliminar producto', 'error');
    }
}

function updateCartUI() {
    document.getElementById('cartCount').textContent = cart.count || 0;
}

function openCart() {
    if (!currentToken) {
        showToast('Debes iniciar sesión para ver tu carrito', 'info');
        openModal('loginModal');
        return;
    }
    
    renderCartItems();
    openModal('cartModal');
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cart.items || cart.items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = '0.00';
        document.getElementById('checkoutBtn').disabled = true;
        return;
    }
    
    document.getElementById('checkoutBtn').disabled = false;
    
    cartItemsContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-quantity" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                    <i class="fas fa-minus"></i>
                </button>
                <span>${item.quantity}</span>
                <button class="btn-quantity" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    cartTotal.textContent = cart.total;
}

// Checkout
function openCheckout() {
    if (cart.items.length === 0) {
        showToast('Tu carrito está vacío', 'info');
        return;
    }
    
    document.getElementById('checkoutEmail').value = currentUser.email;
    document.getElementById('checkoutTotal').textContent = cart.total;
    closeModal('cartModal');
    openModal('checkoutModal');
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const shippingAddress = {
        name: document.getElementById('checkoutName').value,
        email: document.getElementById('checkoutEmail').value,
        address: document.getElementById('checkoutAddress').value
    };
    
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ shippingAddress, paymentMethod })
        });
        
        if (response.ok) {
            const data = await response.json();
            closeModal('checkoutModal');
            showToast('¡Pedido realizado exitosamente!', 'success');
            
            // Limpiar carrito
            cart = { items: [], total: 0, count: 0 };
            updateCartUI();
            
            // Mostrar confirmación
            setTimeout(() => {
                alert(`¡Gracias por tu compra! Tu pedido #${data.order.id} ha sido procesado.`);
            }, 500);
        } else {
            showToast('Error al procesar el pedido', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// Órdenes
async function showMyOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        }
    } catch (error) {
        showToast('Error al cargar pedidos', 'error');
    }
}

function displayOrders(orders) {
    if (orders.length === 0) {
        alert('No tienes pedidos aún');
        return;
    }
    
    const ordersHTML = orders.map(order => `
        Pedido #${order.id}
        Fecha: ${new Date(order.createdAt).toLocaleDateString()}
        Total: $${order.total}
        Estado: ${order.status}
        ---
    `).join('\n');
    
    alert('Tus pedidos:\n\n' + ordersHTML);
}

// Panel de Administración
function openAdminPanel() {
    if (currentUser.role !== 'admin') {
        showToast('No tienes permisos de administrador', 'error');
        return;
    }
    
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('filtersSection').style.display = 'none';
    document.getElementById('productsSection').style.display = 'none';
    
    loadAdminProducts();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('filtersSection').style.display = 'block';
    document.getElementById('productsSection').style.display = 'block';
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const list = document.getElementById('adminProductsList');
        list.innerHTML = products.map(product => `
            <div class="admin-product-item">
                <img src="${product.image}" alt="${product.name}" class="admin-product-image">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} - $${product.price}</p>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showToast('Error al cargar productos', 'error');
    }
}

function openProductForm(product = null) {
    const modal = document.getElementById('productFormModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');
    
    if (product) {
        title.textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productFormat').value = product.fileFormat;
        document.getElementById('productFeatured').checked = product.featured;
    } else {
        title.textContent = 'Agregar Producto';
        form.reset();
    }
    
    openModal('productFormModal');
}

async function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        openProductForm(product);
    }
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            showToast('Producto eliminado', 'success');
            loadAdminProducts();
            loadProducts();
        } else {
            showToast('Error al eliminar producto', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function handleProductFormSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const imageInput = document.getElementById('productImage').value;

    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        fileFormat: document.getElementById('productFormat').value,
        featured: document.getElementById('productFeatured').checked
    };

    // 👉 SOLO enviar imagen si el usuario puso una nueva
    if (imageInput && imageInput.trim() !== "") {
        productData.image = imageInput.trim();
    }

    try {
        const url = productId
            ? `${API_URL}/products/${productId}`
            : `${API_URL}/products`;

        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            closeModal('productFormModal');
            showToast(productId ? 'Producto actualizado' : 'Producto creado', 'success');
            loadAdminProducts();
            loadProducts();
        } else {
            showToast('Error al guardar producto', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// Utilidades
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div>${message}</div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

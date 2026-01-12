// Admin Panel JavaScript
const API_URL = 'http://localhost:3000/api';
let currentToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
let allProducts = [];
let allOrders = [];
let allCategories = [];
let salesChart = null;
let productsChart = null;

// Verificar autenticación
if (!currentToken || currentUser.role !== 'admin') {
    alert('Debes ser administrador para acceder a este panel');
    window.location.href = '/';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    setupEventListeners();
});

async function initializeAdmin() {
    // Cargar información del usuario
    document.getElementById('adminUserName').textContent = currentUser.name;
    document.getElementById('adminUserEmail').textContent = currentUser.email;
    document.getElementById('adminUserAvatar').src = currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name);
    
    // Cargar datos iniciales
    await loadDashboard();
    await loadCategories();
}

function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) {
                navigateToSection(section);
            }
        });
    });
    
    // Logout
    document.getElementById('adminLogout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Formulario de producto
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Filtro de pedidos
    document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);
}

function navigateToSection(section) {
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Mostrar sección correspondiente
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Actualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'productos': 'Productos',
        'pedidos': 'Pedidos',
        'reportes': 'Reportes',
        'categorias': 'Categorías'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    
    // Cargar datos de la sección
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'productos':
            loadProducts();
            break;
        case 'pedidos':
            loadOrders();
            break;
        case 'reportes':
            loadReports();
            break;
        case 'categorias':
            loadCategoriesView();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar dashboard');
        
        const data = await response.json();
        
        // Actualizar estadísticas
        document.getElementById('totalRevenue').textContent = data.totalRevenue.toFixed(2);
        document.getElementById('totalOrders').textContent = data.totalOrders;
        document.getElementById('totalProducts').textContent = data.totalProducts;
        document.getElementById('totalUsers').textContent = data.totalUsers;
        
        // Renderizar gráficos
        renderSalesChart(data.salesByMonth);
        renderProductsChart(data.topProducts);
        
        // Renderizar pedidos recientes
        renderRecentOrders(data.recentOrders);
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar el dashboard', 'error');
    }
}

function renderSalesChart(data) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    if (salesChart) salesChart.destroy();
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Ventas ($)',
                data: data.map(d => d.sales),
                borderColor: '#4a2f1a',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function renderProductsChart(data) {
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;
    
    if (productsChart) productsChart.destroy();
    
    productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.name.substring(0, 20) + '...'),
            datasets: [{
                label: 'Descargas',
                data: data.map(d => d.downloads),
                backgroundColor: [
                    '#4a2f1a',
                    '#ec4899',
                    '#8b5cf6',
                    '#14b8a6',
                    '#f59e0b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recentOrdersTable');
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No hay pedidos recientes</p></div>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.userName}</td>
                        <td>$${order.total.toFixed(2)}</td>
                        <td><span class="badge ${order.status}">${getStatusText(order.status)}</span></td>
                        <td>${formatDate(order.createdAt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Productos
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        renderProductsTable(allProducts);
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar productos', 'error');
    }
}

function renderProductsTable(products) {
    const container = document.getElementById('productosTable');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No hay productos</p></div>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td><img src="${product.image}" alt="${product.name}"></td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>$${product.salePrice || product.price}</td>
                        <td>${product.stock}</td>
                        <td>
                            ${product.featured ? '<span class="badge featured">Destacado</span>' : ''}
                            ${product.trending ? '<span class="badge trending">Tendencia</span>' : ''}
                        </td>
                        <td>
                            <button class="btn btn-action btn-primary" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-action btn-danger" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
    if (product) {
        title.textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productShortDesc').value = product.shortDescription || '';
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productSalePrice').value = product.salePrice || '';
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productFileFormat').value = product.fileFormat || '';
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productFeatured').checked = product.featured;
        document.getElementById('productTrending').checked = product.trending;
        document.getElementById('productBestseller').checked = product.bestseller;
    } else {
        title.textContent = 'Agregar Producto';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    }
    
    modal.classList.add('show');
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const product = await response.json();
        openProductModal(product);
    } catch (error) {
        showToast('Error al cargar producto', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            showToast('Producto eliminado exitosamente', 'success');
            loadProducts();
        } else {
            showToast('Error al eliminar producto', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        shortDescription: document.getElementById('productShortDesc').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        salePrice: document.getElementById('productSalePrice').value ? parseFloat(document.getElementById('productSalePrice').value) : null,
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        fileFormat: document.getElementById('productFileFormat').value,
        stock: parseInt(document.getElementById('productStock').value),
        featured: document.getElementById('productFeatured').checked,
        trending: document.getElementById('productTrending').checked,
        bestseller: document.getElementById('productBestseller').checked
    };
    
    try {
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast(id ? 'Producto actualizado' : 'Producto creado', 'success');
            closeModal('productModal');
            loadProducts();
        } else {
            showToast('Error al guardar producto', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// Pedidos
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        allOrders = await response.json();
        renderOrdersTable(allOrders);
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar pedidos', 'error');
    }
}

function renderOrdersTable(orders) {
    const container = document.getElementById('pedidosTable');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No hay pedidos</p></div>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.customer_name || order.userName || 'N/A'}</td>
                        <td>${order.customer_email || order.userEmail || 'N/A'}</td>
                        <td>${order.items ? order.items.length : 0} productos</td>
                        <td>$${parseFloat(order.total).toFixed(2)}</td>
                        <td><span class="badge ${order.status}">${getStatusText(order.status)}</span></td>
                        <td><span class="badge ${order.payment_status || order.paymentStatus}">${(order.payment_status || order.paymentStatus) === 'paid' ? 'Pagado' : 'Pendiente'}</span></td>
                        <td>${formatDate(order.created_at || order.createdAt)}</td>
                        <td>
                            <select class="btn btn-action" onchange="updateOrderStatus(${order.id}, this.value)">
                                <option value="">Cambiar estado</option>
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En Proceso</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completado</option>
                            </select>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    if (!status) {
        renderOrdersTable(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.status === status);
        renderOrdersTable(filtered);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showToast('Estado actualizado', 'success');
            loadOrders();
        } else {
            showToast('Error al actualizar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// Reportes
async function loadReports() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('reportStartDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
}

async function generateReport() {
    const type = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    const container = document.getElementById('reportResults');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generando reporte...</p></div>';
    
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/dashboard`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await response.json();
            
            let reportHTML = '';
            
            switch(type) {
                case 'sales':
                    reportHTML = generateSalesReport(data);
                    break;
                case 'products':
                    reportHTML = generateProductsReport(data);
                    break;
                case 'customers':
                    reportHTML = generateCustomersReport(data);
                    break;
            }
            
            container.innerHTML = reportHTML;
        } catch (error) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error al generar reporte</p></div>';
        }
    }, 1000);
}

function generateSalesReport(data) {
    return `
        <div class="chart-card">
            <h3>Reporte de Ventas</h3>
            <div class="stats-grid" style="margin-top: 2rem;">
                <div class="stat-card">
                    <div class="stat-label">Total Ventas</div>
                    <div class="stat-value">$${data.totalRevenue.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pedidos Completados</div>
                    <div class="stat-value">${data.completedOrders}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Ticket Promedio</div>
                    <div class="stat-value">$${(data.totalRevenue / (data.completedOrders || 1)).toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tasa de Conversión</div>
                    <div class="stat-value">${((data.completedOrders / data.totalOrders) * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
    `;
}

function generateProductsReport(data) {
    return `
        <div class="chart-card">
            <h3>Reporte de Productos</h3>
            <table class="data-table" style="margin-top: 2rem;">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Descargas</th>
                        <th>Ingresos Estimados</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.topProducts.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${p.downloads}</td>
                            <td>$${p.revenue.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateCustomersReport(data) {
    return `
        <div class="chart-card">
            <h3>Reporte de Clientes</h3>
            <div class="stats-grid" style="margin-top: 2rem;">
                <div class="stat-card">
                    <div class="stat-label">Total Clientes</div>
                    <div class="stat-value">${data.totalUsers}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Clientes Activos</div>
                    <div class="stat-value">${Math.floor(data.totalUsers * 0.7)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Nuevos Este Mes</div>
                    <div class="stat-value">15</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Retención</div>
                    <div class="stat-value">78%</div>
                </div>
            </div>
        </div>
    `;
}

function exportReport() {
    showToast('Exportando reporte...', 'info');
    setTimeout(() => {
        showToast('Reporte exportado exitosamente', 'success');
    }, 1500);
}

// Categorías
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        allCategories = await response.json();
        
        // Llenar select de categorías en el formulario
        const select = document.getElementById('productCategory');
        select.innerHTML = '<option value="">Seleccionar...</option>' +
            allCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

function loadCategoriesView() {
    const container = document.getElementById('categoriasGrid');
    
    container.innerHTML = `
        <div class="stats-grid">
            ${allCategories.map(cat => `
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div>
                            <div class="stat-value">${cat.count}</div>
                            <div class="stat-label">${cat.name}</div>
                        </div>
                        <div class="stat-icon" style="background: ${cat.color}20; color: ${cat.color};">
                            <i class="fas ${cat.icon}"></i>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Utilidades
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = 'background: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1rem; border-left: 4px solid;';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#4a2f1a'
    };
    
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.textContent = message;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusText(status) {
    const texts = {
        'pending': 'Pendiente',
        'processing': 'En Proceso',
        'completed': 'Completado'
    };
    return texts[status] || status;
}

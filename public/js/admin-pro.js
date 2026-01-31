// ========================================
// ADMIN PRO - JAVASCRIPT COMPLETO
// ========================================

const API_URL =
  "https://ecommerce-diseno-grafico-production.up.railway.app/api";
let currentToken =
  localStorage.getItem("token") ||
  localStorage.getItem("adminToken") ||
  localStorage.getItem("authToken") ||
  null;
let currentUser = JSON.parse(localStorage.getItem("user") || "{}");

// Estado Global
let state = {
  products: [],
  orders: [],
  categories: [],
  stats: {},
  charts: {
    sales: null,
    products: null,
  },
};

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initializeApp();
  setupEventListeners();
});

function checkAuth() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    // No hay token, redirigir al login
    window.location.href = "/login";
    return false;
  }

  if (!user || user.role !== "admin") {
    // No es admin, redirigir al login
    alert("Necesitas permisos de administrador para acceder");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return false;
  }

  return true;
}

async function initializeApp() {
  if (!checkAuth()) return;

  // Cargar datos del usuario
  loadUserInfo();

  // Mostrar mensaje de bienvenida
  console.log("Panel Admin cargado correctamente");

  // Cargar datos iniciales con manejo de errores
  try {
    await Promise.all([loadCategories(), loadProducts(), loadOrders()]);

    // Cargar dashboard después de tener los datos básicos
    await loadDashboardData();
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    alert(
      "Advertencia: Algunos datos no se pudieron cargar. Verifica la conexión con el servidor.",
    );
  }
}

function loadUserInfo() {
  document.getElementById("sidebarUserName").textContent = currentUser.name;
  document.getElementById("sidebarUserEmail").textContent = currentUser.email;
  document.getElementById("sidebarUserAvatar").src =
    currentUser.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}`;
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Navegación
  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      navigateToSection(section);
    });
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Búsqueda global
  document
    .getElementById("globalSearch")
    .addEventListener("input", handleGlobalSearch);

  // Formularios
  document
    .getElementById("productForm")
    .addEventListener("submit", handleProductSubmit);

  // Filtros de productos
  document
    .getElementById("productSearchInput")
    ?.addEventListener("input", filterProducts);
  document
    .getElementById("productCategoryFilter")
    ?.addEventListener("change", filterProducts);
  document
    .getElementById("productStatusFilter")
    ?.addEventListener("change", filterProducts);

  // Filtros de pedidos
  document
    .getElementById("orderSearchInput")
    ?.addEventListener("input", filterOrders);
  document
    .getElementById("orderStatusFilter")
    ?.addEventListener("change", filterOrders);
  document
    .getElementById("orderDateFrom")
    ?.addEventListener("change", filterOrders);
  document
    .getElementById("orderDateTo")
    ?.addEventListener("change", filterOrders);

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("show");
    }
  });
}

// ========================================
// NAVEGACIÓN
// ========================================

function navigateToSection(section) {
  // Actualizar navegación activa
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  document
    .querySelector(`[data-section="${section}"]`)
    ?.classList.add("active");

  // Mostrar sección
  document.querySelectorAll(".content-section").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById(`${section}-section`)?.classList.add("active");

  // Actualizar título
  const titles = {
    dashboard: "Dashboard",
    analytics: "Analytics",
    productos: "Gestión de Productos",
    pedidos: "Gestión de Pedidos",
    categorias: "Categorías",
    clientes: "Clientes",
    reportes: "Reportes",
    ventas: "Análisis de Ventas",
    inventario: "Inventario",
    promociones: "Promociones",
    cupones: "Cupones de Descuento",
    about: "Somos Nosotros",
    newsletter: "Newsletter",
    ajustes: "Ajustes del Sistema",
  };

  document.getElementById("pageTitle").textContent = titles[section] || section;
  document.getElementById("pageBreadcrumb").textContent =
    titles[section] || section;

  // Cargar datos específicos de la sección
  loadSectionData(section);
}

async function loadSectionData(section) {
  switch (section) {
    case "dashboard":
      await loadDashboardData();
      break;
    case "productos":
      await loadProducts();
      break;
    case "pedidos":
      await loadOrders();
      break;
    case "categorias":
      renderCategories();
      break;
    case "about":
      await loadAboutAdmin();
      break;
  }
}

// ========================================
// DASHBOARD
// ========================================

async function loadDashboardData() {
  try {
    console.log("📊 Cargando dashboard...");

    // Cargar datos reales desde las APIs
    await Promise.all([loadProducts(), loadOrders()]);

    // Calcular estadísticas desde los datos cargados
    const orders = state.orders || [];
    const products = state.products || [];

    // Calcular ingresos totales
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Contar pedidos por estado
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed",
    ).length;

    // Productos con stock bajo
    const lowStockProducts = products.filter((p) => {
      const stock = parseInt(p.stock || 0);
      const threshold = parseInt(
        p.lowStockThreshold || p.low_stock_threshold || 10,
      );
      return stock <= threshold && stock > 0;
    }).length;

    // Productos sin stock
    const outOfStockProducts = products.filter(
      (p) => parseInt(p.stock || 0) === 0,
    ).length;

    state.stats = {
      totalRevenue: totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: 15, // Por ahora fijo
      pendingOrders: pendingOrders,
      completedOrders: completedOrders,
      lowStockProducts: lowStockProducts,
      outOfStockProducts: outOfStockProducts,
      recentOrders: orders.slice(-5).reverse(),
    };

    console.log("✅ Dashboard data:", state.stats);

    // Actualizar estadísticas
    updateDashboardStats();

    // Pedidos recientes
    renderRecentOrders();

    // Actualizar badges
    const productCountEl = document.getElementById("productCount");
    const orderCountEl = document.getElementById("orderCount");
    if (productCountEl)
      productCountEl.textContent = state.stats.totalProducts || 0;
    if (orderCountEl) orderCountEl.textContent = state.stats.pendingOrders || 0;
  } catch (error) {
    console.error("❌ Error al cargar dashboard:", error);

    // Mostrar datos por defecto si falla
    state.stats = {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      pendingOrders: 0,
    };

    updateDashboardStats();
  }
}

function updateDashboardStats() {
  document.getElementById("dashRevenue").textContent = parseFloat(
    state.stats.totalRevenue || 0,
  ).toFixed(2);
  document.getElementById("dashOrders").textContent =
    state.stats.totalOrders || 0;
  document.getElementById("dashProducts").textContent =
    state.stats.totalProducts || 0;
  document.getElementById("dashUsers").textContent =
    state.stats.totalUsers || 0;
}

function renderSalesChart() {
  const ctx = document.getElementById("salesChart");
  if (!ctx) return;

  if (state.charts.sales) state.charts.sales.destroy();

  const data = state.stats.salesByMonth || [];

  state.charts.sales = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((d) => d.month),
      datasets: [
        {
          label: "Ventas ($)",
          data: data.map((d) => d.sales),
          borderColor: "#4a2f1a",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: "#4a2f1a",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          callbacks: {
            label: (context) => `Ventas: $${context.parsed.y.toFixed(2)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#e2e8f0" },
          ticks: {
            callback: (value) => "$" + value,
            font: { size: 12 },
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
        },
      },
    },
  });
}

function renderProductsChart() {
  const ctx = document.getElementById("productsChart");
  if (!ctx) return;

  if (state.charts.products) state.charts.products.destroy();

  const data = state.stats.topProducts || [];

  state.charts.products = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((d) => d.name.substring(0, 25) + "..."),
      datasets: [
        {
          label: "Descargas",
          data: data.map((d) => d.downloads),
          backgroundColor: [
            "#4a2f1a",
            "#ec4899",
            "#8b5cf6",
            "#14b8a6",
            "#f59e0b",
          ],
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#e2e8f0" },
          ticks: { font: { size: 12 } },
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });
}

function renderRecentOrders() {
  const container = document.getElementById("recentOrdersContainer");
  if (!container) return;

  const orders = state.stats.recentOrders || [];

  if (orders.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
                <div class="empty-state-title">No hay pedidos recientes</div>
                <div class="empty-state-desc">Los nuevos pedidos aparecerán aquí</div>
            </div>
        `;
    return;
  }

  container.innerHTML = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders
                      .map(
                        (order) => `
                        <tr>
                            <td><strong>#${order.id}</strong></td>
                            <td>${order.userName}</td>
                            <td>${order.userEmail}</td>
                            <td><strong>$${parseFloat(order.total || 0).toFixed(2)}</strong></td>
                            <td>${renderStatusBadge(order.status)}</td>
                            <td>${formatDate(order.created_at || order.createdAt)}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="viewOrderDetail(${order.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `;
}

// ========================================
// PRODUCTOS
// ========================================

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    state.products = await response.json();
    renderProductsTable(state.products);

    document.getElementById("productsTotal").textContent =
      state.products.length;
  } catch (error) {
    console.error("Error:", error);
    showToast("Error al cargar productos", "error", "Error");
  }
}

function renderProductsTable(products) {
  const container = document.getElementById("productsTableContainer");
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-box-open"></i></div>
                <div class="empty-state-title">No hay productos</div>
                <div class="empty-state-desc">Comienza agregando tu primer producto</div>
                <button class="btn btn-primary" onclick="openProductModal()">
                    <i class="fas fa-plus"></i> Agregar Producto
                </button>
            </div>
        `;
    return;
  }

  container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Ventas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${products
                  .map(
                    (product) => `
                    <tr>
                        <td><img src="${product.image}" alt="${product.name}"></td>
                        <td>
                            <strong>${product.name}</strong><br>
                            <small style="color: var(--gray);">${product.shortDescription || ""}</small>
                        </td>
                        <td>
                            <span class="badge info">${product.category}</span>
                        </td>
                        <td>
                            ${
                              product.salePrice
                                ? `
                                <strong style="color: var(--success);">$${product.salePrice}</strong><br>
                                <small style="text-decoration: line-through; color: var(--gray);">$${product.price}</small>
                            `
                                : `<strong>$${product.price}</strong>`
                            }
                        </td>
                        <td>
                            ${
                              product.stock === 0
                                ? '<span class="badge" style="background: #ef4444; color: white;">❌ Sin stock</span>'
                                : product.stock <=
                                    (product.lowStockThreshold || 10)
                                  ? `<span class="badge" style="background: #f59e0b; color: white;">⚠️ ${product.stock}</span>`
                                  : `<span class="badge success">✅ ${product.stock}</span>`
                            }
                        </td>
                        <td>${product.downloads || 0}</td>
                        <td>
                            ${
                              product.active === false
                                ? '<span class="badge" style="background: #6b7280; color: white;">🔒 Inactivo</span>'
                                : '<span class="badge success">✅ Activo</span>'
                            }
                            ${product.featured ? '<span class="badge primary">⭐ Destacado</span>' : ""}
                        </td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}

function filterProducts() {
  const searchTerm =
    document.getElementById("productSearchInput")?.value.toLowerCase() || "";
  const category =
    document.getElementById("productCategoryFilter")?.value || "";
  const status = document.getElementById("productStatusFilter")?.value || "";

  let filtered = state.products.filter((product) => {
    const matchSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    const matchCategory = !category || product.category === category;

    let matchStatus = true;
    if (status === "featured") matchStatus = product.featured;
    else if (status === "trending") matchStatus = product.trending;
    else if (status === "bestseller") matchStatus = product.bestseller;

    return matchSearch && matchCategory && matchStatus;
  });

  renderProductsTable(filtered);
  document.getElementById("productsTotal").textContent = filtered.length;
}

function openProductModal(product = null) {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  const form = document.getElementById("productForm");

  function setValue(id, value = "") {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function setChecked(id, value = false) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
  }

  if (product) {
    title.textContent = "Editar Producto";

    setValue("productId", product.id);
    setValue("productName", product.name);
    setValue("productDescription", product.description);
    setValue("productPrice", product.price);
    setValue("productSalePrice", product.salePrice ?? "");
    setValue("productCategory", product.category);
    setValue("productStock", product.stock ?? 0);
    setValue("productLowStockThreshold", product.lowStockThreshold ?? 10);
    setValue("productShortDesc", product.shortDescription ?? "");
    setValue("productFileFormat", product.fileFormat ?? "");
    setValue("productFileSize", product.fileSize ?? "");
    setValue("productImage", product.image ?? "");

    setChecked("productActive", product.active !== false);
    setChecked("productFeatured", product.featured);
    setChecked("productTrending", product.trending);
    setChecked("productBestseller", product.bestseller);
  } else {
    title.textContent = "Agregar Nuevo Producto";
    if (form) form.reset();

    setValue("productId", "");
    setValue("productStock", 100);
    setValue("productLowStockThreshold", 10);
    setChecked("productActive", true);
  }

  modal.classList.add("show");
}

async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error("Producto no encontrado");
    }

    const product = await response.json();

    const normalizedProduct = {
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: product.price ? parseFloat(product.price) : 0,
      salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
      category: product.category || "",
      image: product.image || "",
      fileFormat: product.file_format || "",
      stock: product.stock ?? 0,
      active: product.active === 1,
      featured: product.featured === 1,
      trending: product.trending === 1,
    };

    openProductModal(normalizedProduct);
  } catch (error) {
    console.error("❌ Error editProduct:", error);
    showToast("Error al cargar el producto", "error", "Error");
  }
}

async function deleteProduct(id) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (response.ok) {
      showToast("Producto eliminado exitosamente", "success", "Éxito");
      await loadProducts();
      await loadDashboardData();
    } else {
      throw new Error("Error al eliminar");
    }
  } catch (error) {
    showToast("Error al eliminar el producto", "error", "Error");
  }
}

function validateProductImage() {
  const imageFile = document.getElementById("productImageFile")?.files[0];
  const imageUrl = document.getElementById("productImage").value.trim();
  console.log("Validando imagen:", { imageFile, imageUrl });
  if (imageFile) return true;
  if (imageUrl && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(imageUrl)) {
    return true;
  }
  return false;
}

function getValue(id, defaultValue = "") {
  const el = document.getElementById(id);
  return el ? el.value : defaultValue;
}

function getChecked(id, defaultValue = false) {
  const el = document.getElementById(id);
  return el ? el.checked : defaultValue;
}

async function handleProductSubmit(e) {
  e.preventDefault();

  const id = getValue("productId");
  const imageFile = document.getElementById("productImageFile")?.files[0];
  const imageUrlInput = getValue("productImage").trim();

  // ✅ Validación imagen SOLO si es producto nuevo
  if (!id && !imageFile && !imageUrlInput) {
    showToast(
      "Debes subir una imagen o ingresar una URL válida",
      "warning",
      "Imagen requerida",
    );
    return;
  }

  let imageUrl = imageUrlInput;

  // 📤 Subir imagen si hay archivo
  if (imageFile) {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", imageFile);

      const uploadResponse = await fetch(`${API_URL}/upload/product`, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      imageUrl = uploadData.imageUrl;

      showToast("Imagen subida exitosamente", "success", "Éxito");
    } catch (error) {
      showToast(
        "Error al subir la imagen. Se usará la imagen existente.",
        "warning",
        "Advertencia",
      );
    }
  }

  // ✅ FORM DATA SEGURO
  const formData = {
    name: getValue("productName"),
    category: getValue("productCategory"),
    price: parseFloat(getValue("productPrice", 0)),
    salePrice: getValue("productSalePrice")
      ? parseFloat(getValue("productSalePrice"))
      : null,
    stock: parseInt(getValue("productStock", 0)),
    lowStockThreshold: parseInt(getValue("productLowStockThreshold", 10)),
    active: getChecked("productActive"),
    shortDescription: getValue("productShortDesc"),
    description: getValue("productDescription"),
    image: imageUrl,
    fileFormat: getValue("productFileFormat"),
    fileSize: getValue("productFileSize"),
    featured: getChecked("productFeatured"),
    trending: getChecked("productTrending"),
    bestseller: getChecked("productBestseller"),
  };

  try {
    const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Save failed");
    }

    showToast(
      id ? "Producto actualizado exitosamente" : "Producto creado exitosamente",
      "success",
      "Éxito",
    );

    closeModal("productModal");
    await loadProducts();
    await loadDashboardData();
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    showToast("Error al guardar el producto", "error", "Error");
  }
}

// ========================================
// PEDIDOS
// ========================================

async function loadOrders() {
  try {
    // Intentar primero con autenticación
    let response = await fetch(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
      },
    });

    // Si falla, intentar ruta alternativa sin auth
    if (!response.ok) {
      console.log("Intentando ruta alternativa...");
      response = await fetch(`${API_URL}/orders/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!response.ok) {
      console.error(
        "Error en respuesta:",
        response.status,
        response.statusText,
      );
      state.orders = [];
      renderOrdersTable([]);
      const totalEl = document.getElementById("ordersTotal");
      if (totalEl) totalEl.textContent = "0";
      showToast("No se pudieron cargar los pedidos", "warning", "Advertencia");
      return;
    }

    state.orders = await response.json();
    console.log("✅ Pedidos cargados:", state.orders.length);
    renderOrdersTable(state.orders);

    const totalEl = document.getElementById("ordersTotal");
    if (totalEl) totalEl.textContent = state.orders.length;
  } catch (error) {
    console.error("❌ Error al cargar pedidos:", error);
    state.orders = [];
    renderOrdersTable([]);
    const totalEl = document.getElementById("ordersTotal");
    if (totalEl) totalEl.textContent = "0";
    showToast("Error de conexión al cargar pedidos", "error", "Error");
  }
}

function renderOrdersTable(orders) {
  const container = document.getElementById("ordersTableContainer");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-shopping-cart"></i></div>
                <div class="empty-state-title">No hay pedidos</div>
                <div class="empty-state-desc">Los pedidos de los clientes aparecerán aquí</div>
            </div>
        `;
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
                    <th>Estado Pedido</th>
                    <th>Estado Pago</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${orders
                  .map(
                    (order) => `
                    <tr>
                        <td><strong>#${order.id}</strong></td>
                        <td>${order.customer_name || order.userName || "N/A"}</td>
                        <td><small>${order.customer_email || order.userEmail || "N/A"}</small></td>
                        <td>${order.items ? order.items.length : 0} productos</td>
                        <td><strong>$${parseFloat(order.total || 0).toFixed(2)}</strong></td>
                        <td>
                            <select class="badge ${order.status}" onchange="updateOrderStatus(${order.id}, this.value)" style="border: none; background: transparent; cursor: pointer; font-weight: 600;">
                                <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pendiente</option>
                                <option value="processing" ${order.status === "processing" ? "selected" : ""}>En Proceso</option>
                                <option value="completed" ${order.status === "completed" ? "selected" : ""}>Completado</option>
                            </select>
                        </td>
                        <td>${renderPaymentBadge(order.payment_status || order.paymentStatus)}</td>
                        <td>${formatDate(order.created_at || order.createdAt)}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="viewOrderDetail(${order.id})" title="Ver Detalle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}

function filterOrders() {
  const searchTerm =
    document.getElementById("orderSearchInput")?.value.toLowerCase() || "";
  const status = document.getElementById("orderStatusFilter")?.value || "";
  const dateFrom = document.getElementById("orderDateFrom")?.value || "";
  const dateTo = document.getElementById("orderDateTo")?.value || "";

  let filtered = state.orders.filter((order) => {
    const matchSearch =
      !searchTerm ||
      order.id.toString().includes(searchTerm) ||
      order.userName.toLowerCase().includes(searchTerm) ||
      order.userEmail.toLowerCase().includes(searchTerm);

    const matchStatus = !status || order.status === status;

    const orderDate = new Date(order.created_at || order.createdAt);
    const matchDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
    const matchDateTo = !dateTo || orderDate <= new Date(dateTo);

    return matchSearch && matchStatus && matchDateFrom && matchDateTo;
  });

  renderOrdersTable(filtered);
  document.getElementById("ordersTotal").textContent = filtered.length;
}

async function updateOrderStatus(orderId, newStatus) {
  if (!newStatus) return;

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      showToast("Estado del pedido actualizado", "success", "Éxito");
      await loadOrders();
      await loadDashboardData();
    } else {
      throw new Error("Error al actualizar");
    }
  } catch (error) {
    showToast("Error al actualizar el estado", "error", "Error");
  }
}

function viewOrderDetail(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;

  const detailHTML = `
        <div class="modal" id="orderDetailModal" style="display: flex;">
            <div class="modal-dialog" style="max-width: 800px;">
                <div class="modal-header">
                    <h2 class="modal-title">Pedido #${order.id}</h2>
                    <button class="modal-close" onclick="closeModal('orderDetailModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                        <div>
                            <h4 style="margin-bottom: 1rem; color: #4a2f1a;">👤 Información del Cliente</h4>
                            <p><strong>Nombre:</strong> ${order.customer_name || order.customerName || order.userName || "N/A"}</p>
                            <p><strong>Email:</strong> ${order.customer_email || order.customerEmail || order.userEmail || "N/A"}</p>
                            <p><strong>Teléfono:</strong> ${order.customer_phone || order.customerPhone || "N/A"}</p>
                            ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ""}
                        </div>
                        <div>
                            <h4 style="margin-bottom: 1rem; color: #4a2f1a;">📦 Estado del Pedido</h4>
                            <p><strong>Estado:</strong> ${renderStatusBadge(order.status)}</p>
                            <p><strong>Pago:</strong> ${renderPaymentBadge(order.payment_status || order.paymentStatus)}</p>
                            <p><strong>Método:</strong> ${getPaymentMethodName(order.payment_method || order.paymentMethod)}</p>
                            <p><strong>Fecha:</strong> ${formatDate(order.created_at || order.createdAt)}</p>
                            
                            <div style="margin-top: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Cambiar Estado del Pedido:</label>
                                <select id="orderStatusSelect" style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid #d1d5db; margin-bottom: 0.5rem;">
                                    <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pendiente</option>
                                    <option value="processing" ${order.status === "processing" ? "selected" : ""}>Procesando</option>
                                    <option value="completed" ${order.status === "completed" ? "selected" : ""}>Completado</option>
                                    <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelado</option>
                                </select>
                                <button onclick="updateOrderStatus(${order.id})" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">
                                    <i class="fas fa-save"></i> Actualizar Estado
                                </button>
                                
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Cambiar Estado de Pago:</label>
                                <select id="paymentStatusSelect" style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid #d1d5db; margin-bottom: 0.5rem;">
                                    <option value="pending" ${(order.payment_status || order.paymentStatus) === "pending" ? "selected" : ""}>Pendiente</option>
                                    <option value="paid" ${(order.payment_status || order.paymentStatus) === "paid" ? "selected" : ""}>Pagado</option>
                                    <option value="rejected" ${(order.payment_status || order.paymentStatus) === "rejected" ? "selected" : ""}>Rechazado</option>
                                    <option value="refunded" ${(order.payment_status || order.paymentStatus) === "refunded" ? "selected" : ""}>Reembolsado</option>
                                </select>
                                <button onclick="updatePaymentStatus(${order.id})" class="btn btn-success" style="width: 100%; background: #10b981;">
                                    <i class="fas fa-dollar-sign"></i> Actualizar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom: 1rem; color: #4a2f1a;">🛍️ Productos</h4>
                    <table class="data-table" style="margin-bottom: 2rem;">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items
                              .map(
                                (item) => `
                                <tr>
                                    <td>
                                        <strong>${item.productName || item.name}</strong>
                                    </td>
                                    <td>${item.quantity}</td>
                                    <td>$${parseFloat(item.salePrice || item.price || 0).toFixed(2)}</td>
                                    <td><strong>$${(parseFloat(item.salePrice || item.price || 0) * item.quantity).toFixed(2)}</strong></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                    
                    <div style="background: linear-gradient(135deg, #f9fafb, #e5e7eb); padding: 1.5rem; border-radius: 12px; border-left: 4px solid #4a2f1a;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Subtotal:</span>
                            <strong>$${parseFloat(order.subtotal || 0).toFixed(2)}</strong>
                        </div>
                        ${
                          order.discount
                            ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #10b981;">
                            <span><i class="fas fa-tag"></i> Descuento ${order.couponCode ? `(${order.couponCode})` : ""}:</span>
                            <strong>-$${parseFloat(order.discount || 0).toFixed(2)}</strong>
                        </div>
                        `
                            : ""
                        }
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>IVA (12%):</span>
                            <strong>$${parseFloat(order.tax || 0).toFixed(2)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 2px solid #4a2f1a; margin-top: 1rem;">
                            <span style="font-size: 1.25rem; font-weight: 600;">Total:</span>
                            <strong style="font-size: 1.5rem; color: #4a2f1a;">$${parseFloat(order.total || 0).toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="closeModal('orderDetailModal')">Cerrar</button>
                    ${
                      order.status !== "cancelled"
                        ? `
                    <button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                        <i class="fas fa-ban"></i> Cancelar Pedido
                    </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", detailHTML);
}

async function updateOrderStatus(orderId) {
  const newStatus = document.getElementById("orderStatusSelect").value;
  const order = state.orders.find((o) => o.id === orderId);

  if (order.status === newStatus) {
    showToast("El pedido ya tiene ese estado", "warning", "Aviso");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      const data = await response.json();
      showToast(
        `Estado actualizado a "${newStatus}"` +
          (data.stockRestored ? " (Stock restaurado)" : ""),
        "success",
        "Éxito",
      );
      closeModal("orderDetailModal");
      loadOrders();
    } else {
      throw new Error("Error al actualizar");
    }
  } catch (error) {
    showToast("Error al actualizar estado", "error", "Error");
  }
}

async function updatePaymentStatus(orderId) {
  const newPaymentStatus = document.getElementById("paymentStatusSelect").value;
  const order = state.orders.find((o) => o.id === orderId);
  const currentStatus = order.payment_status || order.paymentStatus;

  if (currentStatus === newPaymentStatus) {
    showToast("El pedido ya tiene ese estado de pago", "warning", "Aviso");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/orders/${orderId}/payment-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      },
    );

    if (response.ok) {
      const statusText = {
        pending: "Pendiente",
        paid: "Pagado",
        rejected: "Rechazado",
        refunded: "Reembolsado",
      };
      showToast(
        `Estado de pago actualizado a "${statusText[newPaymentStatus]}"`,
        "success",
        "Éxito",
      );
      closeModal("orderDetailModal");
      loadOrders();
    } else {
      const errorData = await response.json();
      console.error("Error al actualizar:", errorData);
      throw new Error(errorData.error || "Error al actualizar");
    }
  } catch (error) {
    console.error("Error completo:", error);
    showToast(`Error: ${error.message}`, "error", "Error");
  }
}

async function cancelOrder(orderId) {
  if (
    !confirm("¿Estás seguro de cancelar este pedido? Se restaurará el stock.")
  )
    return;

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    if (response.ok) {
      showToast("Pedido cancelado y stock restaurado", "success", "Éxito");
      closeModal("orderDetailModal");
      loadOrders();
    }
  } catch (error) {
    showToast("Error al cancelar pedido", "error", "Error");
  }
}

// ========================================
// CATEGORÍAS
// ========================================

async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    state.categories = await response.json();

    // Llenar select de categorías
    const select = document.getElementById("productCategory");
    if (select) {
      select.innerHTML =
        '<option value="">Seleccionar categoría...</option>' +
        state.categories
          .map((cat) => `<option value="${cat.name}">${cat.name}</option>`)
          .join("");
    }

    const filterSelect = document.getElementById("productCategoryFilter");
    if (filterSelect) {
      filterSelect.innerHTML =
        '<option value="">Todas las categorías</option>' +
        state.categories
          .map((cat) => `<option value="${cat.name}">${cat.name}</option>`)
          .join("");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderCategories() {
  const container = document.getElementById("categoriasContainer");
  if (!container) return;

  container.innerHTML = `
        <div class="stats-grid">
            ${state.categories
              .map(
                (cat) => `
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
                    <div class="stat-footer">
                        <button class="btn btn-outline btn-sm" onclick="filterByCategory('${cat.name}')">
                            Ver Productos
                        </button>
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
}

function filterByCategory(category) {
  navigateToSection("productos");
  document.getElementById("productCategoryFilter").value = category;
  filterProducts();
}

// ========================================
// BÚSQUEDA GLOBAL
// ========================================

function handleGlobalSearch(e) {
  const term = e.target.value.toLowerCase();
  if (term.length < 2) return;

  // Buscar en productos
  const foundProducts = state.products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term),
  );

  // Buscar en pedidos
  const foundOrders = state.orders.filter(
    (o) =>
      o.id.toString().includes(term) ||
      o.userName.toLowerCase().includes(term) ||
      o.userEmail.toLowerCase().includes(term),
  );

  if (foundProducts.length > 0) {
    showToast(
      `${foundProducts.length} productos encontrados`,
      "info",
      "Búsqueda",
    );
  }
}

// ========================================
// UTILIDADES
// ========================================

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    // Si es el modal de detalle de orden, eliminarlo del DOM
    if (modalId === "orderDetailModal") {
      setTimeout(() => modal.remove(), 300);
    }
  }
}

function logout() {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }
}

function showToast(message, type = "info", title = "") {
  const container = document.getElementById("toastContainer");

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ""}
            <div class="toast-message">${message}</div>
        </div>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderStatusBadge(status) {
  const badges = {
    pending: '<span class="badge warning">⏳ Pendiente</span>',
    processing: '<span class="badge primary">🔄 En Proceso</span>',
    completed: '<span class="badge success">✅ Completado</span>',
  };
  return badges[status] || status;
}

function renderPaymentBadge(status) {
  const badges = {
    paid: '<span class="badge success">✅ Pagado</span>',
    pending: '<span class="badge warning">⏳ Pendiente</span>',
    rejected: '<span class="badge danger">❌ Rechazado</span>',
    refunded: '<span class="badge info">💰 Reembolsado</span>',
  };
  return badges[status] || '<span class="badge">❓ ' + status + "</span>";
}

function getPaymentMethodName(method) {
  const methods = {
    credit_card: "💳 Tarjeta",
    paypal: "🅿️ PayPal",
    transfer: "🏦 Transferencia",
  };
  return methods[method] || method;
}

// ========================================
// EXPORTS (para usar desde HTML)
// ========================================
window.navigateToSection = navigateToSection;
window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetail = viewOrderDetail;
window.filterByCategory = filterByCategory;
window.closeModal = closeModal;

console.log("✅ Admin Pro Panel cargado correctamente");

// ========================================
// SECCIONES ADICIONALES
// ========================================

// Analytics Section
function loadAnalytics() {
  const container = document.getElementById("analytics-section");
  if (!container) return;

  container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Analytics y Métricas</h3>
            </div>
            <div style="padding: 3rem; text-align: center;">
                <div style="font-size: 4rem; color: var(--brown-dark); margin-bottom: 1rem;">
                    📊
                </div>
                <h3 style="margin-bottom: 1rem; color: var(--gray-900);">Analytics Avanzado</h3>
                <p style="color: var(--gray-600); max-width: 500px; margin: 0 auto 2rem;">
                    Panel de analytics con gráficos detallados de comportamiento de usuarios, 
                    conversión y tendencias de ventas.
                </p>
                <div class="stats-grid" style="margin-top: 3rem;">
                    <div class="stat-card">
                        <div class="stat-icon revenue"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-value">${state.stats.totalRevenue || 0}</div>
                        <div class="stat-label">Ingresos Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orders"><i class="fas fa-users"></i></div>
                        <div class="stat-value">${state.stats.totalUsers || 0}</div>
                        <div class="stat-label">Usuarios Activos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon products"><i class="fas fa-eye"></i></div>
                        <div class="stat-value">${(state.stats.totalOrders || 0) * 15}</div>
                        <div class="stat-label">Visitas Totales</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Clientes Section
function loadClientes() {
  const container = document.getElementById("clientes-section");
  if (!container) return;

  const customers = global.db?.users?.filter((u) => u.role !== "admin") || [];

  container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Gestión de Clientes (${customers.length})</h3>
                <button class="btn btn-primary btn-sm">
                    <i class="fas fa-user-plus"></i> Agregar Cliente
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Pedidos</th>
                            <th>Total Gastado</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          customers.length > 0
                            ? customers
                                .map((customer) => {
                                  const customerOrders = state.orders.filter(
                                    (o) => o.userId === customer.id,
                                  );
                                  const totalSpent = customerOrders.reduce(
                                    (sum, o) => sum + o.total,
                                    0,
                                  );

                                  return `
                                <tr>
                                    <td><strong>#${customer.id}</strong></td>
                                    <td>${customer.name}</td>
                                    <td>${customer.email}</td>
                                    <td>${customerOrders.length}</td>
                                    <td><strong>$${parseFloat(totalSpent || 0).toFixed(2)}</strong></td>
                                    <td>${formatDate(customer.createdAt || new Date().toISOString())}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" title="Ver Detalles">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                                })
                                .join("")
                            : `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 3rem;">
                                    No hay clientes registrados
                                </td>
                            </tr>
                        `
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Reportes Section
function loadReportes() {
  const container = document.getElementById("reportes-section");
  if (!container) return;

  container.innerHTML = `
        <div class="filters-bar">
            <div class="filter-group">
                <label>Tipo de Reporte</label>
                <select id="reportType">
                    <option value="sales">Ventas</option>
                    <option value="products">Productos</option>
                    <option value="customers">Clientes</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Fecha Inicio</label>
                <input type="date" id="reportDateStart">
            </div>
            <div class="filter-group">
                <label>Fecha Fin</label>
                <input type="date" id="reportDateEnd">
            </div>
            <div class="filter-group" style="display: flex; align-items: flex-end;">
                <button class="btn btn-primary" onclick="generateReport()">
                    <i class="fas fa-file-chart"></i> Generar Reporte
                </button>
            </div>
        </div>
        
        <div class="card" id="reportResult">
            <div class="card-header">
                <h3 class="card-title">Resultado del Reporte</h3>
                <button class="btn btn-success btn-sm">
                    <i class="fas fa-download"></i> Exportar PDF
                </button>
            </div>
            <div style="padding: 3rem; text-align: center; color: var(--gray-500);">
                <i class="fas fa-chart-bar" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <p>Selecciona los parámetros y genera un reporte</p>
            </div>
        </div>
    `;
}

function generateReport() {
  const type = document.getElementById("reportType").value;
  const container = document.getElementById("reportResult");

  let reportHTML = "";

  if (type === "sales") {
    const totalSales = state.stats.totalRevenue || 0;
    const completedOrders = state.orders.filter(
      (o) => o.status === "completed",
    ).length;

    reportHTML = `
            <div class="card-header">
                <h3 class="card-title">Reporte de Ventas</h3>
                <button class="btn btn-success btn-sm">
                    <i class="fas fa-download"></i> Exportar PDF
                </button>
            </div>
            <div style="padding: 2rem;">
                <div class="stats-grid">
                    <div class="stat-card revenue">
                        <div class="stat-icon revenue"><i class="fas fa-dollar-sign"></i></div>
                        <div class="stat-value">$${parseFloat(totalSales || 0).toFixed(2)}</div>
                        <div class="stat-label">Ventas Totales</div>
                    </div>
                    <div class="stat-card orders">
                        <div class="stat-icon orders"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-value">${completedOrders}</div>
                        <div class="stat-label">Pedidos Completados</div>
                    </div>
                    <div class="stat-card products">
                        <div class="stat-icon products"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-value">$${completedOrders > 0 ? (totalSales / completedOrders).toFixed(2) : "0.00"}</div>
                        <div class="stat-label">Ticket Promedio</div>
                    </div>
                </div>
            </div>
        `;
  } else if (type === "products") {
    reportHTML = `
            <div class="card-header">
                <h3 class="card-title">Reporte de Productos</h3>
                <button class="btn btn-success btn-sm">
                    <i class="fas fa-download"></i> Exportar Excel
                </button>
            </div>
            <div style="padding: 2rem;">
                <div class="stats-grid">
                    <div class="stat-card products">
                        <div class="stat-icon products"><i class="fas fa-box"></i></div>
                        <div class="stat-value">${state.products.length}</div>
                        <div class="stat-label">Productos Totales</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon" style="background: #d1fae5; color: var(--success);">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-value">${state.products.filter((p) => p.featured).length}</div>
                        <div class="stat-label">Destacados</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon" style="background: #fef3c7; color: var(--warning);">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="stat-value">${state.products.filter((p) => p.trending).length}</div>
                        <div class="stat-label">En Tendencia</div>
                    </div>
                </div>
            </div>
        `;
  } else {
    const customers = global.db?.users?.filter((u) => u.role !== "admin") || [];
    reportHTML = `
            <div class="card-header">
                <h3 class="card-title">Reporte de Clientes</h3>
                <button class="btn btn-success btn-sm">
                    <i class="fas fa-download"></i> Exportar CSV
                </button>
            </div>
            <div style="padding: 2rem;">
                <div class="stats-grid">
                    <div class="stat-card users">
                        <div class="stat-icon users"><i class="fas fa-users"></i></div>
                        <div class="stat-value">${customers.length}</div>
                        <div class="stat-label">Clientes Totales</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon" style="background: #d1fae5; color: var(--success);">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-value">${customers.length}</div>
                        <div class="stat-label">Clientes Activos</div>
                    </div>
                    <div class="stat-card primary">
                        <div class="stat-icon" style="background: #000000; color: var(--brown-dark);">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="stat-value">+${Math.floor(customers.length * 0.2)}</div>
                        <div class="stat-label">Nuevos este Mes</div>
                    </div>
                </div>
            </div>
        `;
  }

  container.innerHTML = reportHTML;
}

// Actualizar loadSectionData para incluir las nuevas secciones
const originalLoadSectionData = loadSectionData;
loadSectionData = function (section) {
  switch (section) {
    case "analytics":
      loadAnalytics();
      break;
    case "clientes":
      loadClientes();
      break;
    case "reportes":
      loadReportes();
      break;
    case "ventas":
      loadVentas();
      break;
    case "inventario":
      loadInventario();
      break;
    case "cupones":
      loadCoupons();
      break;
    case "promociones":
      loadPromotions();
      break;
    case "newsletter":
    case "ajustes":
      loadAjustesCompleto();
      break;
    default:
      if (originalLoadSectionData) {
        originalLoadSectionData(section);
      }
  }
};

console.log("✅ Secciones adicionales cargadas");

// ========================================
// LOGOUT FUNCTION
// ========================================

function logout() {
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

// Agregar listener al botón de cerrar sesión
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(
    '.nav-item[onclick*="cerrar-sesion"]',
  );
  if (logoutBtn) {
    logoutBtn.onclick = function (e) {
      e.preventDefault();
      logout();
    };
  }
});

console.log("✅ Sistema de logout cargado");

// ========================================
// FUNCIONES PARA UPLOAD DE IMÁGENES
// ========================================

function previewProductImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      document.getElementById("imagePreview").src = e.target.result;
      document.getElementById("imagePreviewContainer").style.display = "block";
      // Limpiar el campo de URL si hay un archivo
      document.getElementById("productImage").value = "";
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function clearImagePreview() {
  document.getElementById("productImageFile").value = "";
  document.getElementById("imagePreview").src = "";
  document.getElementById("imagePreviewContainer").style.display = "none";
}

// ========================================
// GESTIÓN DE CUPONES
// ========================================

let coupons = [];

async function loadCoupons() {
  const container = document.getElementById("cupones-section");
  if (!container) {
    console.error("❌ Elemento cupones-section no encontrado");
    return;
  }

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-ticket"></i> Gestión de Cupones</h2>
            <button class="btn btn-primary" onclick="openCouponModal()">
                <i class="fas fa-plus"></i> Nuevo Cupón
            </button>
        </div>
        <div id="couponsTableContainer"></div>
    `;

  try {
    console.log("📋 Cargando cupones...");
    const response = await fetch(`${API_URL}/coupons`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    coupons = await response.json();
    console.log("✅ Cupones cargados:", coupons.length);
    renderCouponsTable(coupons);
  } catch (error) {
    console.error("❌ Error al cargar cupones:", error);
    showToast("Error al cargar cupones", "error", "Error");
    const tableContainer = document.getElementById("couponsTableContainer");
    if (tableContainer) {
      tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
                    <p>Error al cargar cupones</p>
                    <button class="btn btn-primary" onclick="loadCoupons()">Reintentar</button>
                </div>
            `;
    }
  }
}

function renderCouponsTable(coupons) {
  const container = document.getElementById("couponsTableContainer");

  if (coupons.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket" style="font-size: 3rem; color: #ccc;"></i>
                <p>No hay cupones creados</p>
                <button class="btn btn-primary" onclick="openCouponModal()">Crear Primer Cupón</button>
            </div>
        `;
    return;
  }

  container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Uso</th>
                    <th>Expira</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${coupons
                  .map((coupon) => {
                    const expiresAt = coupon.expires_at || coupon.expiresAt;
                    const usedCount = parseInt(
                      coupon.used_count || coupon.usedCount || 0,
                    );
                    const maxUses = parseInt(
                      coupon.max_uses || coupon.usageLimit || 0,
                    );
                    const discountType = coupon.discount_type || coupon.type;
                    const discountValue = coupon.discount_value || coupon.value;
                    const minPurchase =
                      coupon.min_purchase || coupon.minPurchase;

                    const isExpired =
                      expiresAt && new Date(expiresAt) < new Date();
                    const isExhausted = maxUses && usedCount >= maxUses;
                    const usagePercent = maxUses
                      ? ((usedCount / maxUses) * 100).toFixed(0)
                      : 0;

                    return `
                    <tr>
                        <td><strong>${coupon.code}</strong></td>
                        <td>${coupon.description || ""}</td>
                        <td>
                            ${
                              discountType === "percentage"
                                ? '<span class="badge info">Porcentaje</span>'
                                : '<span class="badge primary">Fijo</span>'
                            }
                        </td>
                        <td>
                            <strong>${discountType === "percentage" ? discountValue + "%" : "$" + parseFloat(discountValue).toFixed(2)}</strong>
                            ${minPurchase ? `<br><small>Mín: $${parseFloat(minPurchase).toFixed(2)}</small>` : ""}
                        </td>
                        <td>
                            <div style="font-size: 0.875rem;">
                                ${usedCount} / ${maxUses || "∞"}
                                ${
                                  maxUses
                                    ? `
                                <div style="background: #e5e7eb; border-radius: 4px; height: 4px; margin-top: 4px;">
                                    <div style="background: ${usagePercent >= 90 ? "#ef4444" : "#10b981"}; width: ${usagePercent}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                                `
                                    : ""
                                }
                            </div>
                        </td>
                        <td>
                            ${expiresAt ? `<small>${new Date(expiresAt).toLocaleDateString()}</small>` : "<small>Sin expiración</small>"}
                            ${isExpired ? '<br><span class="badge" style="background: #ef4444;">Expirado</span>' : ""}
                        </td>
                        <td>
                            ${
                              !coupon.active
                                ? '<span class="badge" style="background: #6b7280;">Inactivo</span>'
                                : isExpired
                                  ? '<span class="badge" style="background: #ef4444;">Expirado</span>'
                                  : isExhausted
                                    ? '<span class="badge" style="background: #f59e0b;">Agotado</span>'
                                    : '<span class="badge success">Activo</span>'
                            }
                        </td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editCoupon(${coupon.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn ${coupon.active ? "btn-warning" : "btn-success"} btn-sm" 
                                    onclick="toggleCouponStatus(${coupon.id})" 
                                    title="${coupon.active ? "Desactivar" : "Activar"}">
                                <i class="fas fa-${coupon.active ? "ban" : "check"}"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCoupon(${coupon.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                  })
                  .join("")}
            </tbody>
        </table>
    `;
}

function openCouponModal(coupon = null) {
  const discountType = coupon ? coupon.discount_type || coupon.type : "";
  const discountValue = coupon ? coupon.discount_value || coupon.value : "";
  const minPurchase = coupon ? coupon.min_purchase || coupon.minPurchase : "";
  const maxUses = coupon ? coupon.max_uses || coupon.usageLimit : "100";
  const expiresAtRaw = coupon ? coupon.expires_at || coupon.expiresAt : "";

  // Procesar fecha correctamente
  const expiresAt = expiresAtRaw
    ? typeof expiresAtRaw === "string"
      ? expiresAtRaw.split("T")[0]
      : ""
    : "";

  const modalHTML = `
        <div class="modal show" id="couponModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>${coupon ? "Editar Cupón" : "Nuevo Cupón"}</h3>
                    <button class="modal-close" onclick="closeModal('couponModal')">&times;</button>
                </div>
                <form id="couponForm" onsubmit="handleCouponSubmit(event)">
                    <input type="hidden" id="couponId" value="${coupon ? coupon.id : ""}">
                    
                    <div class="form-group">
                        <label>Código del Cupón *</label>
                        <input type="text" id="couponCode" value="${coupon ? coupon.code : ""}" 
                               required maxlength="20" placeholder="VERANO2024" 
                               style="text-transform: uppercase;">
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción *</label>
                        <input type="text" id="couponDescription" value="${coupon ? coupon.description || "" : ""}" 
                               required placeholder="Descuento de verano">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Descuento *</label>
                            <select id="couponType" required onchange="updateCouponTypeFields()">
                                <option value="percentage" ${discountType === "percentage" ? "selected" : ""}>Porcentaje</option>
                                <option value="fixed" ${discountType === "fixed" ? "selected" : ""}>Monto Fijo</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Valor *</label>
                            <input type="number" id="couponValue" value="${discountValue}" 
                                   required min="0" step="0.01" placeholder="20">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Compra Mínima ($)</label>
                            <input type="number" id="couponMinPurchase" value="${minPurchase}" 
                                   min="0" step="0.01" placeholder="50">
                        </div>
                        
                        <div class="form-group">
                            <label>Límite de Uso</label>
                            <input type="number" id="couponUsageLimit" value="${maxUses}" 
                                   min="1" placeholder="100">
                            <small>Dejar vacío para uso ilimitado</small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Fecha de Expiración</label>
                        <input type="date" id="couponExpiresAt" 
                               value="${expiresAt}" 
                               min="${new Date().toISOString().split("T")[0]}">
                        <small>Dejar vacío para sin expiración</small>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="couponActive" 
                                   ${coupon ? (coupon.active ? "checked" : "") : "checked"}
                                   style="width: auto;">
                            <span>Cupón activo</span>
                        </label>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('couponModal')">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  updateCouponTypeFields();
}

function updateCouponTypeFields() {
  const type = document.getElementById("couponType").value;
  const maxDiscountGroup = document.getElementById("maxDiscountGroup");

  if (type === "percentage") {
    maxDiscountGroup.style.display = "block";
  } else {
    maxDiscountGroup.style.display = "none";
  }
}

async function handleCouponSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("couponId").value;
  const formData = {
    code: document.getElementById("couponCode").value.toUpperCase(),
    description: document.getElementById("couponDescription").value,
    type: document.getElementById("couponType").value,
    value: parseFloat(document.getElementById("couponValue").value),
    minPurchase:
      parseFloat(document.getElementById("couponMinPurchase").value) || 0,
    maxDiscount:
      parseFloat(document.getElementById("couponMaxDiscount").value) || null,
    usageLimit: parseInt(document.getElementById("couponUsageLimit").value),
    expiresAt: document.getElementById("couponExpiresAt").value,
    active: document.getElementById("couponActive").checked,
  };

  try {
    const url = id ? `${API_URL}/coupons/${id}` : `${API_URL}/coupons`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      showToast(id ? "Cupón actualizado" : "Cupón creado", "success", "Éxito");
      closeModal("couponModal");
      loadCoupons();
    } else {
      throw new Error("Error al guardar cupón");
    }
  } catch (error) {
    showToast("Error al guardar cupón", "error", "Error");
  }
}

async function editCoupon(id) {
  const coupon = coupons.find((c) => c.id === id);
  if (coupon) {
    openCouponModal(coupon);
  }
}

async function toggleCouponStatus(id) {
  const coupon = coupons.find((c) => c.id === id);
  if (!coupon) return;

  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ ...coupon, active: !coupon.active }),
    });

    if (response.ok) {
      showToast(
        `Cupón ${!coupon.active ? "activado" : "desactivado"}`,
        "success",
        "Éxito",
      );
      loadCoupons();
    }
  } catch (error) {
    showToast("Error al cambiar estado", "error", "Error");
  }
}

async function deleteCoupon(id) {
  if (!confirm("¿Eliminar este cupón?")) return;

  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (response.ok) {
      showToast("Cupón eliminado", "success", "Éxito");
      loadCoupons();
    }
  } catch (error) {
    showToast("Error al eliminar cupón", "error", "Error");
  }
}

// ========================================
// GESTIÓN DE PROMOCIONES
// ========================================

let promotions = [];
let allProductsForPromo = [];

async function loadPromotions() {
  const container = document.getElementById("promociones-section");
  if (!container) {
    console.error("❌ Elemento promociones-section no encontrado");
    return;
  }

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-gift"></i> Gestión de Promociones</h2>
            <button class="btn btn-primary" onclick="openPromotionModal()">
                <i class="fas fa-plus"></i> Nueva Promoción
            </button>
        </div>
        <div id="promotionsTableContainer"></div>
    `;

  try {
    console.log("🎁 Cargando promociones...");
    const [promosRes, prodsRes] = await Promise.all([
      fetch(`${API_URL}/promotions`),
      fetch(`${API_URL}/products?includeInactive=true&includeOutOfStock=true`),
    ]);

    if (!promosRes.ok || !prodsRes.ok) {
      throw new Error(
        `HTTP Error: promos=${promosRes.status}, prods=${prodsRes.status}`,
      );
    }

    promotions = await promosRes.json();
    allProductsForPromo = await prodsRes.json();
    console.log("✅ Promociones cargadas:", promotions.length);
    console.log("✅ Productos cargados:", allProductsForPromo.length);
    renderPromotionsTable(promotions);
  } catch (error) {
    console.error("❌ Error al cargar promociones:", error);
    showToast("Error al cargar promociones", "error", "Error");
    const tableContainer = document.getElementById("promotionsTableContainer");
    if (tableContainer) {
      tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
                    <p>Error al cargar promociones</p>
                    <button class="btn btn-primary" onclick="loadPromotions()">Reintentar</button>
                </div>
            `;
    }
  }
}

function renderPromotionsTable(promotions) {
  const container = document.getElementById("promotionsTableContainer");

  if (promotions.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-gift" style="font-size: 3rem; color: #ccc;"></i>
                <p>No hay promociones creadas</p>
                <button class="btn btn-primary" onclick="openPromotionModal()">Crear Primera Promoción</button>
            </div>
        `;
    return;
  }

  const now = new Date();

  container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Descuento</th>
                    <th>Periodo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${promotions
                  .map((promo) => {
                    const isActive =
                      promo.active &&
                      new Date(promo.start_date || promo.startDate) <= now &&
                      new Date(promo.end_date || promo.endDate) >= now;

                    const typeLabels = {
                      all: "Todos los productos",
                      products: "Productos específicos",
                      categories: "Por categoría",
                    };

                    const discountType =
                      promo.discount_type || promo.discountType;
                    const discountValue =
                      promo.discount_value || promo.discountValue;
                    const appliesTo = promo.applies_to || promo.type || "all";

                    return `
                    <tr>
                        <td>
                            <strong>${promo.name}</strong>
                            <br><small>${promo.description || ""}</small>
                        </td>
                        <td><span class="badge info">${typeLabels[appliesTo] || appliesTo}</span></td>
                        <td>
                            <strong>${discountType === "percentage" ? discountValue + "%" : "$" + parseFloat(discountValue).toFixed(2)}</strong>
                        </td>
                        <td>
                            <small>
                                ${new Date(promo.start_date || promo.startDate).toLocaleDateString()}<br>
                                ${new Date(promo.end_date || promo.endDate).toLocaleDateString()}
                            </small>
                        </td>
                        <td>
                            ${
                              isActive
                                ? '<span class="badge success">Activa</span>'
                                : promo.active
                                  ? '<span class="badge" style="background: #f59e0b;">Programada</span>'
                                  : '<span class="badge" style="background: #6b7280;">Inactiva</span>'
                            }
                        </td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editPromotion(${promo.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deletePromotion(${promo.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                  })
                  .join("")}
            </tbody>
        </table>
    `;
}

function openPromotionModal(promo = null) {
  const discountType = promo ? promo.discount_type || promo.discountType : "";
  const discountValue = promo
    ? promo.discount_value || promo.discountValue
    : "";
  const appliesTo = promo ? promo.applies_to || promo.type : "all";
  const startDateRaw = promo ? promo.start_date || promo.startDate : "";
  const endDateRaw = promo ? promo.end_date || promo.endDate : "";

  // Asegurar que las fechas son strings antes de usar split
  const startDate = startDateRaw
    ? typeof startDateRaw === "string"
      ? startDateRaw.split("T")[0]
      : ""
    : "";
  const endDate = endDateRaw
    ? typeof endDateRaw === "string"
      ? endDateRaw.split("T")[0]
      : ""
    : "";

  const modalHTML = `
        <div class="modal show" id="promotionModal">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>${promo ? "Editar Promoción" : "Nueva Promoción"}</h3>
                    <button class="modal-close" onclick="closeModal('promotionModal')">&times;</button>
                </div>
                <form id="promotionForm" onsubmit="handlePromotionSubmit(event)">
                    <input type="hidden" id="promoId" value="${promo ? promo.id : ""}">
                    
                    <div class="form-group">
                        <label>Nombre de la Promoción *</label>
                        <input type="text" id="promoName" value="${promo ? promo.name : ""}" 
                               required placeholder="Black Friday 2024">
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea id="promoDescription" rows="2" placeholder="Mega descuentos en productos seleccionados">${promo ? promo.description || "" : ""}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Descuento *</label>
                            <select id="promoDiscountType" required>
                                <option value="percentage" ${discountType === "percentage" ? "selected" : ""}>Porcentaje</option>
                                <option value="fixed" ${discountType === "fixed" ? "selected" : ""}>Monto Fijo</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Valor del Descuento *</label>
                            <input type="number" id="promoDiscountValue" value="${discountValue}" 
                                   required min="0" step="0.01" placeholder="20">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Aplicar a *</label>
                        <select id="promoType" required onchange="updatePromoTypeFields()">
                            <option value="all" ${appliesTo === "all" ? "selected" : ""}>Todos los productos</option>
                            <option value="products" ${appliesTo === "products" ? "selected" : ""}>Productos específicos</option>
                            <option value="categories" ${appliesTo === "categories" ? "selected" : ""}>Por categoría</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="productSelectGroup" style="display: none;">
                        <label>Seleccionar Productos</label>
                        <select id="promoProducts" multiple style="height: 150px;">
                            ${allProductsForPromo
                              .map(
                                (p) => `
                                <option value="${p.id}" ${promo?.product_ids?.includes(p.id) ? "selected" : ""}>
                                    ${p.name}
                                </option>
                            `,
                              )
                              .join("")}
                        </select>
                        <small>Mantén Ctrl (Cmd en Mac) para seleccionar múltiples</small>
                    </div>
                    
                    <div class="form-group" id="categorySelectGroup" style="display: none;">
                        <label>Seleccionar Categorías</label>
                        <select id="promoCategories" multiple style="height: 100px;">
                            ${[
                              ...new Set(
                                allProductsForPromo.map((p) => p.category),
                              ),
                            ]
                              .map(
                                (cat) => `
                                <option value="${cat}" ${promo?.category_ids?.includes(cat) ? "selected" : ""}>
                                    ${cat}
                                </option>
                            `,
                              )
                              .join("")}
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha de Inicio *</label>
                            <input type="date" id="promoStartDate" 
                                   value="${startDate}" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label>Fecha de Fin *</label>
                            <input type="date" id="promoEndDate" 
                                   value="${endDate}" 
                                   required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="promoActive" 
                                   ${promo ? (promo.active ? "checked" : "") : "checked"}
                                   style="width: auto;">
                            <span>Promoción activa</span>
                        </label>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('promotionModal')">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  updatePromoTypeFields();
}

function updatePromoTypeFields() {
  const type = document.getElementById("promoType").value;
  document.getElementById("productSelectGroup").style.display =
    type === "product" ? "block" : "none";
  document.getElementById("categorySelectGroup").style.display =
    type === "category" ? "block" : "none";
}

async function handlePromotionSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("promoId").value;
  const type = document.getElementById("promoType").value;

  const formData = {
    name: document.getElementById("promoName").value,
    description: document.getElementById("promoDescription").value,
    discountType: document.getElementById("promoDiscountType").value,
    discountValue: parseFloat(
      document.getElementById("promoDiscountValue").value,
    ),
    type: type,
    startDate: document.getElementById("promoStartDate").value,
    endDate: document.getElementById("promoEndDate").value,
    active: document.getElementById("promoActive").checked,
  };

  if (type === "product") {
    const selected = Array.from(
      document.getElementById("promoProducts").selectedOptions,
    );
    formData.productIds = selected.map((opt) => parseInt(opt.value));
  } else if (type === "category") {
    const selected = Array.from(
      document.getElementById("promoCategories").selectedOptions,
    );
    formData.categoryIds = selected.map((opt) => opt.value);
  }

  try {
    const url = id ? `${API_URL}/promotions/${id}` : `${API_URL}/promotions`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      showToast(
        id ? "Promoción actualizada" : "Promoción creada",
        "success",
        "Éxito",
      );
      closeModal("promotionModal");
      loadPromotions();
    } else {
      throw new Error("Error al guardar");
    }
  } catch (error) {
    showToast("Error al guardar promoción", "error", "Error");
  }
}

async function editPromotion(id) {
  const promo = promotions.find((p) => p.id === id);
  if (promo) {
    openPromotionModal(promo);
  }
}

async function deletePromotion(id) {
  if (!confirm("¿Eliminar esta promoción?")) return;

  try {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (response.ok) {
      showToast("Promoción eliminada", "success", "Éxito");
      loadPromotions();
    }
  } catch (error) {
    showToast("Error al eliminar", "error", "Error");
  }
}

// ========================================
// ANALYTICS
// ========================================

function loadAnalytics() {
  const container = document.getElementById("analytics-section");
  if (!container) return;

  const orders = state.orders || [];
  const products = state.products || [];

  // Calcular métricas
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-chart-line"></i> Analytics</h2>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div class="card">
                <div style="padding: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: #dbeafe; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-dollar-sign" style="color: #3b82f6; font-size: 1.5rem;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Ingreso Total</div>
                            <div style="font-size: 1.75rem; font-weight: 700; color: #1e293b;">$${parseFloat(totalRevenue || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div style="padding: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: #d1fae5; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-shopping-cart" style="color: #10b981; font-size: 1.5rem;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Valor Promedio</div>
                            <div style="font-size: 1.75rem; font-weight: 700; color: #1e293b;">$${parseFloat(avgOrderValue || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div style="padding: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: #fef3c7; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-box" style="color: #f59e0b; font-size: 1.5rem;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Productos Activos</div>
                            <div style="font-size: 1.75rem; font-weight: 700; color: #1e293b;">${products.filter((p) => p.active !== false).length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// CLIENTES
// ========================================

function loadClientes() {
  const container = document.getElementById("clientes-section");
  if (!container) return;

  const orders = state.orders || [];

  // Agrupar por cliente
  const clientesMap = {};
  orders.forEach((order) => {
    const email = order.customerEmail || order.userEmail;
    if (email) {
      if (!clientesMap[email]) {
        clientesMap[email] = {
          name: order.customerName || order.userName,
          email: email,
          phone: order.customerPhone || "N/A",
          orders: 0,
          total: 0,
        };
      }
      clientesMap[email].orders++;
      clientesMap[email].total += order.total || 0;
    }
  });

  const clientes = Object.values(clientesMap);

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-users"></i> Clientes</h2>
        </div>
        
        ${
          clientes.length === 0
            ? `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 3rem; color: #ccc;"></i>
                <p>No hay clientes registrados aún</p>
            </div>
        `
            : `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Pedidos</th>
                        <th>Total Gastado</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientes
                      .map(
                        (cliente) => `
                        <tr>
                            <td><strong>${cliente.name}</strong></td>
                            <td>${cliente.email}</td>
                            <td>${cliente.phone}</td>
                            <td><span class="badge info">${cliente.orders}</span></td>
                            <td><strong>$${parseFloat(cliente.total || 0).toFixed(2)}</strong></td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        `
        }
    `;
}

// ========================================
// REPORTES
// ========================================

function loadReportes() {
  const container = document.getElementById("reportes-section");
  if (!container) return;

  const orders = state.orders || [];
  const products = state.products || [];

  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-file-alt"></i> Reportes</h2>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-primary" onclick="imprimirReporte()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn btn-success" onclick="descargarReporteExcel()">
                    <i class="fas fa-file-excel"></i> Descargar Excel
                </button>
            </div>
        </div>
        
        <div style="display: grid; gap: 1.5rem;" id="reporteContenido">
            <div class="card">
                <div class="card-header">
                    <h3>Resumen de Pedidos</h3>
                </div>
                <div style="padding: 2rem;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #10b981;">${completedOrders}</div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Completados</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #f59e0b;">${pendingOrders}</div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Pendientes</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #ef4444;">${cancelledOrders}</div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Cancelados</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Estado del Inventario</h3>
                </div>
                <div style="padding: 2rem;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #4a2f1a;">${products.length}</div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Total Productos</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #f59e0b;">${products.filter((p) => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0).length}</div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Stock Bajo</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #ef4444;">${products.filter((p) => p.stock === 0).length}</div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Sin Stock</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para imprimir reporte
function imprimirReporte() {
  const contenido = document.getElementById("reporteContenido").innerHTML;
  const ventana = window.open("", "_blank");
  ventana.document.write(`
        <html>
            <head>
                <title>Reporte - CNC CAMPAS Pro</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 2rem; }
                    .card { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 2rem; }
                    .card-header { background: #f8fafc; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
                    h3 { margin: 0; color: #1e293b; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Reporte de Gestión</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                ${contenido}
            </body>
        </html>
    `);
  ventana.document.close();
  ventana.print();
}

// Función para descargar Excel
function descargarReporteExcel() {
  const orders = state.orders || [];
  const products = state.products || [];

  let csv = "Reporte de Gestión - CNC CAMPAS Pro\n\n";
  csv += "RESUMEN DE PEDIDOS\n";
  csv += "Estado,Cantidad\n";
  csv += `Completados,${orders.filter((o) => o.status === "completed").length}\n`;
  csv += `Pendientes,${orders.filter((o) => o.status === "pending").length}\n`;
  csv += `Cancelados,${orders.filter((o) => o.status === "cancelled").length}\n\n`;

  csv += "ESTADO DEL INVENTARIO\n";
  csv += "Categoría,Cantidad\n";
  csv += `Total Productos,${products.length}\n`;
  csv += `Stock Bajo,${products.filter((p) => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0).length}\n`;
  csv += `Sin Stock,${products.filter((p) => p.stock === 0).length}\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `reporte_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();

  showToast("Reporte descargado exitosamente", "success", "Éxito");
}

// ========================================
// VENTAS
// ========================================

function loadVentas() {
  const container = document.getElementById("ventas-section");
  if (!container) return;

  const orders = state.orders || [];

  // Agrupar por fecha
  const ventasPorDia = {};
  orders.forEach((order) => {
    if (order.status !== "cancelled") {
      const fecha = new Date(
        order.created_at || order.createdAt,
      ).toLocaleDateString();
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = { cantidad: 0, total: 0 };
      }
      ventasPorDia[fecha].cantidad++;
      ventasPorDia[fecha].total += order.total || 0;
    }
  });

  const dias = Object.keys(ventasPorDia).slice(-7); // Últimos 7 días

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-chart-bar"></i> Análisis de Ventas</h2>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Ventas de los Últimos 7 Días</h3>
            </div>
            <div style="padding: 2rem;">
                ${
                  dias.length === 0
                    ? `
                    <div style="text-align: center; padding: 3rem; color: #6b7280;">
                        <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p>No hay ventas registradas aún</p>
                    </div>
                `
                    : `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Pedidos</th>
                                <th>Total</th>
                                <th>Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dias
                              .map((dia) => {
                                const datos = ventasPorDia[dia];
                                const promedio = datos.total / datos.cantidad;
                                return `
                                    <tr>
                                        <td><strong>${dia}</strong></td>
                                        <td><span class="badge info">${datos.cantidad}</span></td>
                                        <td><strong>$${parseFloat(datos.total || 0).toFixed(2)}</strong></td>
                                        <td>$${parseFloat(promedio || 0).toFixed(2)}</td>
                                    </tr>
                                `;
                              })
                              .join("")}
                        </tbody>
                    </table>
                `
                }
            </div>
        </div>
    `;
}

// ========================================
// INVENTARIO
// ========================================

function loadInventario() {
  const container = document.getElementById("inventario-section");
  if (!container) return;

  const products = state.products || [];

  const lowStock = products.filter(
    (p) => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0,
  );
  const outOfStock = products.filter((p) => p.stock === 0);

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-warehouse"></i> Control de Inventario</h2>
        </div>
        
        <div style="display: grid; gap: 1.5rem;">
            ${
              lowStock.length > 0
                ? `
                <div class="card">
                    <div class="card-header">
                        <h3 style="color: #f59e0b;"><i class="fas fa-exclamation-triangle"></i> Productos con Stock Bajo</h3>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock Actual</th>
                                <th>Umbral</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lowStock
                              .map(
                                (p) => `
                                <tr>
                                    <td><strong>${p.name}</strong></td>
                                    <td><span class="badge" style="background: #f59e0b;">${p.stock}</span></td>
                                    <td>${p.lowStockThreshold || 10}</td>
                                    <td><span class="badge" style="background: #f59e0b;">⚠️ Stock Bajo</span></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `
                : ""
            }
            
            ${
              outOfStock.length > 0
                ? `
                <div class="card">
                    <div class="card-header">
                        <h3 style="color: #ef4444;"><i class="fas fa-times-circle"></i> Productos Sin Stock</h3>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${outOfStock
                              .map(
                                (p) => `
                                <tr>
                                    <td><strong>${p.name}</strong></td>
                                    <td><span class="badge info">${p.category}</span></td>
                                    <td><span class="badge" style="background: #ef4444;">❌ Sin Stock</span></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `
                : ""
            }
            
            ${
              lowStock.length === 0 && outOfStock.length === 0
                ? `
                <div class="card">
                    <div style="padding: 3rem; text-align: center;">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: #10b981; margin-bottom: 1rem;"></i>
                        <h3>¡Inventario en buen estado!</h3>
                        <p style="color: #6b7280; margin-top: 1rem;">
                            Todos los productos tienen stock suficiente
                        </p>
                    </div>
                </div>
            `
                : ""
            }
        </div>
    `;
}

// Hacer las funciones globales
window.previewProductImage = previewProductImage;
window.clearImagePreview = clearImagePreview;

console.log("✅ Sistema de upload de imágenes cargado");

// ========================================
// AJUSTES DEL SISTEMA
// ========================================

function loadAjustes() {
  const container = document.getElementById("ajustes-section");
  if (!container) return;

  container.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-cog"></i> Configuración del Sistema</h2>
        </div>
        
        <div class="settings-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-top: 2rem;">
            <!-- Información de la Tienda -->
            <div class="card">
                <div class="card-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-store" style="color: #4a2f1a;"></i>
                        Información de la Tienda
                    </h3>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label>Nombre de la Tienda</label>
                        <input type="text" class="form-control" value="CNC CAMPAS" id="storeName">
                    </div>
                    <div class="form-group">
                        <label>Email de Contacto</label>
                        <input type="email" class="form-control" value="cnccampas@gmail.com" id="storeEmail">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" class="form-control" value="+593 99 123 4567" id="storePhone">
                    </div>
                    <div class="form-group">
                        <label>Dirección</label>
                        <textarea class="form-control" rows="2" id="storeAddress">Guayaquil, Ecuador</textarea>
                    </div>
                    <button class="btn btn-primary" onclick="saveStoreInfo()">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
            
            <!-- Configuración de Envíos -->
            <div class="card">
                <div class="card-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-truck" style="color: #10b981;"></i>
                        Configuración de Envíos
                    </h3>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label>Costo de Envío ($)</label>
                        <input type="number" class="form-control" value="5.00" step="0.01" id="shippingCost">
                    </div>
                    <div class="form-group">
                        <label>Envío Gratis desde ($)</label>
                        <input type="number" class="form-control" value="100.00" step="0.01" id="freeShippingMin">
                    </div>
                    <div class="form-group">
                        <label>Tiempo de Entrega (días)</label>
                        <input type="number" class="form-control" value="3-5" id="deliveryTime">
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" checked id="enableShipping" style="width: auto;">
                            <span>Habilitar envíos</span>
                        </label>
                    </div>
                    <button class="btn btn-primary" onclick="saveShippingSettings()">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
            
            <!-- Métodos de Pago -->
            <div class="card">
                <div class="card-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-credit-card" style="color: #f59e0b;"></i>
                        Métodos de Pago
                    </h3>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem;">
                            <input type="checkbox" checked id="enableCreditCard" style="width: auto;">
                            <span><i class="fas fa-credit-card"></i> Tarjetas de Crédito/Débito</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem;">
                            <input type="checkbox" checked id="enableTransfer" style="width: auto;">
                            <span><i class="fas fa-university"></i> Transferencia Bancaria</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem;">
                            <input type="checkbox" id="enablePayPal" style="width: auto;">
                            <span><i class="fab fa-paypal"></i> PayPal</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" checked id="enableCash" style="width: auto;">
                            <span><i class="fas fa-money-bill-wave"></i> Efectivo (Contra entrega)</span>
                        </label>
                    </div>
                    <button class="btn btn-primary" onclick="savePaymentMethods()">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
            
            <!-- Impuestos -->
            <div class="card">
                <div class="card-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-percentage" style="color: #ef4444;"></i>
                        Impuestos
                    </h3>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label>IVA (%)</label>
                        <input type="number" class="form-control" value="12" step="0.01" id="taxRate">
                        <small style="color: #6b7280;">Porcentaje de IVA aplicado a las compras</small>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" checked id="taxIncluded" style="width: auto;">
                            <span>Impuestos incluidos en el precio</span>
                        </label>
                    </div>
                    <button class="btn btn-primary" onclick="saveTaxSettings()">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
            
            <!-- Notificaciones -->
            <div class="card">
                <div class="card-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-bell" style="color: #8b5cf6;"></i>
                        Notificaciones
                    </h3>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label>Email de Notificaciones</label>
                        <input type="email" class="form-control" value="admin@cnccampas.com" id="notificationEmail">
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem;">
                            <input type="checkbox" checked id="notifyNewOrder" style="width: auto;">
                            <span>Notificar nuevos pedidos</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem;">
                            <input type="checkbox" checked id="notifyLowStock" style="width: auto;">
                            <span>Notificar stock bajo</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="notifyNewUser" style="width: auto;">
                            <span>Notificar nuevos usuarios</span>
                        </label>
                    </div>
                    <button class="btn btn-primary" onclick="saveNotificationSettings()">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
            
            <!-- Mantenimiento -->
            <div class="card">
                <div class="card-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-tools" style="color: #64748b;"></i>
                        Mantenimiento
                    </h3>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="maintenanceMode" style="width: auto;">
                            <span>Modo Mantenimiento</span>
                        </label>
                        <small style="color: #6b7280;">La tienda no estará disponible para visitantes</small>
                    </div>
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem; margin-top: 1rem;">
                        <h4 style="margin-bottom: 1rem;">Acciones de Mantenimiento</h4>
                        <button class="btn btn-secondary" onclick="clearCache()" style="width: 100%; margin-bottom: 0.5rem;">
                            <i class="fas fa-broom"></i> Limpiar Caché
                        </button>
                        <button class="btn btn-warning" onclick="exportDatabase()" style="width: 100%; margin-bottom: 0.5rem;">
                            <i class="fas fa-download"></i> Exportar Base de Datos
                        </button>
                        <button class="btn btn-danger" onclick="confirmReset()" style="width: 100%;">
                            <i class="fas fa-exclamation-triangle"></i> Reset Sistema
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Funciones de guardado de ajustes
function saveStoreInfo() {
  const data = {
    name: document.getElementById("storeName").value,
    email: document.getElementById("storeEmail").value,
    phone: document.getElementById("storePhone").value,
    address: document.getElementById("storeAddress").value,
  };
  console.log("Guardando info de tienda:", data);
  showToast("Información de tienda guardada", "success", "Éxito");
}

function saveShippingSettings() {
  const data = {
    cost: document.getElementById("shippingCost").value,
    freeMin: document.getElementById("freeShippingMin").value,
    deliveryTime: document.getElementById("deliveryTime").value,
    enabled: document.getElementById("enableShipping").checked,
  };
  console.log("Guardando ajustes de envío:", data);
  showToast("Configuración de envíos guardada", "success", "Éxito");
}

function savePaymentMethods() {
  const data = {
    creditCard: document.getElementById("enableCreditCard").checked,
    transfer: document.getElementById("enableTransfer").checked,
    paypal: document.getElementById("enablePayPal").checked,
    cash: document.getElementById("enableCash").checked,
  };
  console.log("Guardando métodos de pago:", data);
  showToast("Métodos de pago guardados", "success", "Éxito");
}

function saveTaxSettings() {
  const data = {
    rate: document.getElementById("taxRate").value,
    included: document.getElementById("taxIncluded").checked,
  };
  console.log("Guardando ajustes de impuestos:", data);
  showToast("Configuración de impuestos guardada", "success", "Éxito");
}

function saveNotificationSettings() {
  const data = {
    email: document.getElementById("notificationEmail").value,
    newOrder: document.getElementById("notifyNewOrder").checked,
    lowStock: document.getElementById("notifyLowStock").checked,
    newUser: document.getElementById("notifyNewUser").checked,
  };
  console.log("Guardando ajustes de notificaciones:", data);
  showToast("Configuración de notificaciones guardada", "success", "Éxito");
}

function clearCache() {
  if (confirm("¿Limpiar el caché del sistema?")) {
    showToast("Caché limpiado", "success", "Éxito");
  }
}

function exportDatabase() {
  showToast("Exportando base de datos...", "info", "Procesando");
  setTimeout(() => {
    showToast("Base de datos exportada", "success", "Éxito");
  }, 2000);
}

function confirmReset() {
  if (
    confirm(
      "⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos del sistema. ¿Estás seguro?",
    )
  ) {
    if (
      confirm(
        "¿REALMENTE quieres resetear el sistema? Esta acción NO se puede deshacer.",
      )
    ) {
      showToast("Sistema reseteado", "success", "Completado");
    }
  }
}

// ========================================
// SOMOS NOSOTROS (ABOUT) - ADMIN DINÁMICO
// ========================================

async function loadAboutAdmin() {
  const container = document.getElementById("about-section");
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Editar Somos Nosotros</h3>
      </div>
      <div style="padding: 1.5rem;">
        <form id="aboutForm">
          <div class="form-group">
            <label>Título principal</label>
            <input id="aboutHeroTitle" type="text" placeholder="Sobre Nosotros" />
          </div>

          <div class="form-group">
            <label>Título Historia</label>
            <input id="aboutHistoriaTitle" type="text" placeholder="Nuestra Historia" />
          </div>

          <div class="form-group">
            <label>Historia (HTML)</label>
            <textarea id="aboutHistoriaHtml" rows="7" placeholder="<p>...</p>"></textarea>
          </div>

          <div class="form-group">
            <label>Título Misión</label>
            <input id="aboutMisionTitle" type="text" placeholder="MISION" />
          </div>
          <div class="form-group">
            <label>Texto Misión</label>
            <textarea id="aboutMisionText" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Título Visión</label>
            <input id="aboutVisionTitle" type="text" placeholder="VISION" />
          </div>
          <div class="form-group">
            <label>Texto Visión</label>
            <textarea id="aboutVisionText" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Título Equipo</label>
            <input id="aboutTeamTitle" type="text" placeholder="Nuestro Equipo" />
          </div>

          <button class="btn btn-primary" type="submit" style="width:100%;">
            <i class="fas fa-save"></i> Guardar cambios
          </button>
        </form>
      </div>
    </div>

    <div class="card" style="margin-top: 1.5rem;">
      <div class="card-header">
        <h3 class="card-title">Equipo</h3>
        <button class="btn btn-success btn-sm" onclick="openTeamMemberModal()">
          <i class="fas fa-plus"></i> Agregar Miembro
        </button>
      </div>
      <div id="aboutTeamMembersContainer" style="padding:1.5rem;"></div>
    </div>
  `;

  try {
    const res = await fetch(`${API_URL}/about`);
    if (!res.ok) throw new Error("No se pudo cargar About");
    const data = await res.json();

    document.getElementById("aboutHeroTitle").value = data.hero_title || "";
    document.getElementById("aboutHistoriaTitle").value =
      data.historia_title || "";
    document.getElementById("aboutHistoriaHtml").value =
      data.historia_html || "";
    document.getElementById("aboutMisionTitle").value = data.mision_title || "";
    document.getElementById("aboutMisionText").value = data.mision_text || "";
    document.getElementById("aboutVisionTitle").value = data.vision_title || "";
    document.getElementById("aboutVisionText").value = data.vision_text || "";
    document.getElementById("aboutTeamTitle").value = data.team_title || "";

    // render team
    window._aboutTeam = data.team || [];
    renderAboutTeam();
  } catch (e) {
    console.error(e);
    showToast("Error al cargar About", "error", "Error");
  }

  document
    .getElementById("aboutForm")
    .addEventListener("submit", saveAboutAdmin);
}

async function saveAboutAdmin(e) {
  e.preventDefault();

  const payload = {
    hero_title: document.getElementById("aboutHeroTitle").value.trim(),
    historia_title: document.getElementById("aboutHistoriaTitle").value.trim(),
    historia_html: document.getElementById("aboutHistoriaHtml").value.trim(),
    mision_title: document.getElementById("aboutMisionTitle").value.trim(),
    mision_text: document.getElementById("aboutMisionText").value.trim(),
    vision_title: document.getElementById("aboutVisionTitle").value.trim(),
    vision_text: document.getElementById("aboutVisionText").value.trim(),
    team_title: document.getElementById("aboutTeamTitle").value.trim(),
  };

  try {
    const resp = await fetch(`${API_URL}/about`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error("Error guardando About");
    showToast("About actualizado", "success", "Éxito");
  } catch (err) {
    console.error(err);
    showToast("No se pudo guardar About", "error", "Error");
  }
}

function renderAboutTeam() {
  const container = document.getElementById("aboutTeamMembersContainer");
  if (!container) return;

  const members = window._aboutTeam || [];
  if (members.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-users"></i></div>
        <div class="empty-state-title">Sin miembros</div>
        <div class="empty-state-desc">Agrega tu primer miembro</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:grid; gap:1rem;">
      ${members
        .map(
          (m) => `
        <div style="border:1px solid #e2e8f0; padding:1rem; border-radius:12px; display:flex; justify-content:space-between; gap:1rem;">
          <div>
            <div style="font-weight:700;">${m.name}</div>
            <div style="color:#8b5cf6; font-weight:600;">${m.role}</div>
            <div style="color:#64748b; font-size:.9rem;">${m.bio || ""}</div>
          </div>
          <div style="display:flex; gap:.5rem;">
            <button class="btn btn-sm btn-primary" onclick="openTeamMemberModal(${m.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteTeamMember(${m.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function openTeamMemberModal(id = null) {
  const member =
    (window._aboutTeam || []).find((x) => String(x.id) === String(id)) || null;

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h2 class="modal-title">${member ? "Editar Miembro" : "Nuevo Miembro"}</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nombre *</label>
          <input id="tmName" type="text" value="${member?.name || ""}">
        </div>
        <div class="form-group">
          <label>Rol *</label>
          <input id="tmRole" type="text" value="${member?.role || ""}">
        </div>
        <div class="form-group">
          <label>Bio</label>
          <textarea id="tmBio" rows="3">${member?.bio || ""}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveTeamMember(${member?.id || "null"})">
          <i class="fas fa-save"></i> Guardar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function saveTeamMember(id = null) {
  const name = document.getElementById("tmName").value.trim();
  const role = document.getElementById("tmRole").value.trim();
  const bio = document.getElementById("tmBio").value.trim();

  if (!name || !role) {
    showToast("Nombre y rol son obligatorios", "warning", "Aviso");
    return;
  }

  try {
    const url = id ? `${API_URL}/about/team/${id}` : `${API_URL}/about/team`;
    const method = id ? "PUT" : "POST";

    const resp = await fetch(url, {
      method,
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ name, role, bio, active: 1 }),
    });

    if (!resp.ok) throw new Error("Error guardando miembro");

    document.querySelector(".modal")?.remove();
    await loadAboutAdmin();
    showToast("Miembro guardado", "success", "Éxito");
  } catch (e) {
    console.error(e);
    showToast("No se pudo guardar miembro", "error", "Error");
  }
}

async function deleteTeamMember(id) {
  if (!confirm("¿Eliminar este miembro?")) return;
  try {
    const resp = await fetch(`${API_URL}/about/team/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!resp.ok) throw new Error("Error eliminando miembro");
    await loadAboutAdmin();
    showToast("Miembro eliminado", "success", "Éxito");
  } catch (e) {
    console.error(e);
    showToast("No se pudo eliminar miembro", "error", "Error");
  }
}

window.loadAboutAdmin = loadAboutAdmin;

window.saveAboutAdmin = saveAboutAdmin;

window.openTeamMemberModal = openTeamMemberModal;

window.saveTeamMember = saveTeamMember;

window.deleteTeamMember = deleteTeamMember;

// ========================================
// AUTH HELPERS (About / Categories / etc.)
// ========================================
function getAuthHeaders(extra = {}) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("authToken") ||
    null;

  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
async function loadSettings() {
  const container = document.getElementById("ajustes-section");
  if (!container) return;

  try {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error("Error cargando settings");

    const currentSettings = await response.json();
    console.log("✅ Settings cargados:", currentSettings);

    container.innerHTML = `
      <div class="filters-bar">
        <h3 style="margin: 0;">⚙️ Configuración del Sistema</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
        <!-- Información de la Tienda -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-store"></i> Información de la Tienda</h3>
          </div>
          <div class="modal-body">
            <form id="storeInfoForm">
              <div class="form-group">
                <label>Nombre de la Tienda</label>
                <input type="text" id="storeName" value="${currentSettings.store_name || ""}" />
              </div>
              <div class="form-group">
                <label>Email de Contacto</label>
                <input type="email" id="storeEmail" value="${currentSettings.store_email || ""}" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" id="storePhone" value="${currentSettings.store_phone || ""}" />
              </div>
              <div class="form-group">
                <label>Dirección</label>
                <input type="text" id="storeAddress" value="${currentSettings.store_address || ""}" />
              </div>
              <div class="form-group">
                <label>Ciudad</label>
                <input type="text" id="storeCity" value="${currentSettings.store_city || ""}" />
              </div>
              <div class="form-group">
                <label>Horario</label>
                <input type="text" id="storeSchedule" value="${currentSettings.store_schedule || ""}" placeholder="Lun – Vie 8:00 AM – 6:00 PM" />
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>

        <!-- Redes Sociales -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-share-alt"></i> Redes Sociales</h3>
          </div>
          <div class="modal-body">
            <form id="socialMediaForm">
              <div class="form-group">
                <label><i class="fab fa-facebook"></i> Facebook</label>
                <input type="url" id="facebookUrl" value="${currentSettings.facebook_url || ""}" placeholder="https://facebook.com/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-instagram"></i> Instagram</label>
                <input type="url" id="instagramUrl" value="${currentSettings.instagram_url || ""}" placeholder="https://instagram.com/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-whatsapp"></i> WhatsApp</label>
                <input type="url" id="whatsappUrl" value="${currentSettings.whatsapp_url || ""}" placeholder="https://wa.me/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-tiktok"></i> TikTok</label>
                <input type="url" id="tiktokUrl" value="${currentSettings.tiktok_url || ""}" placeholder="https://tiktok.com/@..." />
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>

        <!-- Configuración de Impuestos -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-percentage"></i> Impuestos</h3>
          </div>
          <div class="modal-body">
            <form id="taxForm">
              <div class="form-group">
                <label>IVA (%)</label>
                <input type="number" id="ivaPercent" value="${currentSettings.iva_percent || 12}" min="0" max="100" step="0.01" />
                <small style="color: #6b7280; display: block; margin-top: 0.5rem;">Porcentaje de IVA aplicado a las compras</small>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>

        <!-- Pie de Página -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-file-alt"></i> Pie de Página</h3>
          </div>
          <div class="modal-body">
            <form id="footerForm">
              <div class="form-group">
                <label>Texto del Pie de Página</label>
                <textarea id="footerText" rows="4" placeholder="Texto que aparece en el pie de página...">${currentSettings.footer_text || ""}</textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document
      .getElementById("storeInfoForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          store_name: document.getElementById("storeName").value,
          store_email: document.getElementById("storeEmail").value,
          store_phone: document.getElementById("storePhone").value,
          store_address: document.getElementById("storeAddress").value,
          store_city: document.getElementById("storeCity").value,
          store_schedule: document.getElementById("storeSchedule").value,
        };
        await guardarSettings(payload);
      });

    document
      .getElementById("socialMediaForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          facebook_url: document.getElementById("facebookUrl").value,
          instagram_url: document.getElementById("instagramUrl").value,
          whatsapp_url: document.getElementById("whatsappUrl").value,
          tiktok_url: document.getElementById("tiktokUrl").value,
        };
        await guardarSettings(payload);
      });

    document.getElementById("taxForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        iva_percent: parseFloat(document.getElementById("ivaPercent").value),
      };
      await guardarSettings(payload);
    });

    document
      .getElementById("footerForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          footer_text: document.getElementById("footerText").value,
        };
        await guardarSettings(payload);
      });
  } catch (error) {
    console.error("❌ Error al cargar settings:", error);
    showToast("Error al cargar configuración", "error", "Error");
  }
}

async function guardarSettings(payload) {
  try {
    const response = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Error al guardar");

    showToast("Configuración guardada exitosamente", "success", "Éxito");
    await loadSettings();
  } catch (error) {
    console.error("Error al guardar settings:", error);
    showToast("Error al guardar configuración", "error", "Error");
  }
}
window.getAuthHeaders = getAuthHeaders;

// ========================================
// DOCUMENTOS LEGALES - EDITOR QUILL
// Agregable a admin-pro.js
// ========================================

let quillPrivacy = null;
let quillTerms = null;

async function loadAjustesCompleto() {
  const container = document.getElementById("ajustes-section");
  if (!container) return;

  // Mostrar spinner mientras carga
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando configuración...</p>
    </div>
  `;

  try {
    // Cargar datos actuales
    const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Error cargando settings");

    const data = await res.json();

    // Renderizar la interfaz COMPLETA (Settings + Documentos Legales)
    container.innerHTML = `
      <!-- SETTINGS -->
      <div class="filters-bar">
        <h3 style="margin: 0;">⚙️ Configuración del Sistema</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
        <!-- Información de la Tienda -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-store"></i> Información de la Tienda</h3>
          </div>
          <div class="modal-body">
            <form id="storeInfoForm">
              <div class="form-group">
                <label>Nombre de la Tienda</label>
                <input type="text" id="storeName" value="${data.store_name || ""}" />
              </div>
              <div class="form-group">
                <label>Email de Contacto</label>
                <input type="email" id="storeEmail" value="${data.store_email || ""}" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" id="storePhone" value="${data.store_phone || ""}" />
              </div>
              <div class="form-group">
                <label>Dirección</label>
                <input type="text" id="storeAddress" value="${data.store_address || ""}" />
              </div>
              <div class="form-group">
                <label>Ciudad</label>
                <input type="text" id="storeCity" value="${data.store_city || ""}" />
              </div>
              <div class="form-group">
                <label>Horario</label>
                <input type="text" id="storeSchedule" value="${data.store_schedule || ""}" placeholder="Lun – Vie 8:00 AM – 6:00 PM" />
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>

        <!-- Redes Sociales -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-share-alt"></i> Redes Sociales</h3>
          </div>
          <div class="modal-body">
            <form id="socialMediaForm">
              <div class="form-group">
                <label><i class="fab fa-facebook"></i> Facebook</label>
                <input type="url" id="facebookUrl" value="${data.facebook_url || ""}" placeholder="https://facebook.com/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-instagram"></i> Instagram</label>
                <input type="url" id="instagramUrl" value="${data.instagram_url || ""}" placeholder="https://instagram.com/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-whatsapp"></i> WhatsApp</label>
                <input type="url" id="whatsappUrl" value="${data.whatsapp_url || ""}" placeholder="https://wa.me/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-tiktok"></i> TikTok</label>
                <input type="url" id="tiktokUrl" value="${data.tiktok_url || ""}" placeholder="https://tiktok.com/@..." />
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>

        <!-- Configuración de Impuestos -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-percentage"></i> Impuestos</h3>
          </div>
          <div class="modal-body">
            <form id="taxForm">
              <div class="form-group">
                <label>IVA (%)</label>
                <input type="number" id="ivaPercent" value="${data.iva_percent || 12}" min="0" max="100" step="0.01" />
                <small style="color: #6b7280; display: block; margin-top: 0.5rem;">Porcentaje de IVA aplicado a las compras</small>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>

        <!-- Pie de Página -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-file-alt"></i> Pie de Página</h3>
          </div>
          <div class="modal-body">
            <form id="footerForm">
              <div class="form-group">
                <label>Texto del Pie de Página</label>
                <textarea id="footerText" rows="4" placeholder="Texto que aparece en el pie de página...">${data.footer_text || ""}</textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-save"></i> Guardar
              </button>
            </form>
          </div>
        </div>
      </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
    
      <!-- Configuración Bancaria -->
      <div class="card">
          <div class="card-header">
              <h3 class="card-title"><i class="fas fa-university"></i> Datos Bancarios</h3>
          </div>
          <div class="modal-body">
              <form id="bankForm">
                  <div class="form-group">
                      <label>Banco</label>
                      <input type="text" id="bankName" value="${data.bank_name || 'Banco Pichincha'}" placeholder="Banco Pichincha" />
                  </div>
                  <div class="form-group">
                      <label>Tipo de Cuenta</label>
                      <select id="accountType">
                          <option value="Cuenta Corriente" ${data.account_type === 'Cuenta Corriente' ? 'selected' : ''}>Cuenta Corriente</option>
                          <option value="Cuenta de Ahorros" ${data.account_type === 'Cuenta de Ahorros' ? 'selected' : ''}>Cuenta de Ahorros</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Número de Cuenta</label>
                      <input type="text" id="accountNumber" value="${data.account_number || '2100123456'}" placeholder="2100123456" />
                  </div>
                  <div class="form-group">
                      <label>Beneficiario</label>
                      <input type="text" id="accountHolder" value="${data.account_holder || 'CNC CAMPAS'}" placeholder="CNC CAMPAS" />
                  </div>
                  <div class="form-group">
                      <label>RUC/Cédula</label>
                      <input type="text" id="accountId" value="${data.account_id || '0992345678001'}" placeholder="0992345678001" />
                  </div>
                  <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                      <i class="fas fa-save"></i> Guardar
                  </button>
              </form>
          </div>
      </div>

      <!-- Mensaje de WhatsApp -->
      <div class="card">
          <div class="card-header">
              <h3 class="card-title"><i class="fab fa-whatsapp"></i> Mensaje de WhatsApp</h3>
          </div>
          <div class="modal-body">
              <form id="whatsappForm">
                  <div class="form-group">
                      <label>Mensaje Automático al Cliente</label>
                      <textarea id="whatsappMessage" rows="8" placeholder="Hola! Gracias por tu pedido...">${data.whatsapp_message || 'Hola! Gracias por tu pedido #{orderId}. Total: ${total}. Te contactaremos pronto.'}</textarea>
                      <small style="color: #6b7280; display: block; margin-top: 0.75rem; padding: 0.75rem; background: #f9fafb; border-radius: 8px; border-left: 3px solid #4a2f1a;">
                          <strong style="display: block; margin-bottom: 0.5rem;">📝 Variables disponibles:</strong>
                          <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">#{orderId}</code> ID del pedido<br>
                          <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">\${total}</code> Total del pedido<br>
                          <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">#{customerName}</code> Nombre del cliente<br>
                          <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">#{customerEmail}</code> Email del cliente
                      </small>
                  </div>
                  <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                      <i class="fas fa-save"></i> Guardar
                  </button>
              </form>
          </div>
      </div>
  </div>

      <!-- DOCUMENTOS LEGALES -->
      <div class="filters-bar" style="margin-top: 3rem;">
        <h3 style="margin: 0;">📄 Documentos Legales</h3>
      </div>

      <div style="display: grid; gap: 2rem; margin-top: 2rem;">
        <!-- Política de Privacidad -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-shield-alt"></i> Política de Privacidad
            </h3>
            <div class="card-actions">
              <small style="color: #6b7280;">Página pública: /pages/politica-privacidad.html</small>
            </div>
          </div>
          <div class="modal-body">
            <div id="privacyEditor" style="height: 300px; background: white; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="saveLegalDocs('privacy')">
              <i class="fas fa-save"></i> Guardar Política de Privacidad
            </button>
          </div>
        </div>

        <!-- Términos y Condiciones -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-file-contract"></i> Términos y Condiciones
            </h3>
            <div class="card-actions">
              <small style="color: #6b7280;">Página pública: /pages/terminos-condiciones.html</small>
            </div>
          </div>
          <div class="modal-body">
            <div id="termsEditor" style="height: 300px; background: white; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="saveLegalDocs('terms')">
              <i class="fas fa-save"></i> Guardar Términos y Condiciones
            </button>
          </div>
        </div>
      </div>
    `;

    // Inicializar Quill después de renderizar
    setTimeout(() => {
      initQuillEditors(data);
    }, 200);

    // Event listeners de SETTINGS
    document
      .getElementById("storeInfoForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          store_name: document.getElementById("storeName").value,
          store_email: document.getElementById("storeEmail").value,
          store_phone: document.getElementById("storePhone").value,
          store_address: document.getElementById("storeAddress").value,
          store_city: document.getElementById("storeCity").value,
          store_schedule: document.getElementById("storeSchedule").value,
        };
        await guardarSettings(payload);
      });
      // Event listener para datos bancarios
    document.getElementById("bankForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        bank_name: document.getElementById("bankName").value,
        account_type: document.getElementById("accountType").value,
        account_number: document.getElementById("accountNumber").value,
        account_holder: document.getElementById("accountHolder").value,
        account_id: document.getElementById("accountId").value,
      };
      await guardarSettings(payload);
    });

    // Event listener para mensaje de WhatsApp
    document.getElementById("whatsappForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        whatsapp_message: document.getElementById("whatsappMessage").value,
      };
      await guardarSettings(payload);
    });

    document
      .getElementById("socialMediaForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          facebook_url: document.getElementById("facebookUrl").value,
          instagram_url: document.getElementById("instagramUrl").value,
          whatsapp_url: document.getElementById("whatsappUrl").value,
          tiktok_url: document.getElementById("tiktokUrl").value,
        };
        await guardarSettings(payload);
      });

    document.getElementById("taxForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        iva_percent: parseFloat(document.getElementById("ivaPercent").value),
      };
      await guardarSettings(payload);
    });

    document
      .getElementById("footerForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          footer_text: document.getElementById("footerText").value,
        };
        await guardarSettings(payload);
      });
  } catch (error) {
    console.error("❌ Error al cargar documentos legales:", error);
    showToast("Error al cargar documentos legales", "error", "Error");
    container.innerHTML = `
      <div class="card">
        <div style="padding: 2rem; text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
          <p>Error al cargar documentos legales</p>
          <button class="btn btn-primary" onclick="loadLegalDocuments()" style="margin-top: 1rem;">
            <i class="fas fa-redo"></i> Reintentar
          </button>
        </div>
      </div>
    `;
  }
}

function initQuillEditors(data) {
  if (typeof Quill === "undefined") {
    console.error(
      "❌ Quill no está cargado. Verifica que el CDN esté en admin-pro.html",
    );
    showToast(
      "Editor Quill no cargó. Revisa el CDN en admin-pro.html",
      "error",
      "Error",
    );
    return;
  }

  // Esperar a que los elementos existan en el DOM
  const privacyEl = document.getElementById("privacyEditor");
  const termsEl = document.getElementById("termsEditor");

  if (!privacyEl || !termsEl) {
    console.error("❌ Los elementos del editor no se encontraron en el DOM");
    setTimeout(() => initQuillEditors(data), 300); // Reintentar
    return;
  }

  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote"],
    ["link"],
    ["clean"],
  ];

  // Destruir editores anteriores si existen
  if (quillPrivacy) {
    quillPrivacy = null;
  }
  if (quillTerms) {
    quillTerms = null;
  }

  // Crear nuevos editores
  try {
    quillPrivacy = new Quill("#privacyEditor", {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
      placeholder: "Escribe la política de privacidad aquí...",
    });

    quillTerms = new Quill("#termsEditor", {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
      placeholder: "Escribe los términos y condiciones aquí...",
    });

    // Cargar contenido existente
    if (data.privacy_policy_html) {
      quillPrivacy.root.innerHTML = data.privacy_policy_html;
    }

    if (data.terms_conditions_html) {
      quillTerms.root.innerHTML = data.terms_conditions_html;
    }

    console.log("✅ Editores Quill inicializados correctamente");
  } catch (error) {
    console.error("❌ Error inicializando Quill:", error);
    showToast("Error inicializando editor: " + error.message, "error", "Error");
  }
}

async function saveLegalDocs(docType) {
  try {
    if (!quillPrivacy || !quillTerms) {
      showToast(
        "Los editores no se inicializaron correctamente",
        "warning",
        "Aviso",
      );
      return;
    }

    const payload = {};

    if (docType === "privacy") {
      payload.privacy_policy_html = quillPrivacy.root.innerHTML;
    } else if (docType === "terms") {
      payload.terms_conditions_html = quillTerms.root.innerHTML;
    } else {
      // Guardar ambos
      payload.privacy_policy_html = quillPrivacy.root.innerHTML;
      payload.terms_conditions_html = quillTerms.root.innerHTML;
    }

    const res = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Error guardando documentos");
    }

    showToast("Documento legal guardado exitosamente ✅", "success", "Éxito");
    console.log("✅ Documento guardado:", docType);
  } catch (error) {
    console.error("❌ Error al guardar documentos:", error);
    showToast(error.message || "Error guardando documento", "error", "Error");
  }
}

// Exportar función global
window.loadAjustesCompleto = loadAjustesCompleto;
window.saveLegalDocs = saveLegalDocs;

async function guardarSettings(payload) {
  try {
    console.log('📤 Enviando payload:', payload); // DEBUG
    
    const response = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.error || "Error al guardar");
    }

    const result = await response.json();
    console.log('✅ Respuesta del servidor:', result);

    showToast("Configuración guardada exitosamente", "success", "Éxito");
    
    await loadAjustesCompleto();

  } catch (error) {
    console.error("❌ Error al guardar settings:", error);
    showToast(error.message || "Error al guardar configuración", "error", "Error");
  }
}

// ========================================
// HEADER COMÚN - CNC CAMPAS
// ========================================

// Función para cargar el header
function loadCommonHeader() {
  const headerHTML = `
        <header>
            <div class="header-container">
                <img src="/img/logo.png" alt="CNC CAMPAS" class="logo" onclick="window.location.href='/'">
                <nav>
                    <a href="/" data-page="home">Inicio</a>
                    <a href="/pages/productos.html" data-page="productos">Productos</a>
                    <a href="/pages/about.html" data-page="about">Sobre Nosotros</a>
                    <a href="/#contacto" data-page="contacto">Contacto</a>
                </nav>
                <div class="header-icons">
                    <button class="icon-btn" onclick="window.location.href='/pages/cart.html'" title="Carrito">
                        <i class="fas fa-shopping-cart"></i>
                        <span id="cartCount" class="cart-count" style="display: none;">0</span>
                    </button>
                    <div class="user-menu-container">
                        <button class="icon-btn" onclick="toggleUserMenu()" id="userMenuBtn" title="Mi cuenta">
                            <i class="fas fa-user"></i>
                        </button>
                        <div class="user-dropdown" id="userDropdown" style="display: none;">
                            <div class="user-info" id="userInfo">
                                <i class="fas fa-user-circle"></i>
                                <span id="userName">Usuario</span>
                            </div>
                            <a href="/pages/mis-pedidos.html" class="dropdown-item">
                                <i class="fas fa-shopping-bag"></i> Mis Pedidos
                            </a>
                            <a href="/pages/admin-pro.html" class="dropdown-item" id="adminLink" style="display: none;">
                                <i class="fas fa-cog"></i> Panel Admin
                            </a>
                            <div class="dropdown-divider"></div>
                            <button onclick="logout()" class="dropdown-item logout-btn">
                                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `;

  // Insertar header al inicio del body
  if (!document.querySelector("header")) {
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
  }

  // Marcar página activa
  markActivePage();

  // Inicializar funcionalidades
  initializeHeader();
}

// Marcar la página activa en el menú
function markActivePage() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll("nav a");

  links.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");

    if (currentPath === "/" && href === "/") {
      link.classList.add("active");
    } else if (
      currentPath !== "/" &&
      href !== "/" &&
      currentPath.includes(href)
    ) {
      link.classList.add("active");
    }
  });
}

// Inicializar funcionalidades del header
function initializeHeader() {
  const userNameEl = document.getElementById("userName");
  const adminLinkEl = document.getElementById("adminLink");

  if (!userNameEl) {
    console.warn("Header aún no cargado");
    return;
  }

  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  if (userEmail) {
    userNameEl.textContent = userName || userEmail.split("@")[0];

    if (userRole === "admin" && adminLinkEl) {
      adminLinkEl.style.display = "flex";
    }
  } else {
    userNameEl.textContent = "Invitado";
  }

  updateCartCount();

  document.addEventListener("click", (e) => {
    const userMenu = document.querySelector(".user-menu-container");
    const dropdown = document.getElementById("userDropdown");

    if (userMenu && dropdown && !userMenu.contains(e.target)) {
      dropdown.classList.remove("show");
      dropdown.style.display = "none";
    }
  });
}

// Toggle menú de usuario
function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");

  if (dropdown.style.display === "none" || !dropdown.style.display) {
    dropdown.style.display = "block";
    dropdown.classList.add("show");
  } else {
    dropdown.classList.remove("show");
    dropdown.style.display = "none";
  }
}

// Actualizar contador del carrito
function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (!cartCount) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length > 0) {
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );
    cartCount.textContent = totalItems;
    cartCount.style.display = "block";
  } else {
    cartCount.style.display = "none";
  }
}

// Logout
function logout() {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");

    window.location.href = "/";
  }
}

// Cargar header cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCommonHeader);
} else {
  loadCommonHeader();
}

// Actualizar carrito cuando cambie
window.addEventListener("storage", (e) => {
  if (e.key === "cart") {
    updateCartCount();
  }
});

// Hacer funciones globales
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;
window.updateCartCount = updateCartCount;

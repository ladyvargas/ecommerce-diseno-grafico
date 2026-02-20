// ========================================
// HEADER COMÚN - CNC CAMPAS
// ========================================

// Función para cargar el header
function loadCommonHeader() {
  const headerHTML = `
        <header>
        <div class="header-container">
            <a href="/" class="logo-link" title="Volver al inicio">
              <img src="/img/logo.png" alt="CNC CAMPAS" class="logo">
            </a>
            <nav id="mainNav">
                <a href="/">Inicio</a>
                <a href="/pages/productos.html">Tienda Virtual</a>
                <a href="/pages/services.html">Servicios</a>
                <a href="/pages/about.html">Sobre Nosotros</a>
                <a href="/#contacto">Contacto</a>

                <!-- OPCIONES USUARIO SOLO MÓVIL -->
                <div class="mobile-user-menu">
                    <a href="/pages/mis-pedidos.html">Mis Pedidos</a>
                    <a href="/pages/admin-pro.html" id="adminLinkMobile" style="display:none;">
                        Panel Admin
                    </a>
                    <button onclick="logout()" class="logout-mobile">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div class="header-icons">
                <!-- CARRITO -->
                <button class="icon-btn" onclick="window.location.href='/cart'">
                    <i class="fas fa-shopping-cart"></i>
                    <span id="cartCount" class="cart-count" style="display: none;">0</span>
                </button>

                <!-- USUARIO SOLO DESKTOP -->
                <div class="user-menu-container desktop-only">
                    <button class="icon-btn" id="userMenuBtn">
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
                        <button onclick="logout()" class="dropdown-item logout-btn" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                        <div id="userGuest" style="display:none;">
                            <a href="/pages/login.html" class="dropdown-item">
                                <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                            </a>
                        </div>
                    </div>
                </div>

                <!-- HAMBURGER -->
                <button class="hamburger" id="hamburgerBtn" aria-label="Menú">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
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
      0,
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
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mainNav = document.getElementById("mainNav");
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");

  // Lógica del Menú Hamburguesa
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("active");
      hamburgerBtn.classList.toggle("is-active");
    });
  }

  // Lógica del Dropdown de Usuario (Desktop)
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = userDropdown.style.display === "block";
      userDropdown.style.display = isVisible ? "none" : "block";
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener("click", () => {
      userDropdown.style.display = "none";
    });
  }
});

// Hacer funciones globales
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;
window.updateCartCount = updateCartCount;

// ===============================
// FOOTER COMÚN - CNC CAMPAS (DINÁMICO SETTINGS)
// ===============================

const API_URL = "https://ecommerce-diseno-grafico-production.up.railway.app/api";

async function loadCommonFooter() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    const settings = await res.json();

    const facebook = settings.facebook_url || "https://www.facebook.com/p/Cnccampas-61557170055468/";
    const instagram = settings.instagram_url || "https://www.instagram.com/cnccampas/";
    const tiktok = settings.tiktok_url || "https://www.tiktok.com/@cnccampas7";
    const whatsapp = settings.whatsapp_url || "#";

    const footerHTML = `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-column">
          <img src="/img/logo.png" alt="CNC CAMPAS" class="footer-logo">
          <p>Fabricación digital profesional con la más alta tecnología. Convirtiendo tus ideas en realidad.</p>

          <div class="footer-social">
            <a href="${facebook}" target="_blank"><i class="fab fa-facebook"></i></a>
            <a href="${instagram}" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="${whatsapp}" target="_blank"><i class="fab fa-whatsapp"></i></a>
            <a href="${tiktok}" target="_blank"><i class="fab fa-tiktok"></i></a>
          </div>
        </div>

        <div class="footer-column">
          <h3>Enlaces</h3>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/pages/productos.html">Tienda Virtual</a></li>
            <li><a href="/pages/services.html">Servicios</a></li>
            <li><a href="/pages/about.html">Sobre Nosotros</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="/pages/admin-pro.html">Admin</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3>Contacto</h3>
          <ul class="footer-contact">
            <li><i class="fas fa-map-marker-alt"></i> ${settings.contact_location || "Esmeraldas, Ecuador"}</li>
            <li><i class="fas fa-phone"></i> ${settings.contact_phone || "+593 964083585"}</li>
            <li><i class="fas fa-envelope"></i> ${settings.contact_email || "cnccampas@gmail.com"}</li>
            <li><i class="fas fa-clock"></i> ${settings.contact_hours || "Lun - Vie: 8:00 AM - 6:00 PM"}</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 CNC CAMPAS. Todos los derechos reservados.</p>
        <div class="footer-links">
          <a href="#">Política de Privacidad</a>
          <a href="#">Términos y Condiciones</a>
        </div>
      </div>
    </footer>
    `;

    if (!document.querySelector("footer")) {
      document.body.insertAdjacentHTML("beforeend", footerHTML);
    }
  } catch (err) {
    console.error("Error cargando footer dinámico:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCommonFooter);
} else {
  loadCommonFooter();
}

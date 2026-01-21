// ===============================
// FOOTER COMÚN - CNC CAMPAS
// ===============================

function loadCommonFooter() {

    const footerHTML = `
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-column">
                <img src="/img/logo.png" alt="CNC CAMPAS" class="footer-logo">
                <p>Fabricación digital profesional con la más alta tecnología. Convirtiendo tus ideas en realidad.</p>
                <div class="footer-social">
                    <a href="https://www.facebook.com/p/Cnccampas-61557170055468/"><i class="fab fa-facebook"></i></a>
                    <a href="https://www.instagram.com/cnccampas/"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-whatsapp"></i></a>
                    <a href="https://www.tiktok.com/@cnccampas7"><i class="fab fa-tiktok"></i></a>
                </div>
            </div>

            <div class="footer-column">
                <h3>Servicios</h3>
                <ul>
                    <li><a href="#">Router CNC</a></li>
                    <li><a href="#">Corte Láser</a></li>
                    <li><a href="#">Impresión UV</a></li>
                    <li><a href="#">Impresión 3D</a></li>
                    <li><a href="#">Plotter Gran Formato</a></li>
                    <li><a href="#">Letreros LED</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Enlaces</h3>
                <ul>
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/pages/productos.html">Tienda Virtual</a>
                <a href="/pages/services.html">Servicios</a></li>
                    <li><a href="/pages/about.html">Sobre Nosotros</a></li>
                    <li><a href="#contacto">Contacto</a></li>
                    <li><a href="/pages/admin-pro.html">Admin</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Contacto</h3>
                <ul class="footer-contact">
                    <li><i class="fas fa-map-marker-alt"></i> Esmeraldas, Ecuador</li>
                    <li><i class="fas fa-phone"></i> +593 XX XXX XXXX</li>
                    <li><i class="fas fa-envelope"></i> cnccampas@gmail.com</li>
                    <li><i class="fas fa-clock"></i> Lun - Vie: 8:00 AM - 6:00 PM</li>
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

    // Insertar solo si no existe ya
    if (!document.querySelector('footer')) {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

// Cargar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCommonFooter);
} else {
    loadCommonFooter();
}

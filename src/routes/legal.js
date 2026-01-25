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
                <input type="text" id="storeName" value="${data.store_name || ''}" />
              </div>
              <div class="form-group">
                <label>Email de Contacto</label>
                <input type="email" id="storeEmail" value="${data.store_email || ''}" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" id="storePhone" value="${data.store_phone || ''}" />
              </div>
              <div class="form-group">
                <label>Dirección</label>
                <input type="text" id="storeAddress" value="${data.store_address || ''}" />
              </div>
              <div class="form-group">
                <label>Ciudad</label>
                <input type="text" id="storeCity" value="${data.store_city || ''}" />
              </div>
              <div class="form-group">
                <label>Horario</label>
                <input type="text" id="storeSchedule" value="${data.store_schedule || ''}" placeholder="Lun – Vie 8:00 AM – 6:00 PM" />
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
                <input type="url" id="facebookUrl" value="${data.facebook_url || ''}" placeholder="https://facebook.com/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-instagram"></i> Instagram</label>
                <input type="url" id="instagramUrl" value="${data.instagram_url || ''}" placeholder="https://instagram.com/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-whatsapp"></i> WhatsApp</label>
                <input type="url" id="whatsappUrl" value="${data.whatsapp_url || ''}" placeholder="https://wa.me/..." />
              </div>
              <div class="form-group">
                <label><i class="fab fa-tiktok"></i> TikTok</label>
                <input type="url" id="tiktokUrl" value="${data.tiktok_url || ''}" placeholder="https://tiktok.com/@..." />
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
                <textarea id="footerText" rows="4" placeholder="Texto que aparece en el pie de página...">${data.footer_text || ''}</textarea>
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
    document.getElementById("storeInfoForm").addEventListener("submit", async (e) => {
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

    document.getElementById("socialMediaForm").addEventListener("submit", async (e) => {
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

    document.getElementById("footerForm").addEventListener("submit", async (e) => {
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
    console.error("❌ Quill no está cargado. Verifica que el CDN esté en admin-pro.html");
    showToast("Editor Quill no cargó. Revisa el CDN en admin-pro.html", "error", "Error");
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
    console.log("=== DEBUG saveLegalDocs ===");
    console.log("docType recibido:", docType);
    
    if (!quillPrivacy || !quillTerms) {
      console.error("❌ Editores no inicializados");
      showToast("Los editores no se inicializaron correctamente", "warning", "Aviso");
      return;
    }

    let endpoint = "";
    let payload = {};

    if (docType === "privacy") {
      const content = quillPrivacy.root.innerHTML;
      console.log("Privacy content:", content);
      if (!content || content.trim() === "") {
        showToast("El editor de privacidad está vacío", "warning", "Aviso");
        return;
      }
      endpoint = `${API_URL}/legal/privacy`;
      payload = { content_html: content };
    } else if (docType === "terms") {
      const content = quillTerms.root.innerHTML;
      console.log("Terms content:", content);
      if (!content || content.trim() === "") {
        showToast("El editor de términos está vacío", "warning", "Aviso");
        return;
      }
      endpoint = `${API_URL}/legal/terms`;
      payload = { content_html: content };
    }

    console.log("📤 Endpoint:", endpoint);
    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);
    
    const responseData = await response.json();
    console.log("Response data:", responseData);
    
    if (!response.ok) {
      throw new Error(responseData.error || "Error guardando documentos");
    }

    showToast("Documento legal guardado exitosamente ✅", "success", "Éxito");
    console.log("✅ Documento guardado:", docType);

  } catch (error) {
    console.error("❌ Error completo:", error);
    showToast(error.message || "Error guardando documento", "error", "Error");
  }
}

// Exportar función global
window.loadAjustesCompleto = loadAjustesCompleto;
window.saveLegalDocs = saveLegalDocs;

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
    await loadAjustesCompleto();

  } catch (error) {
    console.error("Error al guardar settings:", error);
    showToast("Error al guardar configuración", "error", "Error");
  }
}
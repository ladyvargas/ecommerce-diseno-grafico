// ========================================
// BOTÓN FLOTANTE DE WHATSAPP DINÁMICO
// ========================================

const API_URL = '/api';

async function loadWhatsAppButton() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        
        if (!response.ok) {
            throw new Error('Error cargando settings');
        }
        
        const settings = await response.json();
        
        // Obtener el número de teléfono
        let phoneNumber = settings.store_phone || '+593991234567';
        
        // Limpiar el número (quitar espacios, guiones, paréntesis)
        phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        // Asegurarse de que tenga el formato correcto para WhatsApp
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }
        
        // Mensaje predeterminado
        const defaultMessage = '¡Hola! Vengo desde la página web de CNC CAMPAS. quisiera más información.';
        
        // Construir URL de WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
        
        // Actualizar el botón
        const whatsappButton = document.getElementById('whatsappFloat');
        
        if (whatsappButton) {
            whatsappButton.href = whatsappUrl;
            console.log('✅ Botón de WhatsApp configurado:', whatsappUrl);
        } else {
            console.warn('⚠️ Elemento #whatsappFloat no encontrado');
        }
        
    } catch (error) {
        console.error('❌ Error cargando botón de WhatsApp:', error);
        
        // Fallback: usar número predeterminado
        const fallbackPhone = '+593991234567';
        const fallbackMessage = '¡Hola! Quisiera más información.';
        const fallbackUrl = `https://wa.me/${fallbackPhone}?text=${encodeURIComponent(fallbackMessage)}`;
        
        const whatsappButton = document.getElementById('whatsappFloat');
        if (whatsappButton) {
            whatsappButton.href = fallbackUrl;
            console.log('⚠️ Usando número de WhatsApp predeterminado');
        }
    }
}

// Cargar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadWhatsAppButton);
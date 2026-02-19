// ========================================
// APLICAR COLORES ESTANDARIZADOS
// ========================================

// Este script busca elementos con colores hardcoded y los reemplaza con variables CSS
// Ejecutar después de que el DOM esté listo

(function() {
    'use strict';
    
    // Mapa de colores a reemplazar
    const colorMap = {
        // Browns
        '#6B4423': 'var(--brown-primary)',
        '#6b4423': 'var(--brown-primary)',
        'rgb(107, 68, 35)': 'var(--brown-primary)',
        
        '#4A2F1A': 'var(--brown-dark)',
        '#4a2f1a': 'var(--brown-dark)',
        'rgb(74, 47, 26)': 'var(--brown-dark)',
        
        // Greens
        '#3D5A3C': 'var(--green)',
        '#3d5a3c': 'var(--green)',
        'rgb(61, 90, 60)': 'var(--green)',
        
        '#2A3F29': 'var(--green-dark)',
        '#2a3f29': 'var(--green-dark)',
        'rgb(42, 63, 41)': 'var(--green-dark)',
        
        // Beiges
        '#D4A574': 'var(--beige)',
        '#d4a574': 'var(--beige)',
        'rgb(212, 165, 116)': 'var(--beige)',
        
        '#E8C9A0': '#243977',
        '#e8c9a0': '#243977',
        'rgb(232, 201, 160)': '#243977'
    };
    
    // Aplicar colores a elementos inline
    function applyStandardColors() {
        // Buscar todos los elementos con estilo inline
        const elementsWithStyle = document.querySelectorAll('[style]');
        
        elementsWithStyle.forEach(element => {
            const style = element.getAttribute('style');
            let newStyle = style;
            
            // Reemplazar cada color
            Object.keys(colorMap).forEach(oldColor => {
                const regex = new RegExp(oldColor, 'gi');
                newStyle = newStyle.replace(regex, colorMap[oldColor]);
            });
            
            if (newStyle !== style) {
                element.setAttribute('style', newStyle);
            }
        });
    }
    
    // Aplicar colores a hojas de estilo
    function applyStylesToStyleSheets() {
        try {
            // Obtener todas las hojas de estilo
            const sheets = document.styleSheets;
            
            for (let i = 0; i < sheets.length; i++) {
                try {
                    const rules = sheets[i].cssRules || sheets[i].rules;
                    
                    for (let j = 0; j < rules.length; j++) {
                        const rule = rules[j];
                        
                        if (rule.style) {
                            let changed = false;
                            
                            // Verificar cada propiedad de estilo
                            ['color', 'backgroundColor', 'borderColor', 'background'].forEach(prop => {
                                const value = rule.style[prop];
                                if (value) {
                                    Object.keys(colorMap).forEach(oldColor => {
                                        if (value.includes(oldColor)) {
                                            rule.style[prop] = value.replace(oldColor, colorMap[oldColor]);
                                            changed = true;
                                        }
                                    });
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Ignorar errores de CORS
                }
            }
        } catch (e) {
            console.log('No se pudieron aplicar colores a las hojas de estilo:', e);
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyStandardColors();
            setTimeout(applyStylesToStyleSheets, 100);
        });
    } else {
        applyStandardColors();
        setTimeout(applyStylesToStyleSheets, 100);
    }
    
    // Observar cambios en el DOM
    const observer = new MutationObserver(() => {
        applyStandardColors();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
    
})();

console.log('✅ Sistema de colores estandarizados cargado');

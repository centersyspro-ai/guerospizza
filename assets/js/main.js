// Popup de advertencia a los 10 segundos
document.addEventListener('DOMContentLoaded', function() {
    // Esperar 10 segundos antes de mostrar el modal
    setTimeout(function() {
        const warningModal = document.getElementById('warningModal');
        const closeBtn = document.getElementById('warningModalCloseBtn');
        const warningCloseModal = document.querySelector('.warning-close-modal');
        
        if (warningModal) {
            // Mostrar el modal
            warningModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Configurar el cierre del modal
            function closeWarningModal() {
                warningModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Opcional: Guardar en localStorage que ya se mostró
                localStorage.setItem('warningModalShown', 'true');
            }
            
            // Evento para el botón de cerrar
            if (closeBtn) {
                closeBtn.addEventListener('click', closeWarningModal);
            }
            
            // Evento para el botón X
            if (warningCloseModal) {
                warningCloseModal.addEventListener('click', closeWarningModal);
            }
            
            // Cerrar al hacer clic fuera del modal
            warningModal.addEventListener('click', function(event) {
                if (event.target === warningModal) {
                    closeWarningModal();
                }
            });
            
            // Cerrar con tecla ESC
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && warningModal.style.display === 'block') {
                    closeWarningModal();
                }
            });
        }
        
    }, 10000); // 10 segundos = 10000 milisegundos
});

// WhatsApp Modal Mejorado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del modal WhatsApp
    const whatsappModalBtn = document.getElementById('whatsappBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const whatsappCloseModal = document.querySelector('.whatsapp-close-modal');
    const whatsappForm = document.getElementById('whatsappForm');
    const whatsappName = document.getElementById('whatsappName');
    const whatsappPhone = document.getElementById('whatsappPhone');
    const whatsappMessage = document.getElementById('whatsappMessage');
    const whatsappLocationText = document.getElementById('whatsappLocationText');
    const whatsappLocationStatus = document.getElementById('whatsappLocationStatus');
    const whatsappGetLocationBtn = document.getElementById('whatsappGetLocationBtn');
    const whatsappManualLocationBtn = document.getElementById('whatsappManualLocationBtn');
    const manualLocationInput = document.getElementById('manualLocationInput');
    const whatsappManualAddress = document.getElementById('whatsappManualAddress');
    const whatsappSaveManualLocation = document.getElementById('whatsappSaveManualLocation');
    const whatsappSendBtn = document.getElementById('whatsappSendBtn');
    const phoneValidation = document.getElementById('phoneValidation');
    const charCount = document.getElementById('charCount');
    const successMessage = document.getElementById('successMessage');
    
    let userLocation = null;
    let isManualLocation = false;
    let manualAddress = '';
    const phoneNumber = '524427128200'; // Número de WhatsApp de la pizzería
    const maxMessageLength = 500;
    
    // Configurar contador de caracteres
    whatsappMessage.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length > maxMessageLength) {
            this.value = this.value.substring(0, maxMessageLength);
            charCount.textContent = maxMessageLength;
        }
        
        updateSendButton();
    });
    
    // Validación de teléfono mexicano
    function validateMexicanPhone(phone) {
        // Eliminar espacios, guiones, paréntesis
        const cleaned = phone.replace(/[\s\-()]/g, '');
        
        // Patrones aceptados:
        // 1. 4427128200 (10 dígitos)
        // 2. +524427128200 (+52 + 10 dígitos)
        // 3. 524427128200 (52 + 10 dígitos)
        // 4. 5214427128200 (521 + 10 dígitos)
        const patterns = [
            /^\d{10}$/,                       // 10 dígitos
            /^\+52\d{10}$/,                   // +52 + 10 dígitos
            /^52\d{10}$/,                     // 52 + 10 dígitos
            /^521\d{10}$/                     // 521 + 10 dígitos
        ];
        
        return patterns.some(pattern => pattern.test(cleaned));
    }
    
    whatsappPhone.addEventListener('input', function() {
        const phone = this.value;
        const isValid = validateMexicanPhone(phone);
        
        if (!phone) {
            phoneValidation.textContent = '';
            phoneValidation.className = 'validation-message';
        } else if (isValid) {
            phoneValidation.textContent = '✓ Teléfono válido';
            phoneValidation.className = 'validation-message validation-success';
        } else {
            phoneValidation.textContent = '✗ Formato no válido. Use 10 dígitos, +52, 52 o 521 + 10 dígitos';
            phoneValidation.className = 'validation-message validation-error';
        }
        
        updateSendButton();
    });
    
    // Obtener ubicación automática
    function getWhatsappLocation() {
        whatsappLocationText.textContent = 'Obteniendo ubicación...';
        whatsappLocationStatus.classList.remove('location-success', 'location-error');
        
        if (!navigator.geolocation) {
            showLocationError('Geolocalización no soportada por tu navegador');
            return;
        }
        
        // Mostrar indicador de carga
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'location-loading';
        whatsappLocationStatus.appendChild(loadingIndicator);
        
        navigator.geolocation.getCurrentPosition(
            // Success
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                userLocation = { lat, lng };
                isManualLocation = false;
                
                // Obtener dirección en formato coloquial
                getAddressFromCoordinates(lat, lng);
                
                // Remover indicador de carga
                const loading = whatsappLocationStatus.querySelector('.location-loading');
                if (loading) loading.remove();
            },
            // Error
            function(error) {
                let errorMessage = 'No se pudo obtener la ubicación automática';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso de ubicación denegado. Usa la opción manual.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Información de ubicación no disponible. Usa la opción manual.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado. Usa la opción manual.';
                        break;
                }
                
                showLocationError(errorMessage);
                
                // Remover indicador de carga
                const loading = whatsappLocationStatus.querySelector('.location-loading');
                if (loading) loading.remove();
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
    }
    
    // Obtener dirección desde coordenadas
    function getAddressFromCoordinates(lat, lng) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`)
            .then(response => response.json())
            .then(data => {
                let formattedAddress = '';
                
                if (data && data.address) {
                    const addr = data.address;
                    
                    // Formato coloquial mexicano
                    let street = addr.road || '';
                    if (street && !/^(calle|avenida|av\.|av |blvd)/i.test(street)) {
                        street = 'Calle ' + street;
                    }
                    
                    if (addr.house_number) {
                        street += ` #${addr.house_number}`;
                    }
                    
                    if (addr.suburb || addr.neighbourhood) {
                        if (street) street += `, ${addr.suburb || addr.neighbourhood}`;
                        else street = addr.suburb || addr.neighbourhood;
                    }
                    
                    const city = addr.city || addr.town || addr.village || '';
                    const state = addr.state || '';
                    
                    if (city && !street.includes(city)) {
                        if (street) formattedAddress = `${street}, ${city}`;
                        else formattedAddress = city;
                    } else {
                        formattedAddress = street || '';
                    }
                    
                    if (state && !formattedAddress.includes(state)) {
                        formattedAddress += `, ${state}`;
                    }
                }
                
                if (!formattedAddress || formattedAddress.length < 10) {
                    if (data && data.display_name) {
                        formattedAddress = data.display_name
                            .split(',')
                            .slice(0, 3)
                            .join(', ')
                            .trim();
                    } else {
                        formattedAddress = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    }
                }
                
                showLocationSuccess(formattedAddress);
            })
            .catch(error => {
                console.log('Geocoding error:', error);
                showLocationSuccess(`Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            });
    }
    
    function showLocationSuccess(address) {
        whatsappLocationText.textContent = `📍 ${address}`;
        whatsappLocationStatus.classList.add('location-success');
        updateSendButton();
    }
    
    function showLocationError(message) {
        whatsappLocationText.textContent = `❌ ${message}`;
        whatsappLocationStatus.classList.add('location-error');
        updateSendButton();
    }
    
    // Abrir modal WhatsApp
    whatsappModalBtn.addEventListener('click', function() {
        whatsappModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Intentar obtener ubicación automáticamente al abrir
        setTimeout(() => {
            if (!userLocation && !isManualLocation) {
                getWhatsappLocation();
            }
        }, 500);
    });
    
    // Cerrar modal
    whatsappCloseModal.addEventListener('click', function() {
        whatsappModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetWhatsappForm();
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && whatsappModal.style.display === 'block') {
            whatsappModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetWhatsappForm();
        }
    });
    
    // Cerrar al hacer click fuera
    window.addEventListener('click', function(event) {
        if (event.target === whatsappModal) {
            whatsappModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetWhatsappForm();
        }
    });
    
    // Botón obtener ubicación
    whatsappGetLocationBtn.addEventListener('click', function() {
        getWhatsappLocation();
        manualLocationInput.classList.remove('active');
        isManualLocation = false;
    });
    
    // Botón ubicación manual
    whatsappManualLocationBtn.addEventListener('click', function() {
        manualLocationInput.classList.add('active');
        isManualLocation = true;
        updateSendButton();
    });
    
    // Guardar ubicación manual
    whatsappSaveManualLocation.addEventListener('click', function() {
        const address = whatsappManualAddress.value.trim();
        if (address.length < 10) {
            alert('Por favor, escribe una dirección más detallada (mínimo 10 caracteres)');
            return;
        }
        
        manualAddress = address;
        whatsappLocationText.textContent = `📍 ${address}`;
        whatsappLocationStatus.classList.add('location-success');
        manualLocationInput.classList.remove('active');
        updateSendButton();
    });
    
    // Actualizar estado del botón enviar
    function updateSendButton() {
        const nameValid = whatsappName.value.trim().length >= 2;
        const phoneValid = validateMexicanPhone(whatsappPhone.value);
        const messageValid = whatsappMessage.value.trim().length >= 5;
        const hasLocation = (userLocation || (isManualLocation && manualAddress)) && 
                           whatsappLocationStatus.classList.contains('location-success');
        
        whatsappSendBtn.disabled = !(nameValid && phoneValid && messageValid && hasLocation);
    }
    
    // Eventos para validación en tiempo real
    whatsappName.addEventListener('input', updateSendButton);
    whatsappPhone.addEventListener('input', updateSendButton);
    whatsappMessage.addEventListener('input', updateSendButton);
    
    // Enviar formulario
    whatsappForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendWhatsAppMessage();
    });
    
    whatsappSendBtn.addEventListener('click', function() {
        if (!whatsappSendBtn.disabled) {
            sendWhatsAppMessage();
        }
    });
    
    // Función sendWhatsAppMessage() CORREGIDA
    function sendWhatsAppMessage() {
        const name = whatsappName.value.trim();
        const phone = whatsappPhone.value.trim();
        const message = whatsappMessage.value.trim();
        let location = '';
        let mapsUrl = '';
        
        // Preparar ubicación para el mensaje
        if (isManualLocation && manualAddress) {
            location = manualAddress;
            // Crear enlace de búsqueda en Google Maps CORREGIDO
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        } else if (userLocation) {
            location = whatsappLocationText.textContent.replace('📍 ', '');
            mapsUrl = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
        }
        
        // Construir mensaje completo CON los datos del cliente
        let whatsappMessageText = ` Güero´s Pizza - Nuevo Pedido Online*\n\n`;
        whatsappMessageText += ` CLIENTE:* ${name}\n`;
        whatsappMessageText += ` TELÉFONO DEL CLIENTE:* ${phone}\n\n`;
        whatsappMessageText += ` PEDIDO SOLICITADO:*\n${message}\n\n`;
        whatsappMessageText += ` UBICACIÓN DE ENTREGA:*\n${location}\n\n`;
        whatsappMessageText += ` ENLACE GOOGLE MAPS:*\n${mapsUrl}\n\n`;
        whatsappMessageText += ` HORA DEL PEDIDO:* ${new Date().toLocaleString('es-MX')}\n`;
        whatsappMessageText += `\n Pedido generado desde la web de Güero´s Pizza`;
        
        // Codificar para URL
        const encodedMessage = encodeURIComponent(whatsappMessageText);
        
        // URL de WhatsApp CORREGIDA - siempre al número de la pizzería
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Mostrar mensaje de éxito
        successMessage.classList.add('show');
        
        // Abrir WhatsApp después de breve pausa
        setTimeout(() => {
            // Abrir en nueva ventana
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Cerrar modal después de enviar
            setTimeout(() => {
                whatsappModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                resetWhatsappForm();
                successMessage.classList.remove('show');
            }, 1500);
        }, 800);
    }
    
    function resetWhatsappForm() {
        whatsappForm.reset();
        whatsappLocationText.textContent = 'Haz clic en "Obtener Ubicación" o escribe tu dirección';
        whatsappLocationStatus.className = 'location-status';
        manualLocationInput.classList.remove('active');
        whatsappManualAddress.value = '';
        userLocation = null;
        isManualLocation = false;
        manualAddress = '';
        phoneValidation.textContent = '';
        phoneValidation.className = 'validation-message';
        charCount.textContent = '0';
        updateSendButton();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const indicators = Array.from(document.querySelectorAll('.carousel-indicator'));

    let currentIndex = 0;

    function updateCarousel(index) {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${slideWidth * index}px)`;

        indicators.forEach(btn => btn.classList.remove('active'));
        indicators[index].classList.add('active');

        currentIndex = index;
    }

    nextButton.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
    });

    prevButton.addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel(prevIndex);
    });

    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const index = parseInt(indicator.getAttribute('data-index'));
            updateCarousel(index);
        });
    });

    // Autoplay opcional cada 5 segundos
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
    }, 5000);

    // Inicializar
    updateCarousel(0);
});


// Elementos para manejar los botones de ordenar
const orderHeroBtn = document.getElementById('orderHeroBtn');
const orderPizzaBtns = document.querySelectorAll('.order-pizza-btn');
const specialPizzaBtn = document.getElementById('specialPizzaBtn');

// Configurar botón "Pedir Ahora" del hero
if (orderHeroBtn) {
    orderHeroBtn.addEventListener('click', function() {
        // Abrir el modal de WhatsApp directamente
        whatsappModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Limpiar el mensaje anterior y poner un mensaje genérico
        // whatsappMessage.value = "¡Hola! Me gustaría hacer un pedido de pizza. Por favor, ayúdenme con las opciones disponibles.";
        
        // Actualizar contador de caracteres
        charCount.textContent = whatsappMessage.value.length;
        
        // Intentar obtener ubicación automáticamente
        setTimeout(() => {
            if (!userLocation && !isManualLocation) {
                getWhatsappLocation();
            }
        }, 500);
        
        // Enfocar el campo de nombre
        setTimeout(() => {
            whatsappName.focus();
        }, 300);
    });
}

// Configurar botones de "Ordenar" de las pizzas
orderPizzaBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const pizzaName = this.getAttribute('data-pizza');
        const pizzaPrice = this.getAttribute('data-price');
        const pizzaDesc = this.getAttribute('data-description');
        
        // Abrir modal de WhatsApp
        whatsappModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Preparar mensaje con la pizza seleccionada
        //let orderMessage = `Quiero ordenar:\n`;
        //orderMessage += `🍕 ${pizzaName} - $${pizzaPrice}\n`;
        //orderMessage += `Descripción: ${pizzaDesc}\n\n`;
        //orderMessage += `Por favor, díganme el tiempo de entrega y el costo de envío.`;
        
        whatsappMessage.value = orderMessage;
        charCount.textContent = orderMessage.length;
        
        // Intentar obtener ubicación automáticamente
        setTimeout(() => {
            if (!userLocation && !isManualLocation) {
                getWhatsappLocation();
            }
        }, 500);
        
        // Enfocar el campo de nombre
        setTimeout(() => {
            whatsappName.focus();
        }, 300);
    });
});

// Configurar botón de especialidad
if (specialPizzaBtn) {
    specialPizzaBtn.addEventListener('click', function() {
        const pizzaName = this.getAttribute('data-pizza');
        const pizzaPrice = this.getAttribute('data-price');
        const pizzaDesc = this.getAttribute('data-description');
        
        // Abrir modal de WhatsApp
        whatsappModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Preparar mensaje con la especialidad
        //let orderMessage = `¡Quiero ordenar la ESPECIALIDAD DE LA CASA! 🍕\n\n`;
        //orderMessage += `🔸 ${pizzaName} - $${pizzaPrice}\n`;
        //orderMessage += `🔸 ${pizzaDesc}\n\n`;
        //orderMessage += `¿Cuál es el tiempo de preparación y entrega para esta especialidad?`;
        
        whatsappMessage.value = orderMessage;
        charCount.textContent = orderMessage.length;
        
        // Intentar obtener ubicación automáticamente
        setTimeout(() => {
            if (!userLocation && !isManualLocation) {
                getWhatsappLocation();
            }
        }, 500);
        
        // Enfocar el campo de nombre
        setTimeout(() => {
            whatsappName.focus();
        }, 300);
    });
}

// También actualizar el listener del botón flotante de WhatsApp para que use la misma función
whatsappModalBtn.addEventListener('click', function() {
    whatsappModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Limpiar mensaje anterior
    whatsappMessage.value = "";
    charCount.textContent = "0";
    
    // Intentar obtener ubicación automáticamente al abrir
    setTimeout(() => {
        if (!userLocation && !isManualLocation) {
            getWhatsappLocation();
        }
    }, 500);
    
    // Enfocar el campo de nombre
    setTimeout(() => {
        whatsappName.focus();
    }, 300);
});
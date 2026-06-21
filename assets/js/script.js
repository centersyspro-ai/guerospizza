// script.js - Código JavaScript para Pizzería Don Guiseppe

// Año actual automático
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Detectar si es PWA/APK
    if (window.matchMedia('(display-mode: standalone').matches || 
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')) {
        document.body.classList.add('app-mode');
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('assets/js/sw.js').catch(function(error) {
                console.log('ServiceWorker registration failed:', error);
            });
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // CARRUSEL
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
    
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });
    
    // Auto slide cada 5 segundos
    let autoSlide = setInterval(nextSlide, 5000);
    
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });
    
    carousel.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, 5000);
    });
    
    updateCarousel();

    // WhatsApp con GPS para pedidos de pizza
    const whatsappBtn = document.getElementById('whatsappBtn');
    const pizzaModal = document.getElementById('pizzaModal');
    const closeModal = document.querySelector('.close-modal');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationText = document.getElementById('locationText');
    const locationStatus = document.getElementById('locationStatus');
    const userMessage = document.getElementById('userMessage');
    const sendWhatsApp = document.getElementById('sendWhatsApp');
    const pizzaOptionsContainer = document.querySelector('.pizza-options');
    const orderSummary = document.getElementById('orderSummary');
    const selectedPizzaText = document.getElementById('selectedPizzaText');
    const selectedPriceText = document.getElementById('selectedPriceText');
    
    let userLocation = null;
    let selectedPizza = null;
    let selectedPrice = null;
    const phoneNumber = '524429999999'; // Número de WhatsApp de la pizzería
    
    // Crear opciones de pizza basadas en el menú
    const pizzaMenu = [
        { name: 'Margherita Tradicional', price: 199, desc: 'Salsa de tomate, mozzarella fresca, albahaca' },
        { name: 'Pepperoni Especial', price: 229, desc: 'Doble pepperoni, salsa especial, queso mozzarella' },
        { name: 'Hawaiana Artesanal', price: 219, desc: 'Jamón de pavo, piña asada, queso mozzarella' },
        { name: 'Mexicana Picante', price: 239, desc: 'Chorizo, jalapeños, pimiento, cebolla' },
        { name: 'Vegetariana Fresca', price: 219, desc: 'Champiñones, pimientos, cebolla, aceitunas' },
        { name: 'Cuatro Quesos', price: 249, desc: 'Mozzarella, gorgonzola, parmesano, queso de cabra' },
        { name: 'Pizza Don Guiseppe', price: 299, desc: 'Especialidad de la casa con ingredientes premium' }
    ];
    
    // Generar opciones de pizza en el modal
    pizzaMenu.forEach(pizza => {
        const option = document.createElement('div');
        option.className = 'pizza-option';
        option.innerHTML = `
            <div class="pizza-name">${pizza.name}</div>
            <div class="pizza-desc">${pizza.desc}</div>
            <div class="pizza-price">$${pizza.price}</div>
        `;
        option.addEventListener('click', () => {
            // Remover selección anterior
            document.querySelectorAll('.pizza-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Seleccionar nueva opción
            option.classList.add('selected');
            selectedPizza = pizza.name;
            selectedPrice = pizza.price;
            
            // Mostrar resumen
            orderSummary.style.display = 'block';
            selectedPizzaText.textContent = `🍕 ${pizza.name}`;
            selectedPriceText.textContent = `💰 $${pizza.price} MXN`;
            
            updateSendButton();
        });
        pizzaOptionsContainer.appendChild(option);
    });
    
    // Botones de ordenar en el menú
    document.querySelectorAll('.menu-item .btn, #specialPizzaBtn, #orderHeroBtn').forEach(button => {
        button.addEventListener('click', function() {
            const pizzaName = this.getAttribute('data-pizza');
            const pizzaPrice = this.getAttribute('data-price');
            
            // Abrir modal
            pizzaModal.style.display = 'block';
            getLocation();
            
            // Seleccionar la pizza correspondiente
            const options = document.querySelectorAll('.pizza-option');
            options.forEach(option => {
                const nameElement = option.querySelector('.pizza-name');
                if (nameElement && nameElement.textContent === pizzaName) {
                    option.click();
                }
            });
            
            // Si es el botón de la especialidad
            if (pizzaName === 'Pizza Don Guiseppe') {
                const specialOption = Array.from(options).find(opt => 
                    opt.querySelector('.pizza-name').textContent === 'Pizza Don Guiseppe'
                );
                if (specialOption) specialOption.click();
            }
        });
    });
    
    // Abrir modal al hacer click en WhatsApp
    whatsappBtn.addEventListener('click', function() {
        pizzaModal.style.display = 'block';
        getLocation();
    });
    
    // Cerrar modal
    closeModal.addEventListener('click', function() {
        pizzaModal.style.display = 'none';
    });
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && pizzaModal.style.display === 'block') {
            pizzaModal.style.display = 'none';
        }
    });
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function(event) {
        if (event.target === pizzaModal) {
            pizzaModal.style.display = 'none';
        }
    });
    
    // Obtener ubicación
    function getLocation() {
        locationText.textContent = 'Obteniendo ubicación...';
        locationStatus.classList.remove('location-success', 'location-error');
        sendWhatsApp.disabled = true;
        
        if (!navigator.geolocation) {
            locationText.textContent = '❌ Geolocalización no soportada por tu navegador';
            locationStatus.classList.add('location-error');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            // Success
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                userLocation = { lat, lng };
                
                // Obtener dirección en formato coloquial mexicano
                getAddressFromCoordinates(lat, lng);
            },
            // Error
            function(error) {
                let errorMessage = '❌ No se pudo obtener la ubicación';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '❌ Permiso de ubicación denegado. Por favor habilita la ubicación en tu navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '❌ Información de ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '❌ Tiempo de espera agotado para obtener la ubicación.';
                        break;
                }
                
                locationText.textContent = errorMessage;
                locationStatus.classList.add('location-error');
                updateSendButton();
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }
    
    // Obtener dirección a partir de coordenadas - FORMATO COLOQUIAL MEXICANO
    function getAddressFromCoordinates(lat, lng) {
        // Usar Nominatim (OpenStreetMap) para reverse geocoding gratuito
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`)
            .then(response => response.json())
            .then(data => {
                let direccionFormateada = '';
                
                if (data && data.address) {
                    const addr = data.address;
                    
                    // FORMATO COLOQUIAL MEXICANO: "calle [nombre] no. [número] [ciudad] [estado]"
                    
                    // 1. Calle/avenida
                    let calle = '';
                    if (addr.road) {
                        calle = addr.road;
                        if (!/^(calle|avenida|av\.|av |blvd|boulevard|cerrada|cerr\.|privada|priv\.)/i.test(calle)) {
                            calle = 'Calle ' + calle;
                        }
                    } else if (addr.pedestrian) {
                        calle = 'Andador ' + addr.pedestrian;
                    }
                    
                    // 2. Número exterior
                    if (addr.house_number) {
                        calle += ` no. ${addr.house_number}`;
                    }
                    
                    // 3. Colonia
                    let colonia = addr.suburb || addr.neighbourhood || '';
                    if (colonia) {
                        if (calle) calle += `, ${colonia}`;
                        else calle = colonia;
                    }
                    
                    // 4. Ciudad/Municipio
                    let ciudad = addr.city || addr.town || addr.village || addr.municipality || '';
                    
                    // 5. Estado
                    let estado = addr.state || '';
                    
                    // 6. Código postal
                    let cp = addr.postcode || '';
                    
                    // Construir dirección final
                    if (calle) {
                        direccionFormateada = calle;
                        if (ciudad && !direccionFormateada.includes(ciudad)) {
                            direccionFormateada += `, ${ciudad}`;
                        }
                        if (estado && !direccionFormateada.includes(estado)) {
                            direccionFormateada += `, ${estado}`;
                        }
                        if (cp) {
                            direccionFormateada += `, C.P. ${cp}`;
                        }
                    }
                }
                
                // Si no se pudo construir formato coloquial, usar display_name
                if (!direccionFormateada || direccionFormateada.trim().length < 10) {
                    if (data && data.display_name) {
                        // Limpiar y formatear display_name
                        direccionFormateada = data.display_name
                            .split(',')
                            .slice(0, 3) // Tomar solo los primeros 3 elementos
                            .join(', ')
                            .replace(/,\s*,/g, ',')
                            .trim();
                    } else {
                        direccionFormateada = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    }
                }
                
                locationText.textContent = `📍 ${direccionFormateada}`;
                locationStatus.classList.add('location-success');
                updateSendButton();
            })
            .catch(error => {
                // Si falla el reverse geocoding, mostrar coordenadas
                console.log('Error geocoding:', error);
                locationText.textContent = `📍 Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                locationStatus.classList.add('location-success');
                updateSendButton();
            });
    }
    
    // Botón para actualizar ubicación
    getLocationBtn.addEventListener('click', getLocation);
    
    // Actualizar estado del botón de enviar
    function updateSendButton() {
        sendWhatsApp.disabled = !userLocation || !selectedPizza;
    }
    
    // Enviar mensaje por WhatsApp
    sendWhatsApp.addEventListener('click', function() {
        if (!userLocation || !selectedPizza) return;
        
        const lat = userLocation.lat;
        const lng = userLocation.lng;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const locationDescription = locationText.textContent.replace('📍 ', '');
        
        // Construir mensaje para WhatsApp
        let message = `🍕 *PEDIDO DE PIZZA - DON GUISEPPE*\n\n`;
        message += `*Pizza solicitada:* ${selectedPizza}\n`;
        message += `*Precio:* $${selectedPrice} MXN\n\n`;
        message += `*📍 MI UBICACIÓN PARA ENTREGA:*\n`;
        message += `${locationDescription}\n`;
        message += `*Enlace de Google Maps:* ${mapsUrl}\n\n`;
        
        if (userMessage.value.trim()) {
            message += `*📝 INSTRUCCIONES ESPECIALES:*\n`;
            message += `${userMessage.value.trim()}\n\n`;
        }
        
        message += `*⏰ HORARIO DE ENTREGA:*\n`;
        message += `Lo antes posible\n\n`;
        message += `*📞 MIS DATOS DE CONTACTO:*\n`;
        message += `(Favor de contactarme para confirmar pedido y forma de pago)`;
        
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Cerrar modal
        pizzaModal.style.display = 'none';
        
        // Resetear formulario
        resetForm();
    });
    
    // También enviar con Enter en textarea
    userMessage.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && userLocation && selectedPizza) {
            e.preventDefault();
            sendWhatsApp.click();
        }
    });
    
    function resetForm() {
        userLocation = null;
        selectedPizza = null;
        selectedPrice = null;
        userMessage.value = '';
        locationText.textContent = 'Obteniendo ubicación...';
        locationStatus.classList.remove('location-success', 'location-error');
        orderSummary.style.display = 'none';
        
        // Deseleccionar todas las pizzas
        document.querySelectorAll('.pizza-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        updateSendButton();
    }
    
    // Actualizar botón cuando se escribe mensaje
    userMessage.addEventListener('input', updateSendButton);
    
    // Inicializar
    updateSendButton();
});
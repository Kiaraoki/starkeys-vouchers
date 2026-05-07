document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM (Inputs)
    const inputs = {
        orderNum: document.getElementById('order-num'),
        gameName: document.getElementById('game-name'),
        buyerName: document.getElementById('buyer-name'),
        platform: document.getElementById('platform'),
        amount: document.getElementById('amount'),
        productKey: document.getElementById('product-key'),
        voucherNote: document.getElementById('voucher-note'),
        imgUrl: document.getElementById('img-url')
    };

    // Referencias a los elementos del DOM (Displays)
    const displays = {
        orderNum: document.getElementById('display-order-num'),
        gameName: document.getElementById('display-game-name'),
        buyerName: document.getElementById('display-buyer'),
        platform: document.getElementById('display-platform'),
        amount: document.getElementById('display-amount'),
        productKey: document.getElementById('display-key'),
        voucherNote: document.getElementById('display-voucher-note'),
        date: document.getElementById('display-date'),
        gameImg: document.getElementById('display-img'),
        // Elementos específicos del Voucher
        voucherGameName: document.getElementById('voucher-display-game-name'),
        voucherGameImg: document.getElementById('voucher-display-img')
    };

    const fileUpload = document.getElementById('file-upload');
    const imgPreview = document.getElementById('game-img-preview');
    const imgPlaceholder = document.querySelector('.image-placeholder');
    const btnAutoSearch = document.getElementById('btn-auto-search');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const views = {
        invoice: document.getElementById('invoice-view'),
        voucher: document.getElementById('voucher-view')
    };

    // Configurar la fecha actual
    const now = new Date();
    displays.date.innerText = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    // Lógica principal de Sincronización de Datos (Inputs -> Displays)
    const sync = () => {
        displays.orderNum.innerText = inputs.orderNum.value || '#0000';
        displays.gameName.innerText = inputs.gameName.value || 'Nombre del Juego';
        displays.voucherGameName.innerText = inputs.gameName.value || 'Nombre del Juego';
        displays.buyerName.innerText = inputs.buyerName.value || '---';
        displays.amount.innerText = parseFloat(inputs.amount.value || 0).toFixed(2);
        displays.productKey.innerText = inputs.productKey.value || 'XXXX-XXXX-XXXX-XXXX';
        displays.voucherNote.innerText = inputs.voucherNote.value || 'Sigue las instrucciones en la eShop';
        
        // Sincronizar imagen mediante URL (si el campo no está vacío)
        if (inputs.imgUrl.value.trim() !== '') {
            updateImages(inputs.imgUrl.value.trim());
        }

        // Actualizar el texto y el color del badge según la plataforma elegida
        if (inputs.platform.value === 'switch1') {
            displays.platform.innerText = 'Nintendo Switch 1';
            displays.platform.className = 'platform-badge platform-switch1';
        } else {
            displays.platform.innerText = 'Nintendo Switch 2';
            displays.platform.className = 'platform-badge platform-switch2';
        }
    };

    // Escuchar cambios en todos los inputs para actualizar la vista previa en tiempo real
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', sync);
    });

    // Lógica para cambiar entre las pestañas (Vista Factura / Vista Voucher)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab === 'invoice') {
                views.invoice.style.display = 'block';
                views.voucher.style.display = 'none';
            } else {
                views.invoice.style.display = 'none';
                views.voucher.style.display = 'block';
            }
        });
    });

    // Lógica para procesar la subida manual de una imagen desde el dispositivo
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target.result;
                updateImages(src);
                // Limpiamos el campo de URL para evitar confusiones si el usuario sube un archivo
                inputs.imgUrl.value = '';
            };
            reader.readAsDataURL(file);
        }
    });

    const btnOpenSearch = document.getElementById('btn-open-search');
    const searchModal = document.getElementById('search-modal');
    const closeModal = document.getElementById('close-modal');
    const modalSearchInput = document.getElementById('modal-search-input');
    const modalSearchBtn = document.getElementById('modal-search-btn');
    const searchResults = document.getElementById('search-results');

    // Lógica para abrir/cerrar el buscador de imágenes
    btnOpenSearch.addEventListener('click', () => {
        searchModal.classList.add('active');
        modalSearchInput.value = inputs.gameName.value;
        if (modalSearchInput.value) performImageSearch();
    });

    closeModal.addEventListener('click', () => searchModal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === searchModal) searchModal.classList.remove('active'); });

    // Lógica de búsqueda en el modal
    modalSearchBtn.addEventListener('click', performImageSearch);
    modalSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performImageSearch(); });

    async function performImageSearch() {
        const query = modalSearchInput.value.trim();
        if (!query) return;

        searchResults.innerHTML = '<div class="search-loading">Buscando imágenes...</div>';

        try {
            // Usamos Google Images via proxy para obtener una lista de miniaturas
            const searchQuery = encodeURIComponent(query + " nintendo switch boxart square");
            const googleUrl = `https://www.google.com/search?q=${searchQuery}&udm=2&imgar=s`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(googleUrl)}`;

            const response = await fetch(proxyUrl);
            const data = await response.json();
            const html = data.contents;

            // Extraemos todas las miniaturas de Google
            const imgRegex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[^"&' ]+/g;
            const matches = [...new Set(html.match(imgRegex))]; // Usamos Set para evitar duplicados

            if (matches && matches.length > 0) {
                searchResults.innerHTML = '';
                matches.forEach(url => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `<img src="${url}" loading="lazy">`;
                    div.onclick = () => {
                        updateImages(url);
                        searchModal.classList.remove('active');
                    };
                    searchResults.appendChild(div);
                });
            } else {
                searchResults.innerHTML = '<div class="search-empty">No se encontraron imágenes. Prueba con otro nombre.</div>';
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            searchResults.innerHTML = '<div class="search-empty">Error al conectar. Verifica tu conexión o intenta más tarde.</div>';
        }
    }

    function updateImages(src) {
        imgPreview.src = src;
        imgPreview.style.display = 'block';
        imgPlaceholder.style.display = 'none';
        displays.gameImg.src = src;
        displays.voucherGameImg.src = src;
    }

    // Ejecutar una sincronización inicial al cargar la página
    sync();
});

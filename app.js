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

    // Lógica para descargar como PNG
    const btnSavePng = document.getElementById('btn-save-png');
    btnSavePng.addEventListener('click', () => {
        // Determinar qué vista está activa
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        const targetElement = activeTab === 'invoice' ? views.invoice : views.voucher;
        const fileName = activeTab === 'invoice' ? 'Factura' : 'Voucher';
        const gameName = inputs.gameName.value || 'Juego';

        // Opciones para html2canvas para asegurar alta calidad y fondos correctos
        html2canvas(targetElement, {
            scale: 2, // Mayor calidad
            backgroundColor: '#ffffff', // Fondo blanco para evitar transparencia
            useCORS: true, // Importante para imágenes externas
            logging: false,
            onclone: (clonedDoc) => {
                // Desactivar animaciones en el clon para evitar que se capture con opacidad 0
                const style = clonedDoc.createElement('style');
                style.innerHTML = '.invoice-frame { animation: none !important; opacity: 1 !important; transform: none !important; }';
                clonedDoc.head.appendChild(style);
            }
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${fileName}_${gameName.replace(/[^a-z0-9]/gi, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

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

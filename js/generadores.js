(function () {
    const $ = id => document.getElementById(id);
    const PT = 0.3528; // 1 pt en mm

    function libOk() {
        if (!window.jspdf) {
            alert('No se pudo cargar el generador de PDF. Revisá tu conexión y recargá la página.');
            return false;
        }
        return true;
    }

    /* ===== Helpers de texto en PDF ===== */

    // Busca el tamaño de letra más grande que entra en maxW x maxH
    function ajustar(doc, texto, maxW, maxH, max, min, bold) {
        max = Math.max(max, min);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        let size = max, lines = [''];
        for (; size >= min; size--) {
            doc.setFontSize(size);
            lines = doc.splitTextToSize(texto, maxW);
            const w = Math.max(...lines.map(l => doc.getTextWidth(l)));
            if (lines.length * size * PT * 1.15 <= maxH && w <= maxW) break;
        }
        return { lines, size: Math.max(size, min) };
    }

    // Dibuja texto centrado horizontal y verticalmente dentro de una zona
    function dibujar(doc, texto, cx, zonaY, zonaH, maxW, max, min, bold) {
        if (!texto) return;
        const r = ajustar(doc, texto, maxW, zonaH, max, min, bold);
        doc.setFontSize(r.size);
        const lh = r.size * PT * 1.15;
        let y = zonaY + (zonaH - lh * r.lines.length) / 2 + lh / 2;
        r.lines.forEach(l => {
            doc.text(l, cx, y, { align: 'center', baseline: 'middle' });
            y += lh;
        });
    }

    function entregar(doc, nombre, imprimir) {
        if (imprimir) {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else {
            doc.save(nombre + '.pdf');
        }
    }

    function slug(s) {
        return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function nuevoDoc() {
        return new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    }

    /* ===== 1) Cartel de texto ===== */

    const PRESETS = {
        horario: { t: 'Horario de atención', x: 'Lunes a Viernes\n9:00 a 13:00 y 17:00 a 21:00\n\nSábados\n9:00 a 13:00' },
        transferencia: { t: 'Aceptamos transferencias', x: 'Consultá nuestro alias\ny pagá desde tu celular' },
        oferta: { t: 'Oferta del día', x: 'Producto\n$XXX' }
    };

    document.querySelectorAll('.gen-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = PRESETS[btn.dataset.preset];
            $('cartel-titulo').value = p.t;
            $('cartel-texto').value = p.x;
        });
    });

    function crearCartel(imprimir) {
        if (!libOk()) return;
        const titulo = $('cartel-titulo').value.trim();
        const texto = $('cartel-texto').value.trim();
        if (!titulo && !texto) return alert('Escribí un título o un texto para el cartel.');

        const doc = nuevoDoc();
        const W = 210, H = 297, m = 20, maxW = W - 2 * m;
        doc.setTextColor(0);

        if ($('cartel-marco').checked) {
            doc.setDrawColor(0);
            doc.setLineWidth(1.5);
            doc.rect(8, 8, W - 16, H - 16);
        }

        if (titulo) {
            dibujar(doc, titulo, W / 2, 28, 46, maxW, 64, 22, true);
            doc.setDrawColor(0);
            doc.setLineWidth(0.8);
            doc.line(m, 82, W - m, 82);
        }

        if (texto) {
            const areaY = titulo ? 92 : 28;
            const areaH = H - 28 - areaY;
            const base = parseInt($('cartel-tamano').value, 10);
            let size = base, lines = [];
            doc.setFont('helvetica', 'normal');
            for (; size >= 12; size--) {
                doc.setFontSize(size);
                lines = [];
                texto.split('\n').forEach(p => {
                    p = p.trim();
                    lines.push(...(p ? doc.splitTextToSize(p, maxW) : ['']));
                });
                const w = Math.max(...lines.map(l => doc.getTextWidth(l)));
                if (lines.length * size * PT * 1.35 <= areaH && w <= maxW) break;
            }
            size = Math.max(size, 12);
            doc.setFontSize(size);
            const lh = size * PT * 1.35;
            let y = areaY + (areaH - lh * lines.length) / 2 + lh / 2;
            lines.forEach(l => {
                doc.text(l, W / 2, y, { align: 'center', baseline: 'middle' });
                y += lh;
            });
        }

        entregar(doc, 'cartel-' + (slug(titulo) || 'texto'), imprimir);
    }

    $('cartel-descargar').addEventListener('click', () => crearCartel(false));
    $('cartel-imprimir').addEventListener('click', () => crearCartel(true));

    /* ===== 2) Cartelitos de precios ===== */

    const LAYOUTS = {
        2: { c: 1, r: 2, n: 44, p: 130, d: 18 },
        4: { c: 2, r: 2, n: 28, p: 90, d: 12 },
        8: { c: 2, r: 4, n: 18, p: 54, d: 9 }
    };

    // "1500" -> "$1.500"; si no es un número (ej: "2x1") se deja tal cual
    function precioTxt(v) {
        v = v.trim();
        if (!v) return '';
        if (/^\$?\s*[\d.,]+$/.test(v)) {
            let n = v.replace(/[$\s]/g, '');
            if (n.includes(',')) n = n.replace(/\./g, '').replace(',', '.');
            else if (/^\d{1,3}(\.\d{3})+$/.test(n)) n = n.replace(/\./g, '');
            const num = parseFloat(n);
            if (!isNaN(num)) {
                const [e, d] = num.toFixed(2).split('.');
                return '$' + e.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d === '00' ? '' : ',' + d);
            }
        }
        return v;
    }

    const lista = $('cartelitos-lista');

    function agregarFila() {
        const f = document.createElement('div');
        f.className = 'cart-fila';
        f.innerHTML = `
            <input type="text" class="c-nombre" placeholder="Producto" maxlength="60">
            <input type="text" class="c-precio" inputmode="decimal" placeholder="Precio" maxlength="14">
            <input type="text" class="c-detalle" placeholder="Ej: x kg" maxlength="30">
            <label class="c-oferta"><input type="checkbox"> Oferta</label>
            <button type="button" class="calc-quitar" aria-label="Quitar producto">✕</button>`;
        f.querySelector('.calc-quitar').addEventListener('click', () => {
            f.remove();
            if (!lista.children.length) agregarFila();
        });
        lista.appendChild(f);
        return f;
    }

    function crearCartelitos(imprimir) {
        if (!libOk()) return;
        const items = [...lista.querySelectorAll('.cart-fila')].map(f => ({
            n: f.querySelector('.c-nombre').value.trim(),
            p: precioTxt(f.querySelector('.c-precio').value),
            d: f.querySelector('.c-detalle').value.trim(),
            o: f.querySelector('.c-oferta input').checked
        })).filter(i => i.n || i.p);

        if (!items.length) return alert('Cargá al menos un producto con nombre o precio.');

        const L = LAYOUTS[$('cartelitos-tamano').value];
        const doc = nuevoDoc();
        const M = 10, cw = (210 - 2 * M) / L.c, ch = (297 - 2 * M) / L.r, por = L.c * L.r;

        items.forEach((it, i) => {
            if (i > 0 && i % por === 0) doc.addPage();
            const k = i % por;
            const x = M + (k % L.c) * cw;
            const y = M + Math.floor(k / L.c) * ch;
            const cx = x + cw / 2;

            // Borde punteado para recortar
            doc.setDrawColor(150);
            doc.setLineWidth(0.3);
            doc.setLineDashPattern([2, 2], 0);
            doc.rect(x, y, cw, ch);
            doc.setLineDashPattern([], 0);

            const pad = cw * 0.05, ix = x + pad, iw = cw - 2 * pad;
            let iy = y + pad, ih = ch - 2 * pad;
            doc.setTextColor(0);

            if (it.o) {
                const bh = ih * 0.14;
                doc.setFillColor(0);
                doc.rect(ix, iy, iw, bh, 'F');
                doc.setTextColor(255);
                dibujar(doc, 'OFERTA', cx, iy, bh, iw * 0.9, L.n, 8, true);
                doc.setTextColor(0);
                iy += bh;
                ih -= bh;
            }

            dibujar(doc, it.n, cx, iy, ih * 0.34, iw, L.n, 8, true);
            dibujar(doc, it.p, cx, iy + ih * 0.34, ih * 0.5, iw, L.p, 16, true);
            dibujar(doc, it.d, cx, iy + ih * 0.84, ih * 0.16, iw, L.d, 6, false);
        });

        entregar(doc, 'cartelitos-precios', imprimir);
    }

    $('cartelitos-agregar').addEventListener('click', () => agregarFila().querySelector('.c-nombre').focus());
    $('cartelitos-descargar').addEventListener('click', () => crearCartelitos(false));
    $('cartelitos-imprimir').addEventListener('click', () => crearCartelitos(true));
    for (let i = 0; i < 3; i++) agregarFila();

    /* ===== 3) Cartel de cobro con el QR oficial ===== */

let qrImg = null; // { data, w, h, tipo }

$('qr-archivo').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type)) {
        alert('Subí una imagen PNG o JPG. Si tu QR está en otro formato, sacale una captura de pantalla.');
        e.target.value = '';
        return;
    }
    const rd = new FileReader();
    rd.onload = () => {
        const img = new Image();
        img.onload = () => {
            qrImg = { data: rd.result, w: img.width, h: img.height, tipo: f.type === 'image/png' ? 'PNG' : 'JPEG' };
            $('qr-preview-img').src = rd.result;
            $('qr-preview-img').hidden = false;
            $('qr-vacio').hidden = true;
        };
        img.src = rd.result;
    };
    rd.readAsDataURL(f);
});

function cartelQR(doc, x, y, w, h, tit, alias, nombre) {
    const sc = h / 297, cx = x + w / 2;
    doc.setTextColor(0);
    dibujar(doc, tit, cx, y + h * 0.04, h * 0.13, w * 0.9, 46 * sc, 14 * sc, true);

    // La imagen del QR se ajusta sin deformarse
    const r = Math.min((w * 0.8) / qrImg.w, (h * 0.52) / qrImg.h);
    const iw = qrImg.w * r, ih = qrImg.h * r, qy = y + h * 0.19;
    doc.addImage(qrImg.data, qrImg.tipo, cx - iw / 2, qy, iw, ih);

    let ay = qy + ih + h * 0.02;
    if (alias) {
        dibujar(doc, 'ALIAS', cx, ay, h * 0.04, w * 0.9, 14 * sc, 6, false);
        dibujar(doc, alias, cx, ay + h * 0.05, h * 0.1, w * 0.9, 50 * sc, 12, true);
        ay += h * 0.16;
    }
    dibujar(doc, nombre, cx, ay, h * 0.06, w * 0.9, 22 * sc, 8, false);
}

function crearQR(imprimir) {
    if (!libOk()) return;
    if (!qrImg) return alert('Subí primero la imagen de tu QR.');

    const tit = $('qr-titulo').value.trim() || 'Pagá con QR';
    const alias = $('qr-alias').value.trim();
    const nombre = $('qr-nombre').value.trim();
    const doc = nuevoDoc();

    if ($('qr-tamano').value === '1') {
        cartelQR(doc, 10, 10, 190, 277, tit, alias, nombre);
    } else {
        cartelQR(doc, 10, 5, 190, 138.5, tit, alias, nombre);
        cartelQR(doc, 10, 153.5, 190, 138.5, tit, alias, nombre);
        doc.setDrawColor(150);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(5, 148.5, 205, 148.5);
        doc.setLineDashPattern([], 0);
    }

    entregar(doc, 'cartel-qr-' + (slug(alias || nombre) || 'cobro'), imprimir);
}

$('qr-descargar').addEventListener('click', () => crearQR(false));
$('qr-imprimir').addEventListener('click', () => crearQR(true));
})();
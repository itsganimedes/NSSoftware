/* ===== Utilidades ===== */
const formatoPesos = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// Acepta "1500", "1.500,50", "1500,5" o "1500.5"
function leerNumero(valor) {
    if (!valor) return NaN;
    let v = String(valor).trim().replace(/\s/g, '');
    if (v.includes(',')) {
        v = v.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(v);
}

/* ===== Calculadora de precio de venta ===== */
(function () {
    const costoEl = document.getElementById('precio-costo');
    const margenEl = document.getElementById('precio-margen');
    const ivaEl = document.getElementById('precio-iva');
    const tipoEl = document.getElementById('precio-tipo');
    const resultadoEl = document.getElementById('precio-resultado');

    function calcular() {
        const costo = leerNumero(costoEl.value);
        const margen = leerNumero(margenEl.value);
        const iva = parseFloat(ivaEl.value);
        const tipo = tipoEl.value;

        if (isNaN(costo) || isNaN(margen) || costo < 0 || margen < 0) {
            resultadoEl.innerHTML = '<p class="calc-vacio">Completá el costo y el margen para ver el resultado.</p>';
            return;
        }

        if (tipo === 'venta' && margen >= 100) {
            resultadoEl.innerHTML = '<p class="calc-error">Si el margen es sobre el precio de venta, tiene que ser menor a 100%.</p>';
            return;
        }

        // Precio neto (sin IVA)
        const neto = tipo === 'costo'
            ? costo * (1 + margen / 100)
            : costo / (1 - margen / 100);

        const montoIva = neto * (iva / 100);
        const final = neto + montoIva;
        const ganancia = neto - costo;
        const margenReal = neto > 0 ? (ganancia / neto) * 100 : 0;

        const lineaIva = iva > 0
            ? `<li><span>IVA (${String(iva).replace('.', ',')}%)</span><span>${formatoPesos.format(montoIva)}</span></li>`
            : '';

        resultadoEl.innerHTML = `
            <div class="calc-precio-final">
                <small>Vendelo a</small>
                <strong>${formatoPesos.format(final)}</strong>
            </div>
            <ul class="calc-detalle">
                <li><span>Costo</span><span>${formatoPesos.format(costo)}</span></li>
                <li><span>Ganancia por unidad</span><span>${formatoPesos.format(ganancia)}</span></li>
                <li><span>Precio sin IVA</span><span>${formatoPesos.format(neto)}</span></li>
                ${lineaIva}
                <li><span>Margen sobre la venta</span><span>${margenReal.toFixed(1).replace('.', ',')}%</span></li>
            </ul>
        `;
    }

    [costoEl, margenEl, ivaEl, tipoEl].forEach(el => {
        el.addEventListener('input', calcular);
        el.addEventListener('change', calcular);
    });
})();

/* ===== Calculadora de aumento de precios ===== */
(function () {
    const porcentajeEl = document.getElementById('aumento-porcentaje');
    const redondeoEl = document.getElementById('aumento-redondeo');
    const listaEl = document.getElementById('aumento-lista');
    const agregarBtn = document.getElementById('aumento-agregar');

    function aplicarRedondeo(valor, paso) {
        if (!paso || paso <= 0) return valor;
        return Math.round(valor / paso) * paso;
    }

    function crearFila() {
        const fila = document.createElement('div');
        fila.className = 'calc-producto';
        fila.innerHTML = `
            <input type="text" class="calc-nombre" placeholder="Producto">
            <input type="text" class="calc-actual" inputmode="decimal" placeholder="$ actual">
            <span class="calc-nuevo">—</span>
            <button type="button" class="calc-quitar" aria-label="Quitar producto">✕</button>
        `;
        fila.querySelector('.calc-quitar').addEventListener('click', () => {
            fila.remove();
            if (!listaEl.children.length) listaEl.appendChild(crearFila());
        });
        fila.querySelector('.calc-actual').addEventListener('input', calcular);
        listaEl.appendChild(fila);
        return fila;
    }

    function calcular() {
        const pct = leerNumero(porcentajeEl.value);
        const paso = parseFloat(redondeoEl.value);

        listaEl.querySelectorAll('.calc-producto').forEach(fila => {
            const actual = leerNumero(fila.querySelector('.calc-actual').value);
            const salida = fila.querySelector('.calc-nuevo');

            if (isNaN(pct) || isNaN(actual)) {
                salida.textContent = '—';
                return;
            }

            const nuevo = aplicarRedondeo(actual * (1 + pct / 100), paso);
            salida.textContent = formatoPesos.format(nuevo);
        });
    }

    agregarBtn.addEventListener('click', () => {
        const fila = crearFila();
        fila.querySelector('.calc-nombre').focus();
    });
    porcentajeEl.addEventListener('input', calcular);
    redondeoEl.addEventListener('change', calcular);

    // Arranca con 3 filas vacías
    for (let i = 0; i < 3; i++) crearFila();
})();
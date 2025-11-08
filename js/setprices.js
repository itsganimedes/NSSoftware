// fetch("http://localhost:3000/precios")
//     .then(res => res.json())
//     .then(data => {
//         const format = new Intl.NumberFormat('es-AR', { 
//         style: 'currency', 
//         currency: 'ARS',
//         maximumFractionDigits: 0
//         });

//         const ids = {
//         p_cashreg: data.cashreg,
//         p_ggym: data.ggym,
//         p_poskoe: data.poskoe,
//         p_poskopro: data.poskopro
//         };

//         for (const [id, valor] of Object.entries(ids)) {
//         const el = document.getElementById(id);
//         if (el) el.textContent = format.format(valor);
//         }
// });

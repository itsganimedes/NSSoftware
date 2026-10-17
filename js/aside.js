(function () {
    const links = document.querySelectorAll('.aside-link');
    const paneles = document.querySelectorAll('.panel');
    const porDefecto = 'calculadoras';

    function mostrar(id) {
        // Si el hash no existe, vuelve al panel por defecto
        if (!document.getElementById(id) || !document.getElementById(id).classList.contains('panel')) {
            id = porDefecto;
        }

        paneles.forEach(p => p.classList.toggle('activo', p.id === id));

        links.forEach(l => {
            const activo = l.dataset.target === id;
            l.classList.toggle('activo', activo);
            if (activo) {
                l.setAttribute('aria-current', 'page');
            } else {
                l.removeAttribute('aria-current');
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const id = link.dataset.target;
            mostrar(id);
            history.replaceState(null, '', '#' + id);
        });
    });

    // Permite entrar directo con info.html#plantillas, etc.
    window.addEventListener('hashchange', () => mostrar(location.hash.slice(1)));
    mostrar(location.hash.slice(1) || porDefecto);
})();
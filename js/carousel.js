document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carouselTrack');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('carouselDots');
    const captions = Array.from(document.getElementById('captionContainer').children);

    let currentIndex = 0;

    // Crear los puntos indicadores (dots) dinámicamente según la cantidad de imágenes
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Ir a diapositiva ${index + 1}`);
        dot.addEventListener('click', () => {
            moveToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function updateCarousel(index) {
        // Mover el carrusel horizontalmente
        track.style.transform = `translateX(-${index * 100}%)`;

        // Actualizar estados activos de los puntos
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });

        // Actualizar descripciones vinculadas
        captions.forEach((caption, idx) => {
            caption.classList.toggle('active-caption', idx === index);
        });
    }

    function moveToSlide(index) {
        currentIndex = index;
        updateCarousel(currentIndex);
    }

    // Botón Siguiente
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        moveToSlide(currentIndex);
    });

    // Botón Anterior
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        moveToSlide(currentIndex);
    });
});
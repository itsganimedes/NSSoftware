const burgerBtn = document.getElementById('burger-btn');
const navLinks = document.getElementById('nav-links');

burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('open');
    navLinks.classList.toggle('active');
});

// Cierra el menú automáticamente al hacer clic en cualquier link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        burgerBtn.classList.remove('open');
        navLinks.classList.remove('active');
    });
});
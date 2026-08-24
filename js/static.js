const words = ["Desarrollo a Medida", "Sistemas Escalables", "APIs & Integraciones", "Interfaces Cómodas"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const erasingSpeed = 50;
const delayBetweenWords = 2000;

const textElement = document.getElementById("typing-text");

function typeEffect() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
        textElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let currentSpeed = isDeleting ? erasingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
        currentSpeed = delayBetweenWords;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        currentSpeed = 500;
    }

    setTimeout(typeEffect, currentSpeed);
}

document.addEventListener("DOMContentLoaded", typeEffect);
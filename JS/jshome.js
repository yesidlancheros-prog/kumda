//seccion de los planes (carrusel)
const track = document.querySelector('.carousel-track');
const cards = Array.from(track.children);
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');

let currentIndex = 0;
const visibleCards = 3;
const cardWidth = cards[0].getBoundingClientRect().width + 32;

function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

nextButton.addEventListener('click', () => {
  if (currentIndex < cards.length - visibleCards) {
    currentIndex++;
    updateCarousel();
  }
});

prevButton.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
});

// Animación al hacer scroll (para sedes)
const sedesCards = document.querySelectorAll('.sedes .section-card');

window.addEventListener('scroll', () => {
  sedesCards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < window.innerHeight - 100) {
      card.classList.add('visible');
    }
  });
});

// Cerrar menú en móvil 
const menuToggle = document.getElementById('menu-toggle');
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (menuToggle?.checked) menuToggle.checked = false;
  });
});
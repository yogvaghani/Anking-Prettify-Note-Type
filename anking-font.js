(function initTiltEffect() {
  document.addEventListener("DOMContentLoaded", function () {
    const card = document.querySelector(".prettify-flashcard");
    if (!card) return;

    const resetTilt = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = y * -20;
      const rotateY = x * 20;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", resetTilt);
  });
})();

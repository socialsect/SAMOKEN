// Corporate Scroll Animations
export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe all elements with data-animate attribute
  const animatedElements = document.querySelectorAll("[data-animate]");
  animatedElements.forEach((el) => observer.observe(el));

  return observer;
};

// Add floating shapes to corporate sections
export const addFloatingShapes = () => {
  const corporateSections = document.querySelectorAll(".corporate-bg, .corporate-hero");
  
  corporateSections.forEach((section) => {
    if (!section.querySelector(".floating-shapes")) {
      const shapesContainer = document.createElement("div");
      shapesContainer.className = "floating-shapes";
      
      // Add floating shapes
      for (let i = 1; i <= 3; i++) {
        const shape = document.createElement("div");
        shape.className = `floating-shape floating-shape-${i}`;
        shapesContainer.appendChild(shape);
      }
      
      section.appendChild(shapesContainer);
    }
  });
};

// Initialize all corporate animations
export const initCorporateAnimations = () => {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initScrollAnimations();
      addFloatingShapes();
    });
  } else {
    initScrollAnimations();
    addFloatingShapes();
  }
};

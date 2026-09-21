(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "≡";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "≡";
      });
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  if (reveals.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el, i) => {
      const sectionIndex = el.closest(".landing-section") 
        ? Array.from(document.querySelectorAll(".landing-section")).indexOf(el.closest(".landing-section"))
        : 0;
      const localIndex = Array.from(el.closest(".landing-section, .section, main")?.querySelectorAll(".reveal") || []).indexOf(el);
      el.style.transitionDelay = `${Math.min(0.1 + localIndex * 0.1, 0.5)}s`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const mainNav = document.getElementById("mainNav");
  if (mainNav && document.body.classList.contains("page-home")) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
      const scrollY = window.scrollY;
      const heroSection = document.getElementById("sectionHero");
      const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
      
      if (scrollY > heroHeight * 0.6) {
        mainNav.classList.add("nav-scrolled");
      } else {
        mainNav.classList.remove("nav-scrolled");
      }
      
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });
  }

  const scrollHint = document.querySelector(".section-hero .scroll-hint");
  if (scrollHint) {
    scrollHint.addEventListener("click", () => {
      const worksSection = document.getElementById("sectionWorks");
      if (worksSection) {
        worksSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
    scrollHint.style.cursor = "pointer";
  }
})();

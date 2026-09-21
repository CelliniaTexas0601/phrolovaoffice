(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHomePage = document.body.classList.contains("page-home");

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

  if (isHomePage) {
    document.documentElement.classList.add("snap-scroll");
  }

  const reveals = document.querySelectorAll(".reveal");
  
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
      const localIndex = Array.from(el.closest(".landing-section, .section, main")?.querySelectorAll(".reveal") || []).indexOf(el);
      el.style.transitionDelay = `${Math.min(0.1 + localIndex * 0.1, 0.5)}s`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const mainNav = document.getElementById("mainNav");
  if (mainNav && isHomePage) {
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

  if (isHomePage) {
    const sections = document.querySelectorAll(".landing-section");
    if (sections.length > 1) {
      const progressContainer = document.createElement("nav");
      progressContainer.className = "scroll-progress";
      progressContainer.setAttribute("aria-label", "页面导航");
      
      const sectionLabels = {
        "sectionHero": "Hero",
        "sectionWorks": "Works",
        "sectionExplore": "Explore",
        "sectionContact": "Contact"
      };
      
      sections.forEach((section, index) => {
        const dot = document.createElement("button");
        dot.className = "scroll-progress-dot";
        dot.setAttribute("data-label", sectionLabels[section.id] || `Section ${index + 1}`);
        dot.setAttribute("aria-label", `跳转到 ${sectionLabels[section.id] || `区块 ${index + 1}`}`);
        dot.addEventListener("click", () => {
          section.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        });
        progressContainer.appendChild(dot);
      });
      
      document.body.appendChild(progressContainer);
      
      let progressTicking = false;
      const updateProgress = () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const dots = progressContainer.querySelectorAll(".scroll-progress-dot");
        
        if (scrollY > viewportHeight * 0.3) {
          progressContainer.classList.add("is-visible");
        } else {
          progressContainer.classList.remove("is-visible");
        }
        
        let activeIndex = 0;
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.3) {
            activeIndex = index;
          }
        });
        
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === activeIndex);
        });
        
        progressTicking = false;
      };
      
      window.addEventListener("scroll", () => {
        if (!progressTicking) {
          requestAnimationFrame(updateProgress);
          progressTicking = true;
        }
      }, { passive: true });
      
      updateProgress();
    }
  }
})();

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
      const heroSection = document.getElementById("home");
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
      const nextSection = document.getElementById("arknights");
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
    scrollHint.style.cursor = "pointer";
  }

  if (isHomePage) {
    const sections = document.querySelectorAll(".landing-section");
    const navLinks = document.querySelectorAll(".home-top-nav .nav-link");
    
    const sectionIds = ["home", "arknights", "endfield", "wuthering", "others"];
    
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.slice(1);
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
          }
        }
      });
    });

    let navTicking = false;
    const updateActiveNav = () => {
      const viewportHeight = window.innerHeight;
      let activeId = "home";
      
      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= viewportHeight * 0.4 && rect.bottom > viewportHeight * 0.4) {
            activeId = id;
          }
        }
      });
      
      navLinks.forEach((link) => {
        const linkSection = link.getAttribute("data-section") || link.getAttribute("href")?.slice(1);
        if (linkSection === activeId) {
          link.classList.add("is-active");
        } else {
          link.classList.remove("is-active");
        }
      });
      
      navTicking = false;
    };

    window.addEventListener("scroll", () => {
      if (!navTicking) {
        requestAnimationFrame(updateActiveNav);
        navTicking = true;
      }
    }, { passive: true });

    updateActiveNav();

    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        setTimeout(() => {
          targetSection.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
    }

    if (sections.length > 1) {
      const progressContainer = document.createElement("nav");
      progressContainer.className = "scroll-progress";
      progressContainer.setAttribute("aria-label", "页面导航");
      
      const sectionLabels = {
        "home": "主页",
        "arknights": "明日方舟",
        "endfield": "终末地",
        "wuthering": "鸣潮",
        "others": "其他"
      };
      
      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const dot = document.createElement("button");
          dot.className = "scroll-progress-dot";
          dot.setAttribute("data-section", id);
          dot.setAttribute("data-label", sectionLabels[id] || id);
          dot.setAttribute("aria-label", `跳转到 ${sectionLabels[id] || id}`);
          dot.addEventListener("click", () => {
            section.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
          });
          progressContainer.appendChild(dot);
        }
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
        
        let activeId = "home";
        sectionIds.forEach((id) => {
          const section = document.getElementById(id);
          if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.3) {
              activeId = id;
            }
          }
        });
        
        dots.forEach((dot) => {
          const dotSection = dot.getAttribute("data-section");
          dot.classList.toggle("is-active", dotSection === activeId);
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

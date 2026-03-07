const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const backToTop = document.querySelector('.back-to-top');
const revealItems = document.querySelectorAll('.reveal');
const form = document.querySelector('.quote-form');
const statusMessage = document.querySelector('.form-status');

// Mobile navigation toggle
menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

// Close mobile menu after selecting a link
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

// Sticky header style + back-to-top visibility
const handleScroll = () => {
  const scrolled = window.scrollY > 14;
  header?.classList.toggle('scrolled', scrolled);
  backToTop?.classList.toggle('show', window.scrollY > 420);
};
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// Active navigation highlighting
const sections = [...document.querySelectorAll('main section[id]')];
const updateActiveLink = () => {
  const scrollPosition = window.scrollY + 120;
  let activeId = '';

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
};
window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// Back to top
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Reveal-on-scroll animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);
revealItems.forEach((item) => observer.observe(item));

// FAQ accordion behavior (one open at a time)
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

// Form validation + simulated success flow
form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach((field) => {
    const input = field;
    if (!input.value.trim()) {
      isValid = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  });

  const emailInput = form.querySelector('#email');
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
  if (!emailIsValid) {
    isValid = false;
    emailInput.setAttribute('aria-invalid', 'true');
  }

  if (!isValid) {
    statusMessage.textContent = 'Please complete all required fields and enter a valid email address.';
    statusMessage.className = 'form-status error';
    return;
  }

  statusMessage.textContent = 'Thank you. Your quote request has been received. Our team will contact you shortly.';
  statusMessage.className = 'form-status success';
  form.reset();
});

// Dynamic year
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

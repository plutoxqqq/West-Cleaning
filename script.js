const root = document.documentElement;
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('#theme-toggle');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const backToTop = document.querySelector('.back-to-top');
const form = document.querySelector('.quote-form');
const statusMessage = document.querySelector('.form-status');
const revealTargets = document.querySelectorAll('.reveal');

// Theme setup
const savedTheme = localStorage.getItem('west-cleaning-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', initialTheme);

const updateThemeButton = () => {
  const dark = root.getAttribute('data-theme') === 'dark';
  themeToggle?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle?.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
};
updateThemeButton();

themeToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('west-cleaning-theme', next);
  updateThemeButton();
});

// Mobile menu
menuToggle?.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

// Scroll behavior
const onScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 10);
  backToTop?.classList.toggle('show', y > 350);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Active nav links
const sections = [...document.querySelectorAll('main section[id]')];
const markActiveNav = () => {
  const position = window.scrollY + 130;
  let activeId = '';

  sections.forEach((section) => {
    if (position >= section.offsetTop) activeId = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
};
window.addEventListener('scroll', markActiveNav, { passive: true });
markActiveNav();

// Back to top
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Reveal animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((target) => observer.observe(target));

// FAQ one-at-a-time behavior
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

// Form validation
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  let valid = true;

  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.setAttribute('aria-invalid', 'true');
      valid = false;
    } else {
      field.removeAttribute('aria-invalid');
    }
  });

  const emailInput = form.querySelector('#email');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
  if (!emailOk) {
    emailInput.setAttribute('aria-invalid', 'true');
    valid = false;
  }

  if (!valid) {
    statusMessage.textContent = 'Please complete all required fields and provide a valid email address.';
    statusMessage.className = 'form-status error';
    return;
  }

  statusMessage.textContent = 'Thank you. Your quote request has been submitted. Our team will contact you shortly.';
  statusMessage.className = 'form-status success';
  form.reset();
});

// Dynamic year
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const root = document.documentElement;
const header = document.querySelector('.site-header');
const themeToggle = document.querySelector('#theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const backToTop = document.querySelector('.back-to-top');
const siteNavLinks = [...document.querySelectorAll('.site-nav a')];

const savedTheme = localStorage.getItem('west-cleaning-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));

const syncThemeButton = () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (!themeToggle) return;
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
};
syncThemeButton();

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', nextTheme);
  localStorage.setItem('west-cleaning-theme', nextTheme);
  syncThemeButton();
});

menuToggle?.addEventListener('click', () => {
  const open = siteNav?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

siteNavLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
siteNavLinks.forEach((link) => {
  const href = link.getAttribute('href');
  if (href && href.endsWith('.html')) {
    link.classList.toggle('active', href === currentPage);
  }
});

const onScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 6);
  backToTop?.classList.toggle('show', y > 340);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const revealTargets = document.querySelectorAll('.reveal');
if (revealTargets.length) {
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
}

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const form = document.querySelector('.quote-form');
const status = document.querySelector('.form-status');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach((field) => {
    const ok = field.value.trim().length > 0;
    field.toggleAttribute('aria-invalid', !ok);
    if (!ok) valid = false;
  });

  const emailInput = form.querySelector('#email');
  if (emailInput) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    emailInput.toggleAttribute('aria-invalid', !emailOk);
    if (!emailOk) valid = false;
  }

  if (!status) return;
  if (!valid) {
    status.textContent = 'Please complete all required fields with valid information.';
    status.className = 'form-status error';
    return;
  }

  status.textContent = 'Thank you. Your request has been submitted successfully. Our team will contact you soon.';
  status.className = 'form-status success';
  form.reset();
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

// ===== Typing Effect for Hero Role =====
const roles = [
    "Founder's Office",
    "Product & Operations",
    "Growth & Go-to-Market",
    "Business Analyst",
    "0 to 1 Operator"
];
const roleText = document.getElementById('roleText');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimer;

function typeRole() {
    if (motionQuery.matches) {
        roleText.textContent = roles[0];
        return;
    }
    const current = roles[roleIndex];
    if (isDeleting) {
        roleText.textContent = current.substring(0, charIndex--);
        if (charIndex < 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeTimer = setTimeout(typeRole, 400);
            return;
        }
        typeTimer = setTimeout(typeRole, 40);
    } else {
        roleText.textContent = current.substring(0, charIndex++);
        if (charIndex > current.length) {
            isDeleting = true;
            typeTimer = setTimeout(typeRole, 2000);
            return;
        }
        typeTimer = setTimeout(typeRole, 80);
    }
}
typeRole();
motionQuery.addEventListener('change', event => {
    clearTimeout(typeTimer);
    roleIndex = 0;
    charIndex = 0;
    isDeleting = false;
    roleText.textContent = event.matches ? roles[0] : '';
    if (!event.matches) typeRole();
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
    // Navbar background
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Progress bar
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / scrollHeight) * 100;
    progressBar.style.width = progress + '%';
});

// ===== Mobile Menu Toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
}

function updateThemeLabel() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
}
updateThemeLabel();

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    updateThemeLabel();
});

// ===== Reveal on Scroll =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== Animated Counters =====
const counters = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const decimals = parseInt(el.dataset.decimals) || 0;
            let current = 0;
            const duration = 1500;
            const startTime = performance.now();

            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                current = target * eased;
                el.textContent = current.toFixed(decimals) + suffix;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = target.toFixed(decimals) + suffix;
                }
            }
            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

// ===== Project Case Study Modals =====
document.querySelectorAll('[data-case-study]').forEach(trigger => {
    const dialog = document.getElementById(trigger.dataset.caseStudy);
    if (!dialog) return;
    trigger.addEventListener('click', () => {
        dialog.showModal();
        dialog.querySelector('.case-study-inner').scrollTop = 0;
        document.body.classList.add('modal-open');
    });
});

document.querySelectorAll('dialog.case-study').forEach(dialog => {
    dialog.querySelector('.case-study-close').addEventListener('click', () => dialog.close());
    // Clicks on the <dialog> element itself (not its content) land on the backdrop.
    dialog.addEventListener('click', e => {
        if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
});

document.querySelectorAll('.case-study-shot img').forEach(img => {
    const showImage = () => img.closest('.case-study-shot').classList.add('has-image');
    if (img.complete && img.naturalWidth > 0) showImage();
    else img.addEventListener('load', showImage);
});

// ===== Holographic Depth Interactions =====
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const depthCards = document.querySelectorAll(
    '.about-card, .skill-card, .project-card, .edu-card, .contact-card'
);

if (canHover && !motionQuery.matches) {
    depthCards.forEach(card => {
        card.classList.add('tilt-ready');
        let frame;

        card.addEventListener('pointermove', event => {
            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 4;
                const rotateX = (0.5 - y) * 4;

                card.style.setProperty('--glow-x', `${x * 100}%`);
                card.style.setProperty('--glow-y', `${y * 100}%`);
                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
        }, { passive: true });

        card.addEventListener('pointerleave', () => {
            if (frame) cancelAnimationFrame(frame);
            card.style.transform = '';
            card.style.removeProperty('--glow-x');
            card.style.removeProperty('--glow-y');
        });
    });

    const heroInterface = document.querySelector('.hero-interface');
    const hero = document.querySelector('.hero');
    if (heroInterface && hero) {
        hero.addEventListener('pointermove', event => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            heroInterface.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            heroInterface.style.transform = '';
        });
    }
}

// Close mobile navigation with Escape and when moving to desktop.
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
    }
});
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}, { passive: true });

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navItems.forEach(item => {
        item.style.color = '';
        if (item.getAttribute('href') === '#' + current) {
            item.style.color = 'var(--text)';
        }
    });
});

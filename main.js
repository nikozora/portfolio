// Slideshow logic
document.querySelectorAll('.project-image').forEach(function(container) {
    const slides = container.querySelectorAll('.slide-img');
    if (slides.length < 2) return; // Only run slideshow if more than one slide

    let current = 0;
    slides.forEach((img, i) => {
        img.classList.toggle('active', i === 0);
    });

    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 2000);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navigation
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(15, 15, 35, 0.98)';
    } else {
        nav.style.background = 'rgba(15, 15, 35, 0.95)';
    }
});


// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-card, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Timeline animation observer
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, { threshold: 0.1 });

// Other Projects Scroll Animation
function observeOtherProjects() {
    const otherProjectCards = document.querySelectorAll('.other-project-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    otherProjectCards.forEach(card => {
        observer.observe(card);
    });
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', observeOtherProjects);

document.querySelectorAll('.timeline-item').forEach(item => {
    timelineObserver.observe(item);
});

// Resume download/open function
function downloadResume() {
    window.open('assets/Resume.pdf', '_blank');
}
// Hamburger Menu Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.querySelector('body');

    // Function to close the menu
    function closeMenu() {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        body.classList.remove('nav-open');
    }

    // Toggle logic for the hamburger icon
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('open');
        body.classList.toggle('nav-open'); // To prevent scrolling behind the menu
    });

    // Close menu when a link is clicked (for smooth scrolling)
    navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when the CV/Resume button is clicked
    navLinks.querySelector('.resume-btn').addEventListener('click', closeMenu);
});
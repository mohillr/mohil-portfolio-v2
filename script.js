emailjs.init("BwXsl_1EgReOL4Apr");

const supabaseUrl = "https://ipfxklpmfzmkrbsfluig.supabase.co";
const supabaseKey = "sb_publishable_sF3CDeHMtqLudsl1cVW1Nw_JhwxX3L-";

// safety check (IMPORTANT FIX)
if (!window.supabase) {
    throw new Error("Supabase library not loaded. Check CDN script.");
}

// create client
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase loaded:", client);

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Smooth scroll to section
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
}

// Mobile menu toggle
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('active');
    }
});

// Contact form handling
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById('contactForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(this);

        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        const formMessage = document.getElementById('formMessage');

        const { error } = await client
            .from('contacts')
            .insert([
                {
                    name,
                    email,
                    message
                }
            ]);
        if (error) {
            console.error(error);
            formMessage.textContent = 'Failed to send message';
            formMessage.style.display = 'block';
        } else {

            // ✅ STEP 7: SEND EMAIL (ADD HERE)
            emailjs.send("service_sdugm3b", "template_0k8przf", {
                name: name,
                email: email,
                message: message
            }).then(() => {
                console.log("Email sent successfully!");
            }).catch((err) => {
                console.error("EmailJS error:", err);
            });

            formMessage.textContent = '✓ Message sent successfully!';
            formMessage.style.display = 'block';

            this.reset();
        }
    });

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

// Observe skill cards and timeline items
document.querySelectorAll('.skill-card, .timeline-item').forEach(el => {
    observer.observe(el);
});

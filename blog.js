// تهيئة i18next لدعم اللغات
i18next.init({
    lng: navigator.language.startsWith('ar') ? 'ar' : 'en',
    resources: {
        ar: {
            translation: {
                blogTitle: "مدونة T2 كاش",
                article1Title: "ما هو البلوكتشين وكيف يعمل؟",
                article2Title: "لماذا USDT هو الخيار الأمثل للتداول؟",
                article3Title: "البيتكوين: الذهب الرقمي",
                article4Title: "إيثريوم والعقود الذكية",
                article5Title: "كيف تبدأ تداول العملات الرقمية؟",
                footerText: "جميع الحقوق محفوظة © 2025 T2Cash",
                homeLink: "العودة إلى الصفحة الرئيسية"
            }
        },
        en: {
            translation: {
                blogTitle: "T2 Cash Blog",
                article1Title: "What is Blockchain and How Does It Work?",
                article2Title: "Why USDT is the Best Choice for Trading?",
                article3Title: "Bitcoin: The Digital Gold",
                article4Title: "Ethereum and Smart Contracts",
                article5Title: "How to Start Trading Cryptocurrencies?",
                footerText: "All Rights Reserved © 2025 T2Cash",
                homeLink: "Back to Home"
            }
        }
    }
}, function(err, t) {
    updateContent();
});

// تحديث النصوص المترجمة
function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = i18next.t(key);
    });
}

// تهيئة Particles.js
particlesJS("particles-js", {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#4f46e5" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#4f46e5", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 3, direction: "none", random: false }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
});
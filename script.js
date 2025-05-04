// تهيئة Particles.js للخلفية الديناميكية
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

// منطق الحاسبة
let mode = "buy";
const buyRate = 50; // سعر الشراء (1 USDT = 50 جنيه)
const sellRate = 48; // سعر البيع (1 USDT = 48 جنيه)

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`button[onclick="setMode('${newMode}')"]`).classList.add("active");
    calculate();
}

function calculate() {
    const amount = parseFloat(document.getElementById("amount").value) || 0;
    const result = document.getElementById("result");
    const currency = document.getElementById("currency");

    if (mode === "buy") {
        result.textContent = (amount * buyRate).toFixed(2);
        currency.textContent = "جنيه";
    } else {
        result.textContent = (amount * sellRate).toFixed(2);
        currency.textContent = "جنيه";
    }
}

// عرض بيانات الحساب عند اختيار طريقة الدفع
document.getElementById("payment-method").addEventListener("change", function () {
    const method = this.value;
    const details = document.getElementById("payment-details");
    details.style.display = "block";

    const paymentDetails = {
        "bank-alahly": "البنك الأهلي - رقم الحساب: 123456789 - IBAN: EG123456789",
        "cib": "CIB - رقم الحساب: 987654321 - IBAN: EG987654321",
        "vodafone-cash": "فودافون كاش - رقم المحفظة: 0123456789",
        "insta-pay": "إنستاباي - رقم الحساب: 0123456789"
    };

    details.textContent = paymentDetails[method] || "يرجى اختيار طريقة دفع";
});

// رفع إثبات التحويل باستخدام Imgur API (مثال)
async function uploadProof(file) {
    const clientId = "ed06e7004bb7178a69bfe2fe4b6d10ba"; // مفتاح Imgur API
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${clientId}`
            },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            return data.data.link; // رابط الصورة
        } else {
            throw new Error("فشل رفع الصورة");
        }
    } catch (error) {
        alert("خطأ أثناء رفع إثبات التحويل: " + error.message);
        return null;
    }
}

// إرسال الطلب عبر WhatsApp
async function submitOrder() {
    const form = document.getElementById("order-form");
    if (!form.checkValidity()) {
        alert("يرجى ملء جميع الحقول!");
        return;
    }

    const amount = document.getElementById("amount").value;
    const paymentMethod = document.getElementById("payment-method").value;
    const clientName = document.getElementById("client-name").value;
    const walletAddress = document.getElementById("wallet-address").value;
    const proof = document.getElementById("proof").files[0];

    // رفع إثبات التحويل
    const proofLink = await uploadProof(proof);
    if (!proofLink) return;

    // إعداد رسالة WhatsApp
    const message = `
طلب جديد (#${Math.floor(Math.random() * 10000)})
- نوع: ${mode === "buy" ? "شراء" : "بيع"} USDT
- الكمية: ${amount} USDT
- المبلغ: ${document.getElementById("result").textContent} جنيه
- طريقة الدفع: ${document.getElementById("payment-method").options[document.getElementById("payment-method").selectedIndex].text}
- الاسم: ${clientName}
- محفظة USDT: ${walletAddress}
- إثبات التحويل: ${proofLink}
    `;

    // رابط WhatsApp
    const whatsappUrl = `https://wa.me/+201030956097?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // محاكاة إضافة معاملة مكتملة (للعرض فقط)
    const transactionsList = document.getElementById("transactions-list");
    const transaction = document.createElement("li");
    transaction.textContent = `تم ${mode === "buy" ? "شراء" : "بيع"} ${amount} USDT بقيمة ${document.getElementById("result").textContent} جنيه في ${new Date().toLocaleString()}`;
    transactionsList.prepend(transaction);
}
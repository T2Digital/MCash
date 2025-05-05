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
const fixedWallet = "0x1234567890abcdef1234567890abcdef12345678"; // عدل بعنوان محفظتك الحقيقي

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`button[onclick="setMode('${newMode}')"]`).classList.add("active");
    updateWalletField();
    updateAccountDetailsField();
    calculate();
}

function updateWalletField() {
    const walletInput = document.getElementById("wallet-address");
    const walletFixed = document.getElementById("wallet-fixed");
    const fixedWalletSpan = document.getElementById("fixed-wallet");

    if (mode === "sell") {
        walletInput.style.display = "none";
        walletFixed.style.display = "block";
        fixedWalletSpan.textContent = fixedWallet;
        walletInput.removeAttribute("required");
    } else {
        walletInput.style.display = "block";
        walletFixed.style.display = "none";
        walletInput.setAttribute("required", "true");
    }
}

function updateAccountDetailsField() {
    const accountDetailsInput = document.getElementById("account-details");
    if (mode === "sell") {
        accountDetailsInput.style.display = "block";
        accountDetailsInput.setAttribute("required", "true");
    } else {
        accountDetailsInput.style.display = "none";
        accountDetailsInput.removeAttribute("required");
    }
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

// رفع إثبات التحويل باستخدام ImgBB API
async function uploadProof(file) {
    if (!file) {
        alert("يرجى اختيار ملف إثبات التحويل!");
        return null;
    }

    const apiKey = "bde613bd4475de5e00274a795091ba04";
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.error.message || "فشل رفع الصورة");
        }
    } catch (error) {
        alert("خطأ أثناء رفع إثبات التحويل: " + error.message);
        console.error("Upload Error:", error);
        return null;
    }
}

// إرسال الطلب عبر WhatsApp
async function submitOrder(event) {
    event.preventDefault();
    const form = document.getElementById("order-form");
    if (!form.checkValidity()) {
        alert("يرجى ملء جميع الحقول!");
        return;
    }

    const amount = document.getElementById("amount").value;
    const paymentMethod = document.getElementById("payment-method").value;
    const clientName = document.getElementById("client-name").value;
    const accountDetails = document.getElementById("account-details").value;
    const walletAddress = mode === "sell" ? fixedWallet : document.getElementById("wallet-address").value;
    const proof = document.getElementById("proof").files[0];

    // رفع إثبات التحويل
    const proofLink = await uploadProof(proof);
    if (!proofLink) return;

    // إعداد رسالة WhatsApp
    const paymentMethodName = document.getElementById("payment-method").options[document.getElementById("payment-method").selectedIndex].text;
    const message = `طلب جديد (#${Math.floor(Math.random() * 10000)})
نوع: ${mode === "buy" ? "شراء" : "بيع"} USDT
الكمية: ${amount} USDT
المبلغ: ${document.getElementById("result").textContent} جنيه
طريقة الدفع: ${paymentMethodName}
${mode === "sell" ? `بيانات الحساب: ${accountDetails}` : ""}
الاسم: ${clientName}
محفظة USDT: ${walletAddress}
إثبات التحويل: ${proofLink}`;

    // رابط WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=201030956097&text=${encodeURIComponent(message)}`;
    try {
        window.open(whatsappUrl, "_blank");
        console.log("WhatsApp URL:", whatsappUrl);
    } catch (error) {
        alert("خطأ أثناء فتح WhatsApp: " + error.message);
        console.error("WhatsApp Error:", error);
    }

    // إعادة تعيين النموذج
    form.reset();
    document.getElementById("payment-details").style.display = "none";
    updateWalletField();
    updateAccountDetailsField();
}

// ربط حدث submit للنموذج
document.getElementById("order-form").addEventListener("submit", submitOrder);

// تهيئة الحقول عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    updateWalletField();
    updateAccountDetailsField();
});

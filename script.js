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

// وظيفة جلب الأسعار اللحظية من CoinGecko
async function fetchCryptoPrices() {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,ripple,solana,litecoin,bitcoin-cash,cardano,polkadot,chainlink,worldcoin,uniswap,filecoin,sui,tron,ordinals,near,iota,hedera-hashgraph,ethereum-classic&order=market_cap_desc&per_page=21&page=1&sparkline=false&price_change_percentage=24h"
        );
        const data = await response.json();
        updateTicker(data);
    } catch (error) {
        console.error("خطأ في جلب أسعار العملات:", error);
        document.getElementById("ticker-content").innerHTML = "<span>خطأ في تحميل الأسعار</span>";
    }
}

// وظيفة جلب إحصائيات السوق من CoinGecko
async function fetchMarketStats() {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/global");
        const data = await response.json();
        updateMarketStats(data.data);
    } catch (error) {
        console.error("خطأ في جلب إحصائيات السوق:", error);
        document.getElementById("market-cap").textContent = "خطأ في تحميل البيانات";
        document.getElementById("total-coins").textContent = "";
        document.getElementById("volume-24h").textContent = "";
    }
}

// تحديث شريط الأسعار اللحظية
function updateTicker(coins) {
    const tickerContent = document.getElementById("ticker-content");
    tickerContent.innerHTML = "";
    coins.forEach(coin => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? "price-up" : "price-down";
        const tickerItem = document.createElement("div");
        tickerItem.className = "ticker-item";
        tickerItem.innerHTML = `
            ${coin.name}: $${coin.current_price.toFixed(2)} 
            <span class="${changeClass}">(${coin.price_change_percentage_24h.toFixed(2)}%)</span>
        `;
        tickerContent.appendChild(tickerItem);
    });
}

// تحديث شريط إحصائيات السوق
function updateMarketStats(data) {
    const marketCap = document.getElementById("market-cap");
    const totalCoins = document.getElementById("total-coins");
    const volume24h = document.getElementById("volume-24h");

    marketCap.textContent = `إجمالي القيمة السوقية: $${(data.total_market_cap.usd / 1e12).toFixed(2)} تريليون`;
    totalCoins.textContent = `عدد العملات: ${data.active_cryptocurrencies}`;
    volume24h.textContent = `حجم التداول (24 ساعة): $${(data.total_volume.usd / 1e9).toFixed(2)} مليار`;
}

// منطق الحاسبة
let mode = "buy";
const buyRate = 50; // سعر الشراء (1 USDT = 50 جنيه)
const sellRate = 48; // سعر البيع (1 USDT = 48 جنيه)
const fixedWallet = "TQB2tBSsChr5SHcahUvwe4hEaSE1t1nKDT"; // عنوان المحفظة في البيع
const exchangeIds = {
    binance: "40460946",
    okx: "40460946",
    kucoin: "40460946"
};

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`button[onclick="setMode('${newMode}')"]`).classList.add("active");
    updateWalletField();
    updateAccountDetailsField();
    updateReceiveFields();
    calculate();
}

function updateWalletField() {
    const walletInput = document.getElementById("wallet-address");
    const walletFixed = document.getElementById("wallet-fixed");
    const fixedWalletSpan = document.getElementById("fixed-wallet");
    const binanceIdSpan = document.getElementById("binance-id");
    const okxIdSpan = document.getElementById("okx-id");
    const kucoinIdSpan = document.getElementById("kucoin-id");
    const receiveMethod = document.getElementById("receive-method");

    if (mode === "sell") {
        walletInput.style.display = "none";
        walletFixed.style.display = "block";
        receiveMethod.style.display = "none";
        fixedWalletSpan.textContent = fixedWallet;
        binanceIdSpan.textContent = exchangeIds.binance;
        okxIdSpan.textContent = exchangeIds.okx;
        kucoinIdSpan.textContent = exchangeIds.kucoin;
        walletInput.removeAttribute("required");
    } else {
        walletInput.style.display = "none";
        walletFixed.style.display = "none";
        receiveMethod.style.display = "block";
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

function updateReceiveFields() {
    const receiveMethod = document.getElementById("receive-method").value;
    const walletInput = document.getElementById("wallet-address");
    const exchangeSection = document.getElementById("exchange-id-section");
    const exchangePlatform = document.getElementById("exchange-platform");
    const exchangeId = document.getElementById("exchange-id");

    if (mode === "sell") {
        walletInput.style.display = "none";
        exchangeSection.style.display = "none";
        walletInput.removeAttribute("required");
        exchangePlatform.removeAttribute("required");
        exchangeId.removeAttribute("required");
        return;
    }

    if (receiveMethod === "wallet") {
        walletInput.style.display = "block";
        exchangeSection.style.display = "none";
        walletInput.setAttribute("required", "true");
        exchangePlatform.removeAttribute("required");
        exchangeId.removeAttribute("required");
    } else if (receiveMethod === "exchange") {
        walletInput.style.display = "none";
        exchangeSection.style.display = "flex";
        walletInput.removeAttribute("required");
        exchangePlatform.setAttribute("required", "true");
        exchangeId.setAttribute("required", "true");
    } else {
        walletInput.style.display = "none";
        exchangeSection.style.display = "none";
        walletInput.removeAttribute("required");
        exchangePlatform.removeAttribute("required");
        exchangeId.removeAttribute("required");
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
        "insta-pay": "إنستاباي - رقم الحساب: 01030956097",
        "wallet": "محفظة - الرقم: 01030956097"
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
    const receiveMethod = document.getElementById("receive-method").value;
    const walletAddress = receiveMethod === "wallet" ? document.getElementById("wallet-address").value : (mode === "sell" ? fixedWallet : "");
    const exchangePlatform = document.getElementById("exchange-platform").value;
    const exchangeId = document.getElementById("exchange-id").value;

    // رفع إثبات التحويل
    const proofLink = await uploadProof(document.getElementById("proof").files[0]);
    if (!proofLink) return;

    // إعداد رسالة WhatsApp
    const paymentMethodName = document.getElementById("payment-method").options[document.getElementById("payment-method").selectedIndex].text;
    const exchangeInfo = receiveMethod === "exchange" && exchangePlatform && exchangeId ? `${exchangePlatform.toUpperCase()} ID: ${exchangeId}` : "";
    const message = `طلب جديد (#${Math.floor(Math.random() * 10000)})
نوع: ${mode === "buy" ? "شراء" : "بيع"} USDT
الكمية: ${amount} USDT
المبلغ: ${document.getElementById("result").textContent} جنيه
طريقة الدفع: ${paymentMethodName}
${mode === "sell" ? `بيانات الحساب: ${accountDetails}` : ""}
${receiveMethod === "wallet" ? `محفظة USDT: ${walletAddress}` : ""}
${exchangeInfo ? `منصة الاستلام: ${exchangeInfo}` : ""}
الاسم: ${clientName}
إثبات التحويل: ${proofLink}`;

    // رابط WhatsApp بصيغة wa.me
    const phoneNumber = "201030956097";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
        const whatsappWindow = window.open(whatsappUrl, "_blank");
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === "undefined") {
            alert("يرجى تثبيت تطبيق WhatsApp أو السماح بفتح الروابط في المتصفح.");
        }
    } catch (error) {
        alert("خطأ أثناء فتح WhatsApp: " + error.message);
        console.error("WhatsApp Error:", error);
    }

    // إعادة تعيين النموذج
    form.reset();
    document.getElementById("payment-details").style.display = "none";
    updateWalletField();
    updateAccountDetailsField();
    updateReceiveFields();
}

// ربط حدث submit للنموذج
document.getElementById("order-form").addEventListener("submit", submitOrder);

// تهيئة الحقول وجلب بيانات العملات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    updateWalletField();
    updateAccountDetailsField();
    updateReceiveFields();
    fetchCryptoPrices();
    fetchMarketStats();

    // تحديث البيانات كل 60 ثانية
    setInterval(fetchCryptoPrices, 60000);
    setInterval(fetchMarketStats, 60000);
});

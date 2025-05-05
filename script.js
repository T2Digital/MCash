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
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,ripple,solana,litecoin,bitcoin-cash,cardano,polkadot,chainlink,worldcoin-org,uniswap,filecoin,sui,tron,ordinals,near,iota,hedera-hashgraph,ethereum-classic,dogecoin,avalanche-2,shiba-inu,polygon,cosmos,stellar,monero,algorand,vechain,aptos,arbitrum,optimism,internet-computer,cronos&order=market_cap_desc&per_page=35&page=1&sparkline=false&price_change_percentage=24h"
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
    coins.forEach((coin, index) => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? "price-up" : "price-down";
        // تعديل رمز Worldcoin إلى WLD
        const symbol = coin.id === "worldcoin-org" ? "WLD" : coin.symbol.toUpperCase();
        // التحقق من السعر
        const price = coin.current_price && coin.current_price > 0 ? `$${coin.current_price.toFixed(2)}` : "غير متاح";
        const tickerItem = document.createElement("div");
        tickerItem.className = "ticker-item";
        tickerItem.style.animationDelay = `${index * 0.1}s`; // تأخير متسلسل لتأثير Fade-In
        tickerItem.innerHTML = `
            ${coin.name} <span class="coin-symbol">$${symbol}</span>: ${price} 
            <span class="${changeClass}">(${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : "0.00"}%)</span>
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

// تحديث التاريخ تلقائيًا
function updateCurrentDate() {
    const date = new Date();
    const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    document.getElementById("current-date").textContent = `${day} ${month} ${year}`;
}

// منطق الحاسبة
let mode = "buy";
const buyRate = 53; // سعر الشراء (1 USDT = 53 جنيه)
const sellRate = 50.50; // سعر البيع (1 USDT = 50.50 جنيه)
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

function updatePriceBox() {
    document.getElementById("buy-price").textContent = buyRate.toFixed(2);
    document.getElementById("sell-price").textContent = sellRate.toFixed(2);
    updateCurrentDate();
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
       

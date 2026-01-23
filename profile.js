// API manzilingizni o'zgaruvchiga olib qo'yamiz (agar tepada bo'lmasa)
const API_BASE = "https://egalik-api-v01.onrender.com/auth/";

const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(confirm("Tizimdan chiqmoqchimisiz?")) {
                logout();
            }
        });
    }

async function logout() {
    try {
        // 1. Serverga logout so'rovini yuboramiz (Cookie-ni o'chirishi uchun)
        await fetch(API_BASE + "logout/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    } catch (e) {
        console.warn("Server bilan aloqa uzilgan, lekin baribir tizimdan chiqaramiz.");
    } finally {
        // 2. Brauzerdagi barcha ma'lumotlarni tozalash
        // sessionStorage faqat bitta vkladka uchun, localStorage hamma vkladkalar uchun
        sessionStorage.clear(); 
        localStorage.clear(); 

        // 3. Login sahifasiga yo'naltirish
        window.location.replace("login.html"); 
        // .replace ishlatish yaxshi, chunki foydalanuvchi "Back" tugmasini bossa, 
        // yana index'ga qaytib qolmaydi.
    }
}

// Register tugmasini ID orqali ushlab olamiz
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
        // Agar tugma ichida <a> tegi bo'lsa, uning standart ta'sirini to'xtatamiz
        e.preventDefault();
        
        // Register sahifasiga o'tkazish
        window.location.href = "register.html";
    });
}


// ===== THEME (SAFE MODE) =====
// ===============================
// LIGHT / DARK MODE TOGGLE
// ===============================

const modeBtn = document.querySelector('[data-tab="mode"]');

// Load saved mode on page load
(function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }
})();

// Toggle theme on click
modeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
});


const LANG = {
  uz: {
    home: "Asosiy",
    categories: "Bo'limlar",
    add: "E’lon qo‘shish",
    myAds: "Mening e’lonlarim",
    profile: "Sozlamalar",
    mode: "Rejim",
    language: "Til",
    logout: "Chiqish",
    search: "Qidirish",
    searchPlaceholder: "Nimalar qidiryapsiz?"
  },
  en: {
    home: "Home",
    categories: "Categories",
    add: "Add listing",
    myAds: "My ads",
    profile: "Settings",
    mode: "Mode",
    language: "Language",
    logout: "Logout",
    search: "Search",
    searchPlaceholder: "What are you looking for?"
  }
  
};


function applyLanguage(lang) {
  const t = LANG[lang];

  document.querySelector('[data-page="home"] p').innerText = t.home;
  document.querySelector('[data-page="categories"] p').innerText = t.categories;
  document.querySelector('[data-page="add"] p').innerText = t.add;
  document.querySelector('[data-page="profile"] p').innerText = t.myAds;
  document.querySelector('[data-page="profile-panel"] p').innerText = t.profile;

  document.querySelector('[data-tab="mode"] p').innerText = t.mode;
  document.querySelector('[data-tab="language"] p').innerText = t.language;
  document.querySelector('.logout-btn-container p').innerText = t.logout;

  document.querySelectorAll('#searchInput').forEach(i => {
    i.placeholder = t.searchPlaceholder;
  });

  document.querySelectorAll('.search-btn').forEach(b => {
    b.innerText = t.search;
  });

  localStorage.setItem("lang", lang);
}

const langBtn = document.querySelector('[data-tab="language"]');

// load
applyLanguage(localStorage.getItem("lang") || "uz");

// toggle
langBtn.addEventListener("click", () => {
  const current = localStorage.getItem("lang") || "uz";
  applyLanguage(current === "uz" ? "en" : "uz");
});

logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await fetch(API_BASE + "logout/", {
            method: "POST",
            credentials: "include"
        });
    } catch (err) {
        console.warn("Logout request failed (ignore 401)");
    } finally {
        window.location.href = "login.html"; // Har doim login sahifaga yo'naltirish
    }
});

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

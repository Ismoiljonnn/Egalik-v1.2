/* app.js - Egalik frontend: yagona, toza va barqaror skript
   Muallif: ChatGPT (Ayanakoji assistant)
   Izohlar: endpoint nomlarini o'zingizning backend-ga moslab o'zgartiring.
*/

const API_BASE = "https://egalik-api-v01.onrender.com/"; // O'zingizga moslang — oxirida slash bo'lsin

// Endpoints (moslashtiring agar backend boshqacha bo'lsa)
const ENDPOINTS = {
  LIST_ADS: API_BASE,                   // GET -> barcha e'lonlar (yoki /ads/)
  MY_ADS: API_BASE + "mening_elonlarim/", // GET -> userning e'lonlari
  ADD: API_BASE + "add/",               // POST -> yangi e'lon qo'shish (FormData)
  CRUD: API_BASE + "CRUD/",             // {id}/ -> GET/PUT/DELETE
  LOGIN: API_BASE + "auth/login/",      // POST -> login (JSON: username/email + password)
  REGISTER: API_BASE + "auth/register/",// POST -> register
  LOGOUT: API_BASE + "auth/logout/"     // POST -> logout (token)
};

// ------------ Token yordamchi funksiyalar ------------
function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function removeToken() {
  localStorage.removeItem("token");
}
function getAuthHeaders() {
  const token = getToken();
  // Hech qachon UI redirectni bu funksiyaga joylama — funksiyani "sokin" qildik
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// ------------ UI util ------------
function showAlert(msg) { alert(msg); }
function safeJson(res) {
  return res.text().then(text => {
    try { return JSON.parse(text); } catch { return text; }
  });
}

// ------------ DOM elementlar (agar bo'lmasa kod xato bermasligi uchun tekshir) ------------
const els = {
  homeGrid: document.querySelector("#home .ads-grid"),
  profileGrid: document.querySelector("#profile .ads-grid"),
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  addForm: document.getElementById("addForm"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  categoryCards: document.querySelectorAll(".category-card")
};

// ------------ Create Ad Card ------------
function createAdCard(item, isMyAd = false) {
  const btnClass = item.holat === "sotiladi" ? "green" : "blue";
  // rasm manbai to'g'ri ishlashi uchun:
  const imgSrc = item.rasm
    ? (item.rasm.startsWith("http") ? item.rasm : `${API_BASE}${item.rasm}`)
    : "images/noimage.jpg"; // o'zingizning default image path

  // data-id maydonini qo'shdik (delete/edit uchun)
  return `
    <article class="ad-card" data-id="${item.id ?? item.pk ?? ''}">
      <img src="${imgSrc}" alt="${item.title || ''}">
      <h3>${item.title || ''}</h3>
      <p>Tavsilot: ${item.tavsilot || ''}</p>
      <p>Narxi: ${item.narx || '—'} so'm</p>
      <p>Telefon raqam: ${item.number || '—'}</p>
      <p>Telegram: ${item.telegram || '—'}</p>
      <div class="ad-actions">
        <button class="badge ${btnClass}">${item.holat || '—'}</button>
        ${isMyAd ? `<button class="delete-btn" data-id="${item.id ?? item.pk ?? ''}">O'chirish</button>` : ''}
      </div>
    </article>
  `;
}

// ------------ Load products (barcha) ------------
async function loadProducts(queryUrl = ENDPOINTS.LIST_ADS) {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(queryUrl, { headers });
    if (!res.ok) {
      // Agar 401 kelsa token noto'g'ri — logout qilamiz
      if (res.status === 401) {
        removeToken();
        updateAuthUI();
        return;
      }
      const body = await safeJson(res);
      console.error("Load products xato:", res.status, body);
      if (els.homeGrid) els.homeGrid.innerHTML = "<p>Serverdan e'lonlar olinmadi</p>";
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      if (els.homeGrid) els.homeGrid.innerHTML = "<p>Hozircha e'lonlar yo'q</p>";
      return;
    }
    if (els.homeGrid) els.homeGrid.innerHTML = data.map(i => createAdCard(i, false)).join("");
  } catch (err) {
    console.error("loadProducts fetch error:", err);
    if (els.homeGrid) els.homeGrid.innerHTML = "<p>Server bilan bog'lanishda xato</p>";
  }
}

// ------------ Load my ads ------------
async function loadMyAds() {
  try {
    const res = await fetch(ENDPOINTS.MY_ADS, { headers: getAuthHeaders() });
    if (!res.ok) {
      if (res.status === 401) {
        removeToken();
        updateAuthUI();
        return;
      }
      const body = await safeJson(res);
      console.error("loadMyAds xato:", res.status, body);
      if (els.profileGrid) els.profileGrid.innerHTML = "<p>Serverdan javob kelmadi</p>";
      return;
    }
    const data = await res.json();
    if (!data || data.length === 0) {
      if (els.profileGrid) els.profileGrid.innerHTML = "<p>Hozircha sizning e'lonlaringiz yo'q</p>";
      return;
    }
    if (els.profileGrid) els.profileGrid.innerHTML = data.map(i => createAdCard(i, true)).join("");
  } catch (err) {
    console.error("loadMyAds fetch error:", err);
    if (els.profileGrid) els.profileGrid.innerHTML = "<p>Server bilan bog'lanishda xato</p>";
  }
}

// ------------ Search ------------
async function doSearch(query) {
  if (!query) return loadProducts();
  const url = `${ENDPOINTS.LIST_ADS}?search=${encodeURIComponent(query)}`;
  await loadProducts(url);
}

// ------------ Category filter ------------
async function filterByCategory(cat) {
  const url = cat ? `${ENDPOINTS.LIST_ADS}?kategoriya=${encodeURIComponent(cat)}` : ENDPOINTS.LIST_ADS;
  await loadProducts(url);
  // ko'rsatish: home sahifasini ochish
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const home = document.getElementById("home");
  if (home) home.style.display = "block";
}

// ------------ Add ad ------------
async function handleAddFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  try {
    const res = await fetch(ENDPOINTS.ADD, {
      method: "POST",
      body: fd,
      headers: getAuthHeaders()
    });
    if (res.ok) {
      showAlert("E'lon muvaffaqiyatli qo'shildi!");
      form.reset();
      await loadProducts();
      await loadMyAds();
    } else {
      const body = await safeJson(res);
      console.error("Add error:", res.status, body);
      showAlert("E'lon qo'shilmadi: " + (typeof body === "string" ? body : JSON.stringify(body)));
    }
  } catch (err) {
    console.error("Add fetch error:", err);
    showAlert("Server bilan bog'lanishda xato");
  }
}

// ------------ Delete ad ------------
async function deleteAd(id) {
  if (!confirm("E'lon o'chirilsinmi?")) return;
  try {
    const res = await fetch(`${ENDPOINTS.CRUD}${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (res.ok) {
      showAlert("E'lon muvaffaqiyatli o'chirildi");
      await loadProducts();
      await loadMyAds();
    } else {
      const body = await safeJson(res);
      console.error("Delete error:", res.status, body);
      showAlert("O'chirishda xato: " + (typeof body === "string" ? body : JSON.stringify(body)));
    }
  } catch (err) {
    console.error("Delete fetch error:", err);
    showAlert("Server bilan bog'lanishda xato");
  }
}

// ------------ Login & Register (misol) ------------
async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const body = await safeJson(res);
    if (res.ok) {
      // token nomi backend-ga qarab o'zgarishi mumkin: token, access, jwt va hokazo
      // Tekshirib ko'r: body.access yoki body.token
      const token = body.token || body.access || body.key || null;
      if (!token) {
        showAlert("Server token qaytarmadi. Javob: " + JSON.stringify(body));
        return;
      }
      setToken(token);
      updateAuthUI();
      form.reset();
      await loadProducts();
      await loadMyAds();
    } else {
      showAlert("Login xato: " + (typeof body === "string" ? body : JSON.stringify(body)));
    }
  } catch (err) {
    console.error("Login fetch error:", err);
    showAlert("Server bilan bog'lanishda xato");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const body = await safeJson(res);
    if (res.ok) {
      showAlert("Ro'yxatdan o‘tildi. Iltimos login qiling.");
      form.reset();
    } else {
      showAlert("Register xato: " + (typeof body === "string" ? body : JSON.stringify(body)));
    }
  } catch (err) {
    console.error("Register fetch error:", err);
    showAlert("Server bilan bog'lanishda xato");
  }
}

// ------------ Logout ------------
async function handleLogout() {
  try {
    const res = await fetch(ENDPOINTS.LOGOUT, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (res.ok) {
      removeToken();
      updateAuthUI();
      const body = await safeJson(res);
      showAlert(body.message || "Siz muvaffaqiyatli chiqdingiz");
      window.location.href = "login.html";
    } else {
      const body = await safeJson(res);
      console.error("Logout xato:", body);
      // hatto logout xato bo'lsa ham tokenni o'chirish mumkin
      removeToken();
      updateAuthUI();
      showAlert("Logout xato: " + (typeof body === "string" ? body : JSON.stringify(body)));
    }
  } catch (err) {
    console.error("Logout fetch error:", err);
    removeToken();
    updateAuthUI();
    showAlert("Server bilan bog'lanishda xato");
  }
}

// ------------ Auth UI update ------------
function updateAuthUI() {
  const token = getToken();
  if (els.loginBtn) els.loginBtn.style.display = token ? "none" : "block";
  if (els.logoutBtn) els.logoutBtn.style.display = token ? "block" : "none";
}

// ------------ Event listeners (bir martalik) ------------
function attachEventListeners() {
  // Search
  if (els.searchBtn && els.searchInput) {
    els.searchBtn.addEventListener("click", () => doSearch(els.searchInput.value.trim()));
    els.searchInput.addEventListener("keypress", (e) => { if (e.key === "Enter") doSearch(els.searchInput.value.trim()); });
  }

  // Category cards
  if (els.categoryCards) {
    els.categoryCards.forEach(card => {
      card.addEventListener("click", () => filterByCategory(card.dataset.category || ""));
    });
  }

  // Add form
  if (els.addForm) els.addForm.addEventListener("submit", handleAddFormSubmit);

  // Login/Register forms (agar mavjud bo'lsa)
  if (els.loginForm) els.loginForm.addEventListener("submit", handleLogin);
  if (els.registerForm) els.registerForm.addEventListener("submit", handleRegister);

  // Logout button
  if (els.logoutBtn) els.logoutBtn.addEventListener("click", handleLogout);

  // Delegated click (delete)
  document.addEventListener("click", (e) => {
    const del = e.target.closest(".delete-btn");
    if (del) {
      const id = del.dataset.id || del.closest(".ad-card")?.dataset?.id;
      if (id) deleteAd(id);
    }
  });

  // Sidebar nav switching (originalingizdan ozgina yengil variant)
  document.querySelectorAll(".sidebar nav a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".sidebar nav a").forEach(a => a.classList.remove("active"));
      link.classList.add("active");
      const page = link.dataset.page;
      document.querySelectorAll(".page").forEach(p => p.style.display = "none");
      const el = document.getElementById(page);
      if (el) el.style.display = "block";
      if (page === "profile") loadMyAds();
    });
  });
}

// ------------ Token verify (server ga bog'lanib tekshiradi) ------------
async function verifyToken() {
  const token = getToken();
  if (!token) return false;
  try {
    // Ilk navbatda, userning e'lonlarini so'rab tekshiramiz — agar 401 bo'lsa token xato
    const res = await fetch(ENDPOINTS.MY_ADS, { headers: getAuthHeaders() });
    if (res.status === 401) {
      removeToken();
      return false;
    }
    // 200 yoki boshqa javob — token ishlashi mumkin
    return res.ok;
  } catch (err) {
    console.error("verifyToken xato:", err);
    // Aloqa yo'q bo'lsa ham tokenni saqlab qo'yish mumkin — ammo UIda login ko'rsatiladi
    return false;
  }
}

// ------------ Init (yagona DOMContentLoaded) ------------
document.addEventListener("DOMContentLoaded", async () => {
  attachEventListeners();
  updateAuthUI();

  // Agar token bo'lsa tekshiramiz
  const token = getToken();
  if (token) {
    const ok = await verifyToken();
    if (!ok) {
      showAlert("Sizning sessiyangiz tugagan yoki token yaroqsiz. Iltimos qayta login qiling.");
      updateAuthUI();
    } else {
      // token to'g'ri bo'lsa my ads va products ni yuklaymiz
      await loadMyAds();
    }
  }

  // Har holatda umumiy e'lonlarni yuklaymiz
  await loadProducts();
});

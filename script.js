const API_BASE = "https://egalik-api-v01.onrender.com/";

// Get authorization headers with token
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return null;
    }
    return {
        "Authorization": `Bearer ${token}`
    };
}

document.addEventListener("DOMContentLoaded", async () => {
try {
    // Token tekshirish
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Foydalanuvchi sessiyasini tekshirish uchun minimal endpoint chaqirish
    const res = await fetch(API_BASE + "mening_elonlarim/", {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (res.status === 401) { // token xato bo'lsa
        localStorage.removeItem("token");
        window.location.href = "login.html";
    } else {
        // foydalanuvchi login qilgan bo'lsa, sahifani yuklaymiz
        loadProducts(); 
    }
} catch (err) {
    console.error("Server bilan bog'lanishda xato:", err);
    alert("Server bilan bog'lanishda xato");
}
});
              
// Navbar switching
document.querySelectorAll(".sidebar nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".sidebar nav a").forEach(a => a.classList.remove("active"));
    link.classList.add("active");

    const page = link.dataset.page;
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";

    // Agar "Mening e'lonlarim" bo'lsa, faqat userning e'lonlarini yuklaymiz
    if(page === "profile") loadMyAds();
  });
});


// Load all products  
async function loadProducts() {
  try {
    const res = await fetch(API_BASE, { 
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();

    const grid = document.querySelector("#home .ads-grid");
    grid.innerHTML = data.map(item => createAdCard(item, false)).join("");
    
  } catch(err) {
    console.error("Fetch error:", err);
  }
}

  // Load my ads (user's own products)
async function loadMyAds() {
    try {
        // fetch natijasini res ga saqlaymiz
        const res = await fetch(API_BASE + "mening_elonlarim/", { 
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error("Network response not ok");

        const data = await res.json();

        const grid = document.querySelector("#profile .ads-grid");

        // data bo'sh yoki undefined bo'lsa
        if (!data || data.length === 0) {
            grid.innerHTML = "<p>Hozircha sizning e'lonlaringiz yo'q</p>";
            return;
        }

        // createAdCard funksiyasi bilan HTML yaratish
        grid.innerHTML = data.map(item => createAdCard(item, true)).join("");
    } catch(err) {
        console.error("Fetch error:", err);
        const grid = document.querySelector("#profile .ads-grid");
        if (grid) grid.innerHTML = "<p>Serverga ulanishda xato</p>";
    }
}

// Create ad card HTML
function createAdCard(item) {
  // Holat button rangini aniqlaymiz
  const btnClass = item.holat === "sotiladi" ? "green" : "ijaraga" ? "blue" : "blue";

  // Rasmni to'liq URL bilan ishlatamiz, default rasm bilan
  const imgSrc = item.rasm
  ? (item.rasm.startsWith("http") ? item.rasm : `${API_BASE}${item.rasm}`)
  : "4f07618e6737f672bedccccd4ed06f16.jpg";


  return `
    <article class="ad-card">
      <img src="${imgSrc}" alt="${item.title}">  
      <h3>${item.title}</h3>
      <p>Tavsilot: ${item.tavsilot}</p>
      <p>Narxi: ${item.narx} so'm</p>
      <p>Telefon raqam: ${item.number}</p>
      <p>Telegram: ${item.telegram}</p>
      <div class="ad-actions">
        <button class="badge ${btnClass}">
          ${item.holat}
        </button>
      </div>
    </article>
  `;
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

// Add form
document.getElementById("addForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const formData = new FormData(this);

  try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE + "add/", {
          method: "POST",
          body: formData,
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      if(res.ok){
          alert("E'lon muvaffaqiyatli qo'shildi!");
          this.reset();
          loadProducts();
          loadMyAds();
      } else {
          const errText = await res.text();
          alert("Xato: E'lon qo'shilmadi\n" + errText);
      }
  } catch(err){
      console.error("Add fetch error:", err);
      alert("Serverga ulanishda xato");
  }
});
        

function createAdCard(item, isMyAd = false) {
const btnClass = item.holat === "sotiladi" ? "green" : "blue";

const BASE_URL = "https://egalik-api-v01.onrender.com";

  const imgSrc = item.rasm
    ? (item.rasm.startsWith("http")
        ? item.rasm
        : `${BASE_URL}${item.rasm}`)
    : "images/noimage.jpg";

  return `
    <article class="ad-card" data-id="${item.id}">
      <img src="${imgSrc}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>Tavsilot: ${item.tavsilot}</p>
      <p>Narxi: ${item.narx} so'm</p>
      <p>Telefon raqam: ${item.number}</p>
      <p>Telegram: ${item.telegram}</p>
      <div class="ad-actions">
        <button class="badge ${btnClass}">${item.holat}</button>
        ${isMyAd ? `

       
        
        ` : ""}
      </div>

       ${isMyAd ? `<button class="delete-btn" data-id="${item.id}">O'chirish</button>` : ""}
    </article>
  `;
}

//  <button class="edit-btn" data-id="${item.id}">Tahrirlash</button>


    const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if(!query) return loadProducts(); // agar bo'sh bo'lsa barcha e'lonlar

    try {
        const res = await fetch(`${API_BASE}?search=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });

        if(!res.ok) throw new Error("Network response not ok");

        const data = await res.json();
        const grid = document.querySelector("#home .ads-grid");

        if(!data || data.length === 0){
            grid.innerHTML = "<p>Hech narsa topilmadi</p>";
            return;
        }

        grid.innerHTML = data.map(item => createAdCard(item, false)).join("");
    } catch(err) {
        console.error("Fetch error:", err);
        const grid = document.querySelector("#home .ads-grid");
        if(grid) grid.innerHTML = "<p>Qidiruvda xato yuz berdi</p>";
    }
});

// Enter tugmasi bilan ham qidiruv
searchInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter"){
        searchBtn.click();
    }
});


  // Kategoriya kartalarini tanlaymiz
const categoryCards = document.querySelectorAll(".category-card");

categoryCards.forEach(card => {
    card.addEventListener("click", async () => {
        const category = card.dataset.category; // data-category dan olamiz

        try {
            let url = API_BASE;
            if(category) url += `?kategoriya=${encodeURIComponent(category)}`;

            const res = await fetch(url, { 
              headers: getAuthHeaders()
            });
            if(!res.ok) throw new Error("Network response not ok");

            const data = await res.json();
            const grid = document.querySelector("#home .ads-grid");

            if(!data || data.length === 0){
                grid.innerHTML = "<p>Tanlangan kategoriya bo'yicha e'lonlar topilmadi</p>";
                return;
            }

            // Adlarni gridga joylash
            grid.innerHTML = data.map(item => createAdCard(item, false)).join("");

            // Home page'ga o'tkazish
            document.querySelectorAll(".page").forEach(p => p.style.display = "none");
            document.getElementById("home").style.display = "block";

        } catch(err){
            console.error("Fetch error:", err);
            const grid = document.querySelector("#home .ads-grid");
            if(grid) grid.innerHTML = "<p>Server bilan bog'lanishda xato</p>";
        }
    });
});


  // E'lon o'chirish
document.addEventListener("click", async (e) => {
    if(e.target.classList.contains("delete-btn")) {
        // data-id ni olamiz
        const adCard = e.target.closest(".ad-card");
        const id = adCard.dataset.id;

        if(confirm("E'lonni o'chirilsinmi?")) {
            try {
                const res = await fetch(`${API_BASE}CRUD/${id}/`, {
                    method: "DELETE",
                    headers: getAuthHeaders()
                });

                if(res.ok){
                    alert("E'lon muvaffaqiyatli o'chirildi");
                    // Agar foydalanuvchining o'z e'lonlari sahifasida bo'lsa, yangilaymiz
                    const profilePage = document.getElementById("profile");
                    if(profilePage.style.display !== "none"){
                        loadMyAds();
                    } else {
                        loadProducts();
                    }
                } else {
                    const err = await res.json();
                    alert("Xato: " + JSON.stringify(err));
                }
            } catch(err){
                console.error(err);
                alert("Server bilan bog'lanishda xato");
            }
        }
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://egalik-api-v01.onrender.com/auth/logout/", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      if(res.ok){
          localStorage.removeItem("token");
          const data = await res.json();
          alert(data.message); // "Logged out successfully ✅"
          window.location.href = "login.html"; // login sahifaga yo'naltirish
      } else {
          const err = await res.json().catch(() => null);
          alert("Logout xato: " + (err ? JSON.stringify(err) : "Server javobi xato"));
      }
    } catch(err){
        console.error(err);
        alert("Server bilan bog'lanishda xato");
    }
});

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            // token yo'q
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
        } else {
            // token bor
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
        }
    } catch (err) {
        console.error(err);
        // xato bo'lsa xavfsiz holat
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
    }
});

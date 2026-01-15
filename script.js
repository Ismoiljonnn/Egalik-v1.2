const API_BASE = "https://egalik-api-v01.onrender.com/";
        

// Navbar switching
document.querySelectorAll(".sidebar nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".sidebar nav a").forEach(a => a.classList.remove("active"));
    link.classList.add("active");

    const page = link.dataset.page;
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";

    // Agar "Mening e’lonlarim" bo‘lsa, faqat userning e’lonlarini yuklaymiz
    if(page === "profile") loadMyAds();
  });
});


  // Load all products  
  async function loadProducts() {
    try {
      const res = await fetch(API_BASE, { credentials: "include" });
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
              credentials: "include" // cookie yuboradi
          });

          if (!res.ok) throw new Error("Network response not ok");

          const data = await res.json();

          const grid = document.querySelector("#profile .ads-grid");

          // data bo'sh yoki undefined bo'lsa
          if (!data || data.length === 0) {
              grid.innerHTML = "<p>Hozircha sizning e’lonlaringiz yo‘q</p>";
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

  // Rasmni to‘liq URL bilan ishlatamiz, default rasm bilan
//   const imgSrc = item.rasm && item.rasm.startsWith("http") ? item.rasm : "images/noimage.jpg";  

  return `
    <article class="ad-card">
      <img src="${item.rasm}" alt="${item.title}">
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
        const res = await fetch(API_BASE + "add/", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        if(res.ok){
            alert("E’lon muvaffaqiyatli qo‘shildi!");
            this.reset();
            loadProducts();
            loadMyAds();
        } else {
            const errText = await res.text();
            alert("Xato: E’lon qo‘shilmadi\n" + errText);
        }
    } catch(err){
        console.error("Add fetch error:", err);
        alert("Serverga ulanishda xato");
    }
});


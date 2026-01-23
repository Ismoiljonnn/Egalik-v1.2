        const API_BASE = "https://egalik-api-v01.onrender.com/";

      const loader = document.getElementById("global-loader");
      const loaderText = loader.querySelector("p");

      // sahifa yuklanganda
      window.addEventListener("load", async () => {

          // 15 sekunddan keyin text o'zgaradi
          const slowTextTimer = setTimeout(() => {
              loaderText.innerText = "Server sekin javob bermoqda, iltimos kuting...";
          }, 15000);

          try {
              await fetch(API_BASE + "health", {
                  credentials: "include"
              });
          } catch (e) {
              // jim, baribir loadingni yopamiz
          } finally {
              clearTimeout(slowTextTimer);

              // minimal 1.2s ko‘rinib turadi (flicker bo‘lmasligi uchun)
              setTimeout(() => {
                  loader.classList.add("hide");
              }, 1200);
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
        

function createAdCard(item, isMyAd = false) {
  const btnClass = item.holat === "sotiladi" ? "green" : "blue";

  const BASE_URL = "https://egalik-api-v01.onrender.com";

  const imgSrc = item.rasm
    ? (item.rasm.startsWith("http") ? item.rasm : `${BASE_URL}${item.rasm}`)
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
      </div>
      ${isMyAd ? `
          <button class="delete-btn" data-id="${item.id}">O‘chirish</button>
        ` : ""}
    </article>
  `;
}

          const searchInput = document.getElementById("searchInput");
      const searchBtn = document.getElementById("searchBtn");

      searchBtn.addEventListener("click", async () => {
          const query = searchInput.value.trim();
          if(!query) return loadProducts(); // agar bo‘sh bo‘lsa barcha e'lonlar

          try {
              const res = await fetch(`${API_BASE}?search=${encodeURIComponent(query)}`, {
                  credentials: "include"
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

              const res = await fetch(url, { credentials: "include" });
              if(!res.ok) throw new Error("Network response not ok");

              const data = await res.json();
              const grid = document.querySelector("#home .ads-grid");

              if(!data || data.length === 0){
                  grid.innerHTML = "<p>Tanlangan kategoriya bo‘yicha e’lonlar topilmadi</p>";
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
              if(grid) grid.innerHTML = "<p>Server bilan bog‘lanishda xato</p>";
          }
      });
  });


  // E’lon o‘chirish
document.addEventListener("click", async (e) => {
    if(e.target.classList.contains("delete-btn")) {
        // data-id ni olamiz
        const adCard = e.target.closest(".ad-card");
        const id = adCard.dataset.id;

        if(confirm("E’lonni o‘chirilsinmi?")) {
            try {
                const res = await fetch(`${API_BASE}CRUD/${id}/`, {
                    method: "DELETE",
                    credentials: "include" // cookie bilan session ishlatilsa
                });

                if(res.ok){
                    alert("E’lon muvaffaqiyatli o‘chirildi");
                    // Agar foydalanuvchining o‘z e’lonlari sahifasida bo‘lsa, yangilaymiz
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
                alert("Server bilan bog‘lanishda xato");
            }
        }
    }
});


// let editMode = false; // false = yangi elon, true = tahrirlash
// let editId = null;    // tahrirlashdagi e’lon idsi

// document.getElementById("addForm").addEventListener("submit", async function(e) {
//   e.preventDefault();
//   const formData = new FormData(this);

//   try {
//     if (editMode && editId) {
//       // PUT request – tahrirlash
//       const res = await fetch(`${API_BASE}CRUD/${editId}/`, {
//         method: "PUT",
//         body: formData,
//         credentials: "include"
//       });

//       if (res.ok) {
//         alert("E’lon muvaffaqiyatli yangilandi!");
//         this.reset();
//         editMode = false;
//         editId = null;
//         document.getElementById("add").style.display = "none";
//         loadProducts();
//         loadMyAds();
//       } else {
//         const errText = await res.text();
//         alert("Xato: E’lon yangilanmadi\n" + errText);
//       }
//     } else {
//       // POST request – yangi elon
//       const res = await fetch(`${API_BASE}add/`, {
//         method: "POST",
//         body: formData,
//         credentials: "include"
//       });

//       if (res.ok) {
//         alert("E’lon muvaffaqiyatli qo‘shildi!");
//         this.reset();
//         loadProducts();
//         loadMyAds();
//       } else {
//         const errText = await res.text();
//         alert("Xato: E’lon qo‘shilmadi\n" + errText);
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Serverga ulanishda xato");
//   }
// });


// const form = document.getElementById("addForm");
// const addSection = document.getElementById("add");
// const addBtn = form.querySelector("button[type='submit']");
// const editBtn = document.createElement("button"); // tahrirlash tugmasi
// editBtn.type = "submit";
// editBtn.textContent = "E’lonni yangilash";
// editBtn.style.display = "none"; // dastlab yashirin
// form.appendChild(editBtn);

// // FORM submit
// form.addEventListener("submit", async function (e) {
//   e.preventDefault();
//   const formData = new FormData(form);

//   try {
//     if (editMode && editId) {
//       // PUT request tahrirlash uchun
//       const res = await fetch(`${API_BASE}CRUD/${editId}/`, {
//         method: "PUT",
//         body: formData,
//         credentials: "include",
//       });
//       if (res.ok) {
//         alert("E’lon muvaffaqiyatli yangilandi!");
//         editMode = false;
//         editId = null;
//         form.reset();
//         addBtn.style.display = "inline-block";
//         editBtn.style.display = "none";
//         addSection.style.display = "none";
//         loadProducts();
//         loadMyAds();
//       } else {
//         const errText = await res.text();
//         alert("Xato: E’lon yangilanmadi\n" + errText);
//       }
//     } else {
//       // POST request yangi e’lon qo‘shish
//       const res = await fetch(`${API_BASE}add/`, {
//         method: "POST",
//         body: formData,
//         credentials: "include",
//       });
//       if (res.ok) {
//         alert("E’lon muvaffaqiyatli qo‘shildi!");
//         form.reset();
//         addSection.style.display = "none";
//         loadProducts();
//         loadMyAds();
//       } else {
//         const errText = await res.text();
//         alert("Xato: E’lon qo‘shilmadi\n" + errText);
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Serverga ulanishda xato");
//   }
// });


// const form = document.getElementById("addForm");
// const addSection = document.getElementById("add");
// const addBtn = form.querySelector("button[type='submit']");

// let canSubmit = true; // 30s blok flag

// form.addEventListener("submit", async function (e) {
//   e.preventDefault();

//   if (!canSubmit) {
//     alert("Iltimos, 30 sekund kuting!");
//     return;
//   }

//   const formData = new FormData(form);

//   try {
//     canSubmit = false;      // bloklash
//     addBtn.disabled = true; // buttonni o‘chir

//     // POST request yangi e’lon
//     const res = await fetch(`${API_BASE}add/`, {
//       method: "POST",
//       body: formData,
//       credentials: "include",
//     });

//     if (res.ok) {
//       alert("E’lon muvaffaqiyatli qo‘shildi!");
//       form.reset();
//       addSection.style.display = "none";
//       loadProducts();
//       loadMyAds();

//       // 30 sekund blok
//       let seconds = 30;
//       addBtn.textContent = `Kutish: ${seconds}s`;
//       const timer = setInterval(() => {
//         seconds--;
//         addBtn.textContent = `Kutish: ${seconds}s`;
//         if (seconds <= 0) {
//           clearInterval(timer);
//           addBtn.textContent = "E’lonni joylash";
//           canSubmit = true;
//           addBtn.disabled = false;
//         }
//       }, 1000);

//     } else {
//       const errText = await res.text();
//       alert("Xato: E’lon qo‘shilmadi\n" + errText);
//       canSubmit = true;
//       addBtn.disabled = false;
//     }

//   } catch (err) {
//     console.error(err);
//     alert("Serverga ulanishda xato");
//     canSubmit = true;
//     addBtn.disabled = false;
//   }
// });

const form = document.getElementById("addForm");
const addSection = document.getElementById("add");
const addBtn = form.querySelector("button[type='submit']");

// Xabar ko‘rsatish uchun div yaratish
let msgDiv = document.createElement("div");
msgDiv.style.marginTop = "10px";
msgDiv.style.fontSize = "0.95rem";
msgDiv.style.color = "var(--green)";
form.appendChild(msgDiv);

let canSubmit = true; // 30s blok flag

// Agar eski listener bo‘lsa, uni olib tashlash
form.replaceWith(form.cloneNode(true));
const newForm = document.getElementById("addForm");
const newAddBtn = newForm.querySelector("button[type='submit']");

// Listener faqat bir marta ishlaydi
newForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!canSubmit) {
    msgDiv.textContent = "Iltimos, 30 sekund kuting!";
    msgDiv.style.color = "var(--orange)";
    return;
  }

  const formData = new FormData(newForm);

  try {
    canSubmit = false;
    newAddBtn.disabled = true;
    msgDiv.textContent = "E’lon joylanmoqda...";
    msgDiv.style.color = "var(--blue)";

    const res = await fetch(`${API_BASE}add/`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (res.ok) {
      msgDiv.textContent = "E’lon muvaffaqiyatli qo‘shildi!";
      msgDiv.style.color = "var(--green)";
      newForm.reset();
      addSection.style.display = "none";
      loadProducts();
      loadMyAds();

      // 30 sekund blok
      let seconds = 30;
      newAddBtn.textContent = `Kutish: ${seconds}s`;
      const timer = setInterval(() => {
        seconds--;
        newAddBtn.textContent = `Kutish: ${seconds}s`;
        if (seconds <= 0) {
          clearInterval(timer);
          newAddBtn.textContent = "E’lonni joylash";
          canSubmit = true;
          newAddBtn.disabled = false;
          msgDiv.textContent = "";
        }
      }, 1000);

    } else {
      const errText = await res.text();
      msgDiv.textContent = "Xato: E’lon qo‘shilmadi!";
      msgDiv.style.color = "var(--orange)";
      console.error(errText);
      canSubmit = true;
      newAddBtn.disabled = false;
    }

  } catch (err) {
    msgDiv.textContent = "Serverga ulanishda xato";
    msgDiv.style.color = "var(--orange)";
    console.error(err);
    canSubmit = true;
    newAddBtn.disabled = false;
  }
});


// // EDIT tugmasi bosilganda
// document.addEventListener("click", async (e) => {
//   if (e.target.classList.contains("edit-btn")) {
//     const adCard = e.target.closest(".ad-card");
//     editId = adCard.dataset.id;
//     editMode = true;

//     try {
//       const res = await fetch(`${API_BASE}CRUD/${editId}/`, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Network response not ok");
//       const data = await res.json();

//       // Formani ochish va to'ldirish
//       addSection.style.display = "block";
//       form.elements["holat"].value = data.holat;
//       form.elements["title"].value = data.title;
//       form.elements["kategoriya"].value = data.kategoriya;
//       form.elements["tavsilot"].value = data.tavsilot;
//       form.elements["narx"].value = data.narx;
//       form.elements["number"].value = data.number;
//       form.elements["telegram"].value = data.telegram;

//       // Tugmalarni boshqarish
//       addBtn.style.display = "none";  // Yangi e’lon tugmasi yashirilsin
//       editBtn.style.display = "inline-block"; // Yangilash tugmasi ko‘rsin

//     } catch (err) {
//       console.error(err);
//       alert("E’lon ma’lumotlarini olishda xato");
//     }
//   }
// });

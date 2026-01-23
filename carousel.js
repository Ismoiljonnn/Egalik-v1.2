(function(){
const slidesEl = document.getElementById('slides');
const slides = Array.from(document.querySelectorAll('.slide'));
const dotsContainer = document.getElementById('dots');
const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');


let index = 0;
let interval = null;
const AUTOPLAY_MS = 3000; // 3 sekund


// create dots
slides.forEach((s,i)=>{
const d = document.createElement('div');
d.className='dot'+(i===0?' active':'');
d.dataset.index = i;
d.addEventListener('click', ()=>{
goTo(parseInt(d.dataset.index,10));
restartAutoplay();
});
dotsContainer.appendChild(d);
});


function update(){
slidesEl.style.transform = `translateX(-${index * 100}%)`;
// dots
const dots = Array.from(dotsContainer.children);
dots.forEach((dot,i)=> dot.classList.toggle('active', i===index));
}


function next(){ index = (index + 1) % slides.length; update(); }
function prev(){ index = (index - 1 + slides.length) % slides.length; update(); }
function goTo(i){ index = i % slides.length; update(); }


nextBtn.addEventListener('click', ()=>{ next(); restartAutoplay(); });
prevBtn.addEventListener('click', ()=>{ prev(); restartAutoplay(); });


// pause on hover
// carousel.addEventListener('mouseenter', ()=> stopAutoplay());
// carousel.addEventListener('mouseleave', ()=> startAutoplay());


function startAutoplay(){
if(interval) return;
interval = setInterval(next, AUTOPLAY_MS);
}
function stopAutoplay(){
if(interval){ clearInterval(interval); interval = null; }
}
function restartAutoplay(){ stopAutoplay(); startAutoplay(); }


// init
update();
startAutoplay();

})();

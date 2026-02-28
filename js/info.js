document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const items = document.querySelectorAll(".gallery-item");

  if (!gallery || items.length === 0) return;

  function updateActive() {
    const center = gallery.scrollLeft + gallery.offsetWidth / 2;

    items.forEach(item => {
      const itemCenter =
        item.offsetLeft + item.offsetWidth / 2;

      if (Math.abs(center - itemCenter) < item.offsetWidth / 2) {
        item.classList.add("is-active");
      } else {
        item.classList.remove("is-active");
      }
    });
  }

  gallery.addEventListener("scroll", () => {
    requestAnimationFrame(updateActive);
  });

  updateActive();

  // auto scroll nhẹ
  let auto = setInterval(() => {
    gallery.scrollBy({ left: 1, behavior: "smooth" });
  }, 30);

  gallery.addEventListener("touchstart", () => clearInterval(auto));
});


const galleryImages = [
  // batch 1
  [
    "img/info/1.jpg",
    "img/info/2.jpg",
    "img/info/3.jpg",
    "img/info/4.jpg"
  ],
  // batch 2
  [
    "img/info/5.jpg",
    "img/info/6.jpg",
    "img/info/7.jpg",
    "img/info/8.jpg"
  ],
 
];

const items = document.querySelectorAll(".gallery-item");
let currentIndex = 0;

function updateGallery() {
  items.forEach(item => (item.style.opacity = 0));

  setTimeout(() => {
    galleryImages[currentIndex].forEach((img, i) => {
      items[i].style.backgroundImage = `url(${img})`;
    });

    items.forEach(item => (item.style.opacity = 1));
  }, 400);

  currentIndex = (currentIndex + 1) % galleryImages.length;
}

// init
updateGallery();
setInterval(updateGallery, 6000);

/* =====================================================
   サイドメニュー制御
===================================================== */
const menuBtn = document.querySelector(".hero-menu");
const sideMenu = document.getElementById("sideMenu");
const closeMenu = document.getElementById("closeMenu");

menuBtn?.addEventListener("click", e => {
  e.stopPropagation();
  sideMenu.classList.add("active");
});

closeMenu?.addEventListener("click", e => {
  e.stopPropagation();
  sideMenu.classList.remove("active");
});

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFAhm6KntoMEtcZH7EiY-XwPTk3W5Cvlz-wL2hMGG9Pmb12etBAJuMTNa_jgrB7TuJ7box78Of97dT/pub?output=csv";

const IMAGE_PER_ROW = 12;

async function loadMarqueeImages() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.trim().split("\n");
  rows.shift(); // bỏ header

  // chỉ lấy cột image (B)
  const images = rows
    .map(row => row.split(",")[1])
    .map(v => v?.trim())
    .filter(Boolean);

  shuffle(images);

  const topImages = images.slice(0, IMAGE_PER_ROW);
  const bottomImages = images.slice(IMAGE_PER_ROW, IMAGE_PER_ROW * 2);

  fillRow("row-top", topImages);
  fillRow("row-bottom", bottomImages);
}

function fillRow(id, imgs) {
  const track = document.getElementById(id);

  // nhân đôi để chạy vô hạn
  [...imgs, ...imgs].forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "商品イメージ";
    track.appendChild(img);
  });
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

loadMarqueeImages();

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

const IMAGE_PER_ROW = 12;

async function loadMarqueeImages() {
  let images;
  try {
    images = await Data.loadStoryImages();
  } catch (err) {
    console.error("[story] Failed to load images:", err);
    return;
  }

  shuffle(images);

  const topImages = images.slice(0, IMAGE_PER_ROW);
  const bottomImages = images.slice(IMAGE_PER_ROW, IMAGE_PER_ROW * 2);

  fillRow("row-top", topImages);
  fillRow("row-bottom", bottomImages);
}

function fillRow(id, imgs) {
  const track = document.getElementById(id);
  if (!track) return;

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
Data.initSideMenu();

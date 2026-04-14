// scroll reveal
const hiddenElements = document.querySelectorAll('section, .waterfall-grid, .split-reveal, .mosaic-tilt, .bubble-text, .interactive-module, .qr-center, footer, .card-stack, .snack-circle');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

hiddenElements.forEach(el => {
  el.classList.add('hidden');
  observer.observe(el);
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.querySelector('.close-lightbox');

function openLightbox(src) {
  if (lightbox && lightboxImg) {
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}
function closeLightboxModal() {
  if (lightbox) {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }
}
if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxModal);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightboxModal(); });

function bindLightboxToImages() {
  const clickable = document.querySelectorAll('.waterfall-item img, .mosaic-flex img, .stack-img img, .morning-market img, .circle-item img, .split-left, .split-right');
  clickable.forEach(img => {
    if (img.tagName === 'IMG') {
      img.removeEventListener('click', lightboxHandler);
      img.addEventListener('click', lightboxHandler);
      img.style.cursor = 'pointer';
    }
  });
}
function lightboxHandler(e) { openLightbox(e.currentTarget.src); }

// Wuhan City Facts
const cityFacts = [
  "🌉 Wuhan has over 10 bridges across the Yangtze River – the First Bridge opened in 1957 with Soviet help.",
  "🌸 Wuhan University's cherry blossom avenue was originally planted by the Japanese army in 1939, now a symbol of peace.",
  "🏯 Yellow Crane Tower has been destroyed and rebuilt more than 12 times over 1700 years.",
  "🏞️ East Lake is 5 times larger than Hangzhou's West Lake and hosts international rowing events.",
  "📚 Wuhan is home to over 80 universities, including the prestigious Wuhan University and Huazhong University of Science.",
  "🔫 The Wuchang Uprising of 1911 started here, ending over 2000 years of imperial rule in China.",
  "🍜 Wuhan's 'reganmian' (hot dry noodles) is recognized as an Intangible Cultural Heritage of Hubei Province.",
  "🚂 Wuhan is the heart of China's high-speed rail network – you can reach Beijing, Shanghai, Guangzhou within 4-5 hours."
];

const foodFacts = [
  "🍜 Over 5 million bowls of reganmian are consumed daily in Wuhan – that's one for every two citizens!",
  "🥘 Doupi is made by spreading beaten eggs on a hot pan, then adding sticky rice and fillings – it's a breakfast art.",
  "🍢 Hubu Alley is 150 meters long but houses over 100 food stalls – one of China's most concentrated breakfast streets.",
  "🦞 Wuhan is famous for crayfish (xiaolongxia) – in summer, people eat over 1,000 tons per day!",
  "🍠 Mianwo (fried doughnut) is shaped like a ring with a crispy edge and soft center – often dipped in soy milk.",
  "🥣 Lotus root soup is a winter staple – the lotus root grows in the lakes around Wuhan, creating a 'thread' when broken.",
  "🌶️ Wuhan's hot dry noodles use alkaline noodles – they are boiled, then cooled with oil to achieve the perfect chew.",
  "🍳 'Guozao' culture means people eat breakfast standing, walking, or squatting – anything to get that morning fix."
];

function initRandomFact(buttonId, factArray, displayId) {
  const btn = document.getElementById(buttonId);
  const displayPara = document.getElementById(displayId);
  if (btn && displayPara) {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const randomIdx = Math.floor(Math.random() * factArray.length);
      displayPara.textContent = factArray[randomIdx];
      displayPara.style.transform = 'scale(1.02)';
      setTimeout(() => { if(displayPara) displayPara.style.transform = ''; }, 200);
    });
  }
}

setTimeout(() => {
  const isFoodPage = document.body.classList.contains('food-wuhan') || document.querySelector('.food-hero-wuhan') !== null;
  if (isFoodPage) {
    initRandomFact('randomFoodFactBtn', foodFacts, 'funFactText');
  } else {
    initRandomFact('randomFactBtn', cityFacts, 'funFactText');
  }
  bindLightboxToImages();

  // Parallax effect for .float-parallax
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    window.addEventListener('scroll', () => {
      let scrollY = window.scrollY;
      parallaxBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    });
  }

  const observerImages = new MutationObserver(() => bindLightboxToImages());
  observerImages.observe(document.body, { childList: true, subtree: true });
}, 50);

window.addEventListener('load', () => bindLightboxToImages());// JavaScript Document
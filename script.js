// ========== 全局心愿清单数据 ==========
let wishlist = [];  // 存储 { id, name, img, type }

// ========== DOM 元素缓存 ==========
let toastEl = null;
let lightbox = null;
let lightboxImg = null;

// ========== 辅助函数：轻提示 ==========
function showToast(msg, duration = 2000) {
  if (!toastEl) {
    toastEl = document.getElementById('toastMsg');
    if (!toastEl) return;
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  setTimeout(() => {
    if (toastEl) toastEl.style.opacity = '0';
  }, duration);
}

// ========== 更新头部心愿单数量徽章 ==========
function updateWishlistBadge() {
  const badgeSpan = document.getElementById('wishlistCount');
  if (badgeSpan) badgeSpan.innerText = wishlist.length;
}

// ========== 保存心愿单到 localStorage ==========
function saveWishlist() {
  localStorage.setItem('wuhan_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
  renderWishlistModal();  // 实时刷新弹窗内容
}

// ========== 加载本地心愿单 ==========
function loadWishlist() {
  const stored = localStorage.getItem('wuhan_wishlist');
  if (stored) {
    try {
      wishlist = JSON.parse(stored);
    } catch(e) {
      wishlist = [];
    }
  } else {
    wishlist = [];
  }
  updateWishlistBadge();
}

// ========== 添加到心愿单 ==========
function addToWishlist(name, imgUrl, type = 'other') {
  if (!name || !imgUrl) return false;
  const id = `${type}_${name}`.replace(/\s/g, '_').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_]/g, '');
  const exists = wishlist.some(item => item.id === id);
  if (exists) {
    showToast(`? "${name}" is already in your wishlist`);
    return false;
  }
  wishlist.push({ id, name, img: imgUrl, type });
  saveWishlist();
  showToast(`?? Added "${name}" to your wishlist`);
  return true;
}

// ========== 从心愿单移除 ==========
function removeFromWishlist(id) {
  wishlist = wishlist.filter(item => item.id !== id);
  saveWishlist();
  showToast('Removed from wishlist');
}

// ========== 渲染心愿单模态框内容 ==========
function renderWishlistModal() {
  const container = document.getElementById('wishlistItemsContainer');
  if (!container) return;
  if (!wishlist.length) {
    container.innerHTML = '<p style="text-align:center; color:gray;">? No items yet. Click "Wishlist" to add landmarks or food.</p>';
    return;
  }
  const html = wishlist.map(item => `
    <div class="wishlist-item" data-id="${item.id}">
      <img class="wishlist-img" src="${item.img}" alt="${escapeHtml(item.name)}" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2255%22%20text-anchor%3D%22middle%22%20fill%3D%22%23999%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E'">
      <div class="wishlist-info">
        <h4>${escapeHtml(item.name)}</h4>
        <small>${item.type === 'food' ? '?? Food' : '??? Landmark'}</small>
      </div>
      <button class="remove-wish-btn" data-id="${item.id}">??? Remove</button>
    </div>
  `).join('');
  container.innerHTML = html;
  // 绑定移除按钮事件
  document.querySelectorAll('.remove-wish-btn').forEach(btn => {
    btn.removeEventListener('click', removeHandler);
    btn.addEventListener('click', removeHandler);
  });
}

// 移除事件的统一处理函数
function removeHandler(e) {
  e.stopPropagation();
  const id = e.currentTarget.getAttribute('data-id');
  if (id) removeFromWishlist(id);
}

// 简单的防XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ========== 模态框控制 ==========
function openWishlistModal() {
  renderWishlistModal();
  const modal = document.getElementById('wishlistModal');
  if (modal) modal.style.display = 'flex';
}
function closeWishlistModal() {
  const modal = document.getElementById('wishlistModal');
  if (modal) modal.style.display = 'none';
}
function openExitModal() {
  const modal = document.getElementById('exitConfirmModal');
  if (modal) modal.style.display = 'flex';
}
function closeExitModal() {
  const modal = document.getElementById('exitConfirmModal');
  if (modal) modal.style.display = 'none';
}
function confirmExit() {
  wishlist = [];
  saveWishlist();
  showToast('?? Exited journey. Wishlist cleared. Hope to see you again!');
  closeExitModal();
}

// ========== 绑定所有“加入心愿单”按钮（动态+静态） ==========
function bindWishlistButtons() {
  const btns = document.querySelectorAll('.add-wishlist-btn');
  btns.forEach(btn => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // 查找最近的卡片容器
      let parentCard = this.closest('.waterfall-item') || this.closest('.stack-card') || this.closest('.circle-item');
      let name = '', imgSrc = '', type = 'other';
      if (parentCard) {
        if (parentCard.classList.contains('waterfall-item')) {
          const captionH2 = parentCard.querySelector('.waterfall-caption h2');
          name = captionH2 ? captionH2.innerText.replace(/[?????????]/g, '').trim() : parentCard.getAttribute('data-name') || 'Wuhan Landmark';
          const imgElem = parentCard.querySelector('img');
          imgSrc = imgElem ? imgElem.src : '';
          type = 'landmark';
        } else if (parentCard.classList.contains('stack-card')) {
          const textH2 = parentCard.querySelector('.stack-text h2');
          name = textH2 ? textH2.innerText.replace(/[??????]/g, '').trim() : parentCard.getAttribute('data-name') || 'Wuhan Delicacy';
          const imgElem = parentCard.querySelector('.stack-img img');
          imgSrc = imgElem ? imgElem.src : '';
          type = 'food';
        } else if (parentCard.classList.contains('circle-item')) {
          const span = parentCard.querySelector('span');
          name = span ? span.innerText : parentCard.getAttribute('data-name') || 'Local Bite';
          const imgElem = parentCard.querySelector('img');
          imgSrc = imgElem ? imgElem.src : '';
          type = 'food';
        }
      } else {
        // 备用：从按钮属性获取
        name = this.getAttribute('data-name');
        imgSrc = this.getAttribute('data-img');
      }
      if (name && imgSrc) {
        addToWishlist(name, imgSrc, type);
      } else {
        showToast('Unable to add, please try again');
      }
    });
  });
}

// ========== 滚动显示动画 ==========
function initScrollReveal() {
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
}

// ========== 灯箱功能 ==========
function initLightbox() {
  lightbox = document.getElementById('lightbox');
  lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;
  const closeBtn = document.querySelector('.close-lightbox');
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeLightboxModal);
    closeBtn.addEventListener('click', closeLightboxModal);
  }
  lightbox.removeEventListener('click', lightboxClickHandler);
  lightbox.addEventListener('click', lightboxClickHandler);
}

function lightboxClickHandler(e) {
  if (e.target === lightbox) closeLightboxModal();
}
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
function bindLightboxToImages() {
  const clickableImgs = document.querySelectorAll('.waterfall-item img, .mosaic-flex img, .stack-img img, .morning-market img, .circle-item img');
  clickableImgs.forEach(img => {
    if (img.tagName === 'IMG') {
      img.style.cursor = 'pointer';
      img.removeEventListener('click', imgClickHandler);
      img.addEventListener('click', imgClickHandler);
    }
  });
}
function imgClickHandler(e) {
  openLightbox(e.currentTarget.src);
}

// ========== 随机趣闻 ==========
const cityFacts = [
  "?? Wuhan has over 10 bridges across the Yangtze River – the First Bridge opened in 1957 with Soviet help.",
  "?? Wuhan University's cherry blossom avenue was originally planted by the Japanese army in 1939, now a symbol of peace.",
  "?? Yellow Crane Tower has been destroyed and rebuilt more than 12 times over 1700 years.",
  "??? East Lake is 5 times larger than Hangzhou's West Lake and hosts international rowing events.",
  "?? Wuhan is home to over 80 universities, including the prestigious Wuhan University and Huazhong University of Science.",
  "?? The Wuchang Uprising of 1911 started here, ending over 2000 years of imperial rule in China.",
  "?? Wuhan's 'reganmian' (hot dry noodles) is recognized as an Intangible Cultural Heritage of Hubei Province.",
  "?? Wuhan is the heart of China's high-speed rail network – you can reach Beijing, Shanghai, Guangzhou within 4-5 hours."
];
const foodFacts = [
  "?? Over 5 million bowls of reganmian are consumed daily in Wuhan – that's one for every two citizens!",
  "?? Doupi is made by spreading beaten eggs on a hot pan, then adding sticky rice and fillings – it's a breakfast art.",
  "?? Hubu Alley is 150 meters long but houses over 100 food stalls – one of China's most concentrated breakfast streets.",
  "?? Wuhan is famous for crayfish (xiaolongxia) – in summer, people eat over 1,000 tons per day!",
  "?? Mianwo (fried doughnut) is shaped like a ring with a crispy edge and soft center – often dipped in soy milk.",
  "?? Lotus root soup is a winter staple – the lotus root grows in the lakes around Wuhan, creating a 'thread' when broken.",
  "?? 'Guozao' culture means people eat breakfast standing, walking, or squatting – anything to get that morning fix.",
  "?? Wuhan's hot dry noodles use alkaline noodles – they are boiled, then cooled with oil to achieve the perfect chew."
];

function initRandomFact(buttonId, factArray, displayId) {
  const btn = document.getElementById(buttonId);
  const displayPara = document.getElementById(displayId);
  if (!btn || !displayPara) return;
  // 避免重复绑定
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    const randomIdx = Math.floor(Math.random() * factArray.length);
    displayPara.textContent = factArray[randomIdx];
    displayPara.style.transform = 'scale(1.02)';
    setTimeout(() => {
      if (displayPara) displayPara.style.transform = '';
    }, 200);
  });
}

// ========== 视差效果 ==========
function initParallax() {
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    window.addEventListener('scroll', () => {
      let scrollY = window.scrollY;
      parallaxBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    });
  }
}

// ========== 模态框全局关闭（点击背景） ==========
function initModalBackdropClose() {
  const wishModal = document.getElementById('wishlistModal');
  const exitModal = document.getElementById('exitConfirmModal');
  if (wishModal) {
    wishModal.addEventListener('click', (e) => {
      if (e.target === wishModal) closeWishlistModal();
    });
  }
  if (exitModal) {
    exitModal.addEventListener('click', (e) => {
      if (e.target === exitModal) closeExitModal();
    });
  }
}

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 加载心愿单
  loadWishlist();
  // 绑定心愿单按钮
  bindWishlistButtons();
  // 滚动动画
  initScrollReveal();
  // 灯箱
  initLightbox();
  bindLightboxToImages();
  // 随机事实（根据页面类型）
  const isFoodPage = document.body.classList.contains('food-wuhan') || !!document.querySelector('.food-hero-wuhan');
  if (isFoodPage) {
    initRandomFact('randomFoodFactBtn', foodFacts, 'funFactText');
  } else {
    initRandomFact('randomFactBtn', cityFacts, 'funFactText');
  }
  // 视差
  initParallax();
  // 模态框背景关闭
  initModalBackdropClose();
  
  // 心愿单弹窗开关
  const openWishBtn = document.getElementById('openWishlistBtn');
  if (openWishBtn) {
    openWishBtn.removeEventListener('click', openWishlistModal);
    openWishBtn.addEventListener('click', openWishlistModal);
  }
  const closeWishBtn = document.getElementById('closeWishlistModal');
  if (closeWishBtn) {
    closeWishBtn.removeEventListener('click', closeWishlistModal);
    closeWishBtn.addEventListener('click', closeWishlistModal);
  }
  
  // 退出弹窗逻辑
  const exitBtns = document.querySelectorAll('#exitSiteBtn');
  exitBtns.forEach(btn => {
    btn.removeEventListener('click', openExitModal);
    btn.addEventListener('click', openExitModal);
  });
  const closeExitBtn = document.getElementById('closeExitModal');
  if (closeExitBtn) {
    closeExitBtn.removeEventListener('click', closeExitModal);
    closeExitBtn.addEventListener('click', closeExitModal);
  }
  const confirmExitBtn = document.getElementById('confirmExitBtn');
  if (confirmExitBtn) {
    confirmExitBtn.removeEventListener('click', confirmExit);
    confirmExitBtn.addEventListener('click', confirmExit);
  }
  const cancelExitBtn = document.getElementById('cancelExitBtn');
  if (cancelExitBtn) {
    cancelExitBtn.removeEventListener('click', closeExitModal);
    cancelExitBtn.addEventListener('click', closeExitModal);
  }
  
  // 动态监听新加入的图片和按钮（适用于未来可能动态加载的内容）
  const mutationObserver = new MutationObserver(() => {
    bindWishlistButtons();
    bindLightboxToImages();
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
});

// 确保页面完全加载后再绑定一次（防止异步遗漏）
window.addEventListener('load', () => {
  bindWishlistButtons();
  bindLightboxToImages();
});
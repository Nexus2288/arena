/**
 * script.js
 * Customer site logic for Love Over Coffee.
 * Talks ONLY to the Apps Script backend via window.LOC_CONFIG.API_URL.
 *
 * NOTE: Notifications.gs source was not available while writing this file.
 * The notification subscribe/poll section below is marked with ASSUMPTION
 * comments and must be re-checked once that file is shared.
 */
'use strict';

(function () {
  const API_URL = (window.LOC_CONFIG && window.LOC_CONFIG.API_URL) || '';
  const CUSTOMER_KEY_STORAGE = 'loc_customer_key';
  const SEEN_NOTIF_STORAGE = 'loc_seen_notifications';
  const NOTIF_OPT_STORAGE = 'loc_notif_opted';

  /* ---------------- DOM shortcuts ---------------- */
  const $ = (id) => document.getElementById(id);
  const qAll = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const el = {
    screenLoading: $('screenLoading'),
    screenError: $('screenError'),
    errorTitle: $('errorTitle'),
    errorMessage: $('errorMessage'),
    errorRetryBtn: $('errorRetryBtn'),
    app: $('app'),
    cafeLogo: $('cafeLogo'),
    cafeName: $('cafeName'),
    cafeTagline: $('cafeTagline'),
    tableBadge: $('tableBadge'),
    tableNumber: $('tableNumber'),
    aboutBtn: $('aboutBtn'),
    viewMenu: $('viewMenu'),
    heroSection: $('heroSection'),
    heroImage: $('heroImage'),
    heroTableText: $('heroTableText'),
    activeOrderBanner: $('activeOrderBanner'),
    activeOrderTitle: $('activeOrderTitle'),
    activeOrderSub: $('activeOrderSub'),
    notifyCard: $('notifyCard'),
    notifyText: $('notifyText'),
    notifyBtn: $('notifyBtn'),
    searchInput: $('searchInput'),
    searchClearBtn: $('searchClearBtn'),
    categoryBar: $('categoryBar'),
    vegOnlyToggle: $('vegOnlyToggle'),
    menuList: $('menuList'),
    menuEmpty: $('menuEmpty'),
    menuEmptyText: $('menuEmptyText'),
    viewCart: $('viewCart'),
    cartBackBtn: $('cartBackBtn'),
    cartTableNumber: $('cartTableNumber'),
    cartItems: $('cartItems'),
    cartEmpty: $('cartEmpty'),
    cartAddMoreBtn: $('cartAddMoreBtn'),
    clearCartBtn: $('clearCartBtn'),
    orderForm: $('orderForm'),
    customerName: $('customerName'),
    customerNameError: $('customerNameError'),
    customerMobile: $('customerMobile'),
    customerMobileError: $('customerMobileError'),
    formTable: $('formTable'),
    specialRequest: $('specialRequest'),
    specialCount: $('specialCount'),
    couponCode: $('couponCode'),
    applyCouponBtn: $('applyCouponBtn'),
    removeCouponBtn: $('removeCouponBtn'),
    couponMessage: $('couponMessage'),
    couponTiersTitle: $('couponTiersTitle'),
    couponTiers: $('couponTiers'),
    sumSubtotal: $('sumSubtotal'),
    sumDiscountRow: $('sumDiscountRow'),
    sumDiscountLabel: $('sumDiscountLabel'),
    sumDiscount: $('sumDiscount'),
    sumTotal: $('sumTotal'),
    formError: $('formError'),
    checkoutBar: $('checkoutBar'),
    checkoutTotal: $('checkoutTotal'),
    placeOrderBtn: $('placeOrderBtn'),
    viewTrack: $('viewTrack'),
    trackBackBtn: $('trackBackBtn'),
    trackTableNumber: $('trackTableNumber'),
    trackSuccess: $('trackSuccess'),
    trackOrderId: $('trackOrderId'),
    trackTime: $('trackTime'),
    trackSteps: $('trackSteps'),
    trackStatusText: $('trackStatusText'),
    trackStatusUpdated: $('trackStatusUpdated'),
    trackCancelled: $('trackCancelled'),
    trackItems: $('trackItems'),
    trackSubtotal: $('trackSubtotal'),
    trackDiscountRow: $('trackDiscountRow'),
    trackDiscountLabel: $('trackDiscountLabel'),
    trackDiscount: $('trackDiscount'),
    trackTotal: $('trackTotal'),
    trackSpecialBox: $('trackSpecialBox'),
    trackSpecial: $('trackSpecial'),
    trackRefreshBtn: $('trackRefreshBtn'),
    trackLoading: $('trackLoading'),
    trackContent: $('trackContent'),
    activeOrderRefreshBtn: $('activeOrderRefreshBtn'),
    newOrderBtn: $('newOrderBtn'),
    trackHint: $('trackHint'),
    cartBar: $('cartBar'),
    viewCartBtn: $('viewCartBtn'),
    cartBarCount: $('cartBarCount'),
    cartBarTotal: $('cartBarTotal'),
    aboutModal: $('aboutModal'),
    aboutLogo: $('aboutLogo'),
    aboutName: $('aboutName'),
    aboutTagline: $('aboutTagline'),
    aboutText: $('aboutText'),
    aboutReviewBtn: $('aboutReviewBtn'),
    aboutInstagram: $('aboutInstagram'),
    aboutFacebook: $('aboutFacebook'),
    aboutYoutube: $('aboutYoutube'),
    aboutX: $('aboutX'),
    notifModal: $('notifModal'),
    notifImage: $('notifImage'),
    notifTitle: $('notifTitle'),
    notifMessage: $('notifMessage'),
    notifLink: $('notifLink'),
    orderConfirmedModal: $('orderConfirmedModal'),
confirmOrderId: $('confirmOrderId'),
confirmRewardBox: $('confirmRewardBox'),
confirmRewardCode: $('confirmRewardCode'),
confirmRewardPercent: $('confirmRewardPercent'),
confirmRewardMin: $('confirmRewardMin'),
confirmRewardExpiry: $('confirmRewardExpiry'),
confirmRewardCopyBtn: $('confirmRewardCopyBtn'),
orderConfirmedDoneBtn: $('orderConfirmedDoneBtn'),
trackRewardBox: $('trackRewardBox'),
trackRewardCode: $('trackRewardCode'),
trackRewardPercent: $('trackRewardPercent'),
trackRewardMin: $('trackRewardMin'),
trackRewardStatusNote: $('trackRewardStatusNote'),
trackRewardCopyBtn: $('trackRewardCopyBtn'),
    toastHost: $('toastHost'),
    trackOrdersHeading: $('trackOrdersHeading'),
trackOrdersCount: $('trackOrdersCount'),
trackOrdersList: $('trackOrdersList'),
trackGrandTotal: $('trackGrandTotal')
  };

  const tpl = {
    chip: $('tplChip'),
    category: $('tplCategory'),
    menuCard: $('tplMenuCard'),
    cartLine: $('tplCartLine'),
    trackLine: $('tplTrackLine'),
    orderCard: $('tplOrderCard'),
    tier: $('tplTier')
  };

  function cloneTpl(t) {
    return t.content.firstElementChild.cloneNode(true);
  }
  function role(root, name) {
    return root.querySelector('[data-role="' + name + '"]');
  }

  /* ---------------- State ---------------- */
  const state = {
    tableToken: '',
    customerKey: '',
    table: null,
    publicConfig: null,
    categories: [],
    items: [],
    cart: new Map(),
    coupon: null,
    searchTerm: '',
    vegOnly: false,
    currentView: 'menu',
    currentOrder: null,
    pollTimer: null,
    notifTimer: null,
    notifOptedIn: false,
    customerName: '',
    mobile: '',
    sessionOrders: []
  };

  /* ---------------- Toast ---------------- */
  function showToast(message, type) {
    const div = document.createElement('div');
    div.className = 'toast' + (type ? ' toast--' + type : '');
    div.textContent = message;
    el.toastHost.appendChild(div);
    setTimeout(function () { div.remove(); }, 3400);
  }

  /* ---------------- Money formatting ---------------- */
  function formatMoney(amount) {
    const currency = (state.publicConfig && state.publicConfig.currency) || '\u20b9';
    const n = Math.round((Number(amount) || 0) * 100) / 100;
    const negative = n < 0;
    const parts = Math.abs(n).toFixed(2).split('.');
    let intPart = parts[0];
    const last3 = intPart.slice(-3);
    let rest = intPart.slice(0, -3);
    if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',';
    const decimals = parts[1] === '00' ? '' : '.' + parts[1];
    return (negative ? '-' : '') + currency + rest + last3 + decimals;
  }

  /* ---------------- API ---------------- */
  function apiError(code, message) {
    const e = new Error(message);
    e.isApiError = true;
    e.code = code;
    return e;
  }

  function apiCall(action, payload) {
    const body = Object.assign({ action: action }, payload || {});
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (!json || typeof json !== 'object') {
        throw apiError('SERVER_ERROR', 'Unexpected response from the server.');
      }
      if (json.ok) return json.data;
      throw apiError(json.code || 'SERVER_ERROR', json.message || 'Something went wrong.');
    }).catch(function (err) {
      if (err && err.isApiError) throw err;
      throw apiError('NETWORK_ERROR', 'Could not reach the server. Please check your internet connection.');
    });
  }

  function handleFatalIfNeeded(err) {
    if (err && (err.code === 'INVALID_TABLE' || err.code === 'INACTIVE_TABLE')) {
      showFatalError('This table is not available', err.message);
      return true;
    }
    return false;
  }

  /* ---------------- Screens ---------------- */
  function showFatalError(title, message) {
    el.screenLoading.hidden = true;
    el.app.hidden = true;
    el.screenError.hidden = false;
    el.errorTitle.textContent = title || 'Something went wrong';
    el.errorMessage.textContent = message || 'Please try again.';
    el.errorRetryBtn.hidden = false;
  }
  function showApp() {
    el.screenLoading.hidden = true;
    el.screenError.hidden = true;
    el.app.hidden = false;
  }

  el.errorRetryBtn.addEventListener('click', function () {
    window.location.reload();
  });

  /* ---------------- customerKey / tableToken ---------------- */
  function readTableTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get('t') || '').trim();
  }

  function randomAlphaNumeric(length) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const limit = Math.floor(256 / alphabet.length) * alphabet.length;
    let out = '';
    const bytes = new Uint8Array(length * 3);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    let i = 0;
    while (out.length < length && i < bytes.length) {
      const b = bytes[i++];
      if (b < limit) out += alphabet.charAt(b % alphabet.length);
    }
    while (out.length < length) out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    return out;
  }

  function getOrCreateCustomerKey() {
    let key = '';
    try { key = localStorage.getItem(CUSTOMER_KEY_STORAGE) || ''; } catch (e) { key = ''; }
    if (!/^[A-Za-z0-9]{16,64}$/.test(key)) {
      key = randomAlphaNumeric(32);
      try { localStorage.setItem(CUSTOMER_KEY_STORAGE, key); } catch (e) { /* ignore */ }
    }
    return key;
  }

  /* ---------------- Cart persistence ---------------- */
  function cartStorageKey() { return 'loc_cart_' + state.tableToken; }
  function saveCart() {
    try { localStorage.setItem(cartStorageKey(), JSON.stringify(Array.from(state.cart.values()))); }
    catch (e) { /* ignore */ }
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem(cartStorageKey());
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach(function (l) { if (l && l.itemId) state.cart.set(l.itemId, l); });
    } catch (e) { /* ignore */ }
  }
  function clearCartStorage() {
    try { localStorage.removeItem(cartStorageKey()); } catch (e) { /* ignore */ }
  }

  /* ================================================================ */
  /* Boot                                                              */
  /* ================================================================ */
  function boot() {
    if (!API_URL) {
      showFatalError('Setup incomplete', 'The ordering system is not configured yet. Please contact the cafe owner.');
      return;
    }
    state.tableToken = readTableTokenFromUrl();
    if (!state.tableToken) {
      showFatalError('Table not found', 'This link is missing a table code. Please scan the QR code on your table.');
      return;
    }
    state.customerKey = getOrCreateCustomerKey();
    loadCustomerDetails();
    loadCart();

    Promise.all([
      apiCall('getPublicConfig', {}),
      apiCall('resolveTable', { tableToken: state.tableToken }),
      apiCall('getMenu', { tableToken: state.tableToken })
    ]).then(function (results) {
      state.publicConfig = results[0];
      state.table = results[1];
      state.categories = results[2].categories || [];
      state.items = results[2].items || [];
      applyBranding();
      applyTableInfo();
      renderMenu();
      renderCouponTiers();
      bindEvents();
      prefillCustomerDetails();
      showApp();
      refreshActiveOrder();
      maybeShowNotifyCard();
      startNotificationPolling();
    }).catch(function (err) {
      if (!handleFatalIfNeeded(err)) {
        showFatalError('Could not load the menu', err.message || 'Please try again.');
      }
    });
  }

  /* ---------------- Branding / table info ---------------- */
  function applyBranding() {
    const c = state.publicConfig;
    document.title = c.cafeName || 'Menu';
    el.cafeName.textContent = c.cafeName || '';
    el.cafeTagline.textContent = c.tagline || '';
    if (c.logoUrl) { el.cafeLogo.src = c.logoUrl; el.cafeLogo.hidden = false; }
    if (c.heroUrl) { el.heroImage.src = c.heroUrl; el.heroImage.hidden = false; }
    else { el.heroSection.hidden = true; }
    el.aboutName.textContent = c.cafeName || '';
    el.aboutTagline.textContent = c.tagline || '';
    el.aboutText.textContent = c.about || '';
    if (c.logoUrl) { el.aboutLogo.src = c.logoUrl; el.aboutLogo.hidden = false; }
    if (c.googleReviewUrl) { el.aboutReviewBtn.href = c.googleReviewUrl; el.aboutReviewBtn.hidden = false; }
    bindSocial(el.aboutInstagram, c.social && c.social.instagram);
    bindSocial(el.aboutFacebook, c.social && c.social.facebook);
    bindSocial(el.aboutYoutube, c.social && c.social.youtube);
    bindSocial(el.aboutX, c.social && c.social.x);
  }
  function bindSocial(anchor, url) {
    if (url) { anchor.href = url; anchor.hidden = false; } else { anchor.hidden = true; }
  }

  function applyTableInfo() {
    const t = state.table;
    el.tableNumber.textContent = t.tableNumber;
    el.heroTableText.textContent = 'Table ' + t.tableNumber;
    el.cartTableNumber.textContent = t.tableNumber;
    el.trackTableNumber.textContent = t.tableNumber;
    el.formTable.textContent = 'Table ' + t.tableNumber;
  }

  /* ================================================================ */
  /* Menu rendering                                                    */
  /* ================================================================ */
  let categoryObserver = null;

  function slugify(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'cat';
  }

  function renderMenu() {
    el.categoryBar.innerHTML = '';
    el.menuList.innerHTML = '';

    const allChip = cloneTpl(tpl.chip);
    allChip.textContent = 'All';
    allChip.dataset.category = '__all__';
    allChip.classList.add('is-active');
    el.categoryBar.appendChild(allChip);

    state.categories.forEach(function (cat) {
      const chip = cloneTpl(tpl.chip);
      chip.textContent = cat;
      chip.dataset.category = cat;
      el.categoryBar.appendChild(chip);
    });
    el.categoryBar.addEventListener('click', onCategoryChipClick);

    const itemsByCategory = {};
    state.items.forEach(function (item) {
      (itemsByCategory[item.category] = itemsByCategory[item.category] || []).push(item);
    });

    state.categories.forEach(function (cat) {
      const section = cloneTpl(tpl.category);
      section.id = 'cat-' + slugify(cat);
      role(section, 'title').textContent = cat;
      const itemsHost = role(section, 'items');
      (itemsByCategory[cat] || []).forEach(function (item) {
        itemsHost.appendChild(buildMenuCard(item));
      });
      el.menuList.appendChild(section);
    });

    setupScrollSpy();
    applyFilters();
  }

  function buildMenuCard(item) {
    const card = cloneTpl(tpl.menuCard);
    card.dataset.itemId = item.itemId;
    card.dataset.name = item.itemName.toLowerCase();
    card.dataset.veg = item.vegStatus;

    const vegMark = role(card, 'vegMark');
    if (item.vegStatus === 'NON_VEG') vegMark.classList.add('is-nonveg');

    role(card, 'name').textContent = item.itemName;

    const tagEl = role(card, 'tag');
    if (item.tag) { tagEl.textContent = item.tag; tagEl.hidden = false; }

    const taglineEl = role(card, 'tagline');
    if (item.tagline) taglineEl.textContent = item.tagline; else taglineEl.hidden = true;

    role(card, 'price').textContent = formatMoney(item.price);

    if (!item.available) {
      card.classList.add('is-unavailable');
      role(card, 'unavailable').hidden = false;
    }

    const addBtn = role(card, 'addBtn');
    const qtyControl = role(card, 'qtyControl');
    const qtyValue = role(card, 'qty');
    const minusBtn = role(card, 'minusBtn');
    const plusBtn = role(card, 'plusBtn');

    function syncQtyUi() {
      const line = state.cart.get(item.itemId);
      const qty = line ? line.quantity : 0;
      if (qty > 0) {
        addBtn.hidden = true;
        qtyControl.hidden = false;
        qtyValue.textContent = String(qty);
      } else {
        addBtn.hidden = false;
        qtyControl.hidden = true;
      }
    }

    addBtn.addEventListener('click', function () { addToCart(item, 1); });
    plusBtn.addEventListener('click', function () { addToCart(item, 1); });
    minusBtn.addEventListener('click', function () { addToCart(item, -1); });

    card._syncQtyUi = syncQtyUi;
    syncQtyUi();
    return card;
  }

  function refreshAllMenuCardQuantities() {
    qAll('.menu-card', el.menuList).forEach(function (card) {
      if (card._syncQtyUi) card._syncQtyUi();
    });
  }

  function onCategoryChipClick(e) {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    qAll('.chip', el.categoryBar).forEach(function (c) { c.classList.remove('is-active'); });
    chip.classList.add('is-active');
    if (chip.dataset.category === '__all__') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = document.getElementById('cat-' + slugify(chip.dataset.category));
    if (section) {
      const top = section.getBoundingClientRect().top + window.pageYOffset - 150;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  function setupScrollSpy() {
    if (categoryObserver) categoryObserver.disconnect();
    const sections = qAll('.category-section', el.menuList);
    if (!sections.length || !('IntersectionObserver' in window)) return;
    categoryObserver = new IntersectionObserver(function (entries) {
      let best = null;
      entries.forEach(function (entry) {
        if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
      });
      if (best) {
        const catName = role(best.target, 'title').textContent;
        qAll('.chip', el.categoryBar).forEach(function (c) {
          c.classList.toggle('is-active', c.dataset.category === catName);
        });
      }
    }, { rootMargin: '-160px 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] });
    sections.forEach(function (s) { categoryObserver.observe(s); });
  }

  function applyFilters() {
    const term = state.searchTerm.trim().toLowerCase();
    let anyVisible = false;
    qAll('.category-section', el.menuList).forEach(function (section) {
      let sectionHasVisible = false;
      qAll('.menu-card', section).forEach(function (card) {
        const matchesSearch = !term || card.dataset.name.indexOf(term) !== -1;
        const matchesVeg = !state.vegOnly || card.dataset.veg === 'VEG';
        const visible = matchesSearch && matchesVeg;
        card.hidden = !visible;
        if (visible) sectionHasVisible = true;
      });
      section.hidden = !sectionHasVisible;
      if (sectionHasVisible) anyVisible = true;
    });
    el.menuEmpty.hidden = anyVisible;
    if (!anyVisible) {
      el.menuEmptyText.textContent = (term || state.vegOnly)
        ? 'No items match your search.'
        : 'No items available right now.';
    }
  }

  /* ================================================================ */
  /* Cart                                                              */
  /* ================================================================ */
  function addToCart(item, delta) {
    const existing = state.cart.get(item.itemId);
    const maxQty = (state.publicConfig && state.publicConfig.maxItemQuantity) || 20;
    let qty = (existing ? existing.quantity : 0) + delta;
    if (qty > maxQty) {
      qty = maxQty;
      showToast('You can order at most ' + maxQty + ' of this item.', 'error');
    }
    if (qty <= 0) {
      state.cart.delete(item.itemId);
    } else {
      state.cart.set(item.itemId, {
        itemId: item.itemId,
        itemName: item.itemName,
        category: item.category,
        price: item.price,
        vegStatus: item.vegStatus,
        quantity: qty
      });
    }
    saveCart();
    onCartChanged();
  }

  function removeFromCartCompletely(itemId) {
    state.cart.delete(itemId);
    saveCart();
    onCartChanged();
  }

  function clearCart() {
    state.cart.clear();
    state.coupon = null;
    saveCart();
    onCartChanged();
  }

  function cartSubtotal() {
    let total = 0;
    state.cart.forEach(function (line) { total += line.price * line.quantity; });
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }

  function cartItemCount() {
    let count = 0;
    state.cart.forEach(function (line) { count += line.quantity; });
    return count;
  }

  function cartPayload() {
    return Array.from(state.cart.values()).map(function (l) {
      return { itemId: l.itemId, quantity: l.quantity };
    });
  }

  function onCartChanged() {
    refreshAllMenuCardQuantities();
    renderCartLines();
    renderCouponTiers();
    updateSummary();
    if (state.coupon) revalidateCoupon();
  }

  function updateCartBar() {
    const count = cartItemCount();
    const showBar = count > 0 && state.currentView === 'menu';
    el.cartBar.hidden = !showBar;
    document.body.classList.toggle('has-cart-bar', showBar);
    el.cartBarCount.textContent = count + (count === 1 ? ' item' : ' items');
    el.cartBarTotal.textContent = formatMoney(cartSubtotal());
  }

  function renderCartLines() {
    el.cartItems.innerHTML = '';
    const lines = Array.from(state.cart.values());
    el.cartEmpty.hidden = lines.length > 0;
    el.orderForm.hidden = lines.length === 0;
    el.checkoutBar.hidden = lines.length === 0;

    lines.forEach(function (line) {
      const li = cloneTpl(tpl.cartLine);
      const vegMark = role(li, 'vegMark');
      if (line.vegStatus === 'NON_VEG') vegMark.classList.add('is-nonveg');
      role(li, 'name').textContent = line.itemName;
      role(li, 'unit').textContent = formatMoney(line.price) + ' each';
      role(li, 'qty').textContent = String(line.quantity);
      role(li, 'lineTotal').textContent = formatMoney(line.price * line.quantity);

      role(li, 'minusBtn').addEventListener('click', function () { addToCart(line, -1); });
      role(li, 'plusBtn').addEventListener('click', function () { addToCart(line, 1); });
      role(li, 'removeBtn').addEventListener('click', function () { removeFromCartCompletely(line.itemId); });
      el.cartItems.appendChild(li);
    });
  }

  function updateSummary() {
    const subtotal = cartSubtotal();
    el.sumSubtotal.textContent = formatMoney(subtotal);
    let total = subtotal;
    if (state.coupon) {
      el.sumDiscountRow.hidden = false;
      el.sumDiscountLabel.textContent = 'Discount (' + state.coupon.couponCode + ')';
      el.sumDiscount.textContent = '-' + formatMoney(state.coupon.discountAmount);
      total = state.coupon.finalTotal;
    } else {
      el.sumDiscountRow.hidden = true;
    }
    el.sumTotal.textContent = formatMoney(total);
    el.checkoutTotal.textContent = formatMoney(total);
    updateCartBar();
  }

  /* ================================================================ */
  /* Coupons                                                           */
  /* ================================================================ */
  function renderCouponTiers() {
    el.couponTiers.innerHTML = '';
    const tiers = (state.publicConfig && state.publicConfig.couponTiers) || [];
    if (!tiers.length) { el.couponTiersTitle.hidden = true; return; }
    el.couponTiersTitle.hidden = false;
    const subtotal = Math.floor(cartSubtotal());
    tiers.forEach(function (tier) {
      const li = cloneTpl(tpl.tier);
      const btn = role(li, 'tierBtn');
      role(li, 'code').textContent = tier.couponCode;
      role(li, 'desc').textContent = tier.description;
      const max = (tier.maxOrder === null || tier.maxOrder === undefined) ? Infinity : tier.maxOrder;
      if (subtotal >= tier.minOrder && subtotal <= max) btn.classList.add('is-eligible');
      btn.addEventListener('click', function () {
        el.couponCode.value = tier.couponCode;
        applyCoupon();
      });
      el.couponTiers.appendChild(li);
    });
  }

  function setCouponMessage(message, kind) {
    el.couponMessage.hidden = !message;
    el.couponMessage.textContent = message || '';
    el.couponMessage.classList.remove('is-ok', 'is-error');
    if (kind) el.couponMessage.classList.add(kind === 'ok' ? 'is-ok' : 'is-error');
  }

  function applyCoupon() {
    const code = el.couponCode.value.trim();
    if (!code) { setCouponMessage('Please enter a coupon code.', 'error'); return; }
    if (!state.cart.size) { setCouponMessage('Add items to your cart first.', 'error'); return; }
    el.applyCouponBtn.disabled = true;
    apiCall('validateCoupon', { tableToken: state.tableToken, customerKey: state.customerKey, items: cartPayload(), couponCode: code })
      .then(function (data) {
        state.coupon = data;
        el.couponCode.value = data.couponCode;
        el.couponCode.disabled = true;
        el.applyCouponBtn.hidden = true;
        el.removeCouponBtn.hidden = false;
        setCouponMessage(data.discountPercent + '% discount applied.', 'ok');
        updateSummary();
      })
      .catch(function (err) {
        state.coupon = null;
        setCouponMessage(err.message, 'error');
        updateSummary();
      })
      .finally(function () { el.applyCouponBtn.disabled = false; });
  }

  function revalidateCoupon() {
    if (!state.coupon) return;
    const code = state.coupon.couponCode;
    if (!state.cart.size) { removeCoupon(); return; }
    apiCall('validateCoupon', { tableToken: state.tableToken, customerKey: state.customerKey, items: cartPayload(), couponCode: code })
      .then(function (data) { state.coupon = data; updateSummary(); })
      .catch(function (err) {
        state.coupon = null;
        el.couponCode.value = '';
        el.couponCode.disabled = false;
        el.applyCouponBtn.hidden = false;
        el.removeCouponBtn.hidden = true;
        setCouponMessage('Coupon ' + code + ' removed: ' + err.message, 'error');
        updateSummary();
      });
  }

  function removeCoupon() {
    state.coupon = null;
    el.couponCode.value = '';
    el.couponCode.disabled = false;
    el.applyCouponBtn.hidden = false;
    el.removeCouponBtn.hidden = true;
    setCouponMessage('', null);
    updateSummary();
  }

  /* ================================================================ */
  /* View switching                                                    */
  /* ================================================================ */
  function switchView(name) {
  state.currentView = name;

  el.viewMenu.hidden = name !== 'menu';
  el.viewCart.hidden = name !== 'cart';
  el.viewTrack.hidden = name !== 'track';

  window.scrollTo({ top: 0, behavior: 'auto' });

  updateCartBar();

  if (name !== 'track') stopPolling();
  if (name === 'menu') refreshActiveOrder();
}

  /* ================================================================ */
  /* Form validation + order placement                                 */
  /* ================================================================ */
  function validateMobileClientSide(value) {
    let digits = value.replace(/[\s\-().]/g, '');
    digits = digits.replace(/^\+?91/, '').replace(/^0/, '');
    return /^[6-9]\d{9}$/.test(digits);
  }

  function clearFormErrors() {
    el.customerNameError.hidden = true;
    el.customerNameError.textContent = '';
    el.customerMobileError.hidden = true;
    el.customerMobileError.textContent = '';
    el.formError.hidden = true;
    el.formError.textContent = '';
    el.customerName.classList.remove('is-invalid');
    el.customerMobile.classList.remove('is-invalid');
  }

  function submitOrder(e) {
    e.preventDefault();
    clearFormErrors();

    let valid = true;
    const name = el.customerName.value.trim();
    if (!name) {
      el.customerNameError.textContent = 'Please enter your name.';
      el.customerNameError.hidden = false;
      el.customerName.classList.add('is-invalid');
      valid = false;
    }
    const mobile = el.customerMobile.value.trim();
    if (!mobile || !validateMobileClientSide(mobile)) {
      el.customerMobileError.textContent = 'Please enter a valid 10-digit mobile number.';
      el.customerMobileError.hidden = false;
      el.customerMobile.classList.add('is-invalid');
      valid = false;
    }
    if (!state.cart.size) {
      el.formError.textContent = 'Your cart is empty.';
      el.formError.hidden = false;
      valid = false;
    }
    if (!valid) return;

    el.placeOrderBtn.disabled = true;
    el.placeOrderBtn.classList.add('is-loading');

    apiCall('createOrder', {
      tableToken: state.tableToken,
      customerKey: state.customerKey,
      customerName: name,
      mobile: mobile,
      specialRequest: el.specialRequest.value.trim(),
      couponCode: state.coupon ? state.coupon.couponCode : '',
      items: cartPayload()
    }).then(function (order) {
  clearCart();
  clearCartStorage();
  removeCoupon();
  el.orderForm.reset();
saveCustomerDetails(name, mobile);
prefillCustomerDetails();
el.specialCount.textContent = '0/' + ((state.publicConfig && state.publicConfig.maxSpecialRequestLength) || 300);
state.currentOrder = order;
showOrderConfirmedModal(order);
}).catch(function (err) {
      if (!handleFatalIfNeeded(err)) {
        el.formError.textContent = err.message;
        el.formError.hidden = false;
      }
    }).finally(function () {
      el.placeOrderBtn.disabled = false;
      el.placeOrderBtn.classList.remove('is-loading');
    });
  }

  /* ================================================================ */
  /* Tracking                                                          */
  /* ================================================================ */
  const STATUS_TEXT = {
    NEW: 'Your order has been placed.',
    PREPARING: 'Your order is being prepared.',
    COMPLETED: 'Your order is complete. Enjoy!',
    CANCELLED: 'This order was cancelled.'
  };

  function formatNiceDate(stamp) {
    if (!stamp) return '';
    const d = new Date(stamp);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function copyText(text, btn) {
    if (!text) return;
    const done = function () {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = original; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { showToast('Could not copy. Please copy manually.', 'error'); });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { showToast('Could not copy.', 'error'); }
      ta.remove();
    }
  }

  function showOrderConfirmedModal(order) {
    el.confirmOrderId.textContent = order.orderId;
    if (order.rewardCoupon) {
      el.confirmRewardBox.hidden = false;
      el.confirmRewardCode.textContent = order.rewardCoupon.couponCode;
      el.confirmRewardPercent.textContent = order.rewardCoupon.discountPercent + '% OFF';
      el.confirmRewardMin.textContent = formatMoney(order.rewardCoupon.minOrder);
      el.confirmRewardExpiry.textContent = formatNiceDate(order.rewardCoupon.expiresAt);
    } else {
      el.confirmRewardBox.hidden = true;
    }
    openModal(el.orderConfirmedModal);
  }

function showTrackLoading() {
  el.trackLoading.hidden = false;
  el.trackContent.hidden = true;
}

function hideTrackLoading() {
  el.trackLoading.hidden = true;
  el.trackContent.hidden = false;
}

function saveCustomerDetails(name, mobile) {
  state.customerName = name;
  state.mobile = mobile;
  try {
    localStorage.setItem('loveCoffeeCustomerName', name);
    localStorage.setItem('loveCoffeeCustomerMobile', mobile);
  } catch (e) { /* ignore */ }
}

function loadCustomerDetails() {
  try {
    state.customerName = localStorage.getItem('loveCoffeeCustomerName') || '';
    state.mobile = localStorage.getItem('loveCoffeeCustomerMobile') || '';
  } catch (e) {
    state.customerName = '';
    state.mobile = '';
  }
}

function prefillCustomerDetails() {
  if (state.customerName) el.customerName.value = state.customerName;
  if (state.mobile) el.customerMobile.value = state.mobile;
}
  
  function renderSessionOrders(orders) {
  el.trackOrdersList.innerHTML = '';
  let grandTotal = 0;

  el.trackOrdersHeading.hidden = orders.length === 0;
  el.trackOrdersCount.textContent = orders.length;

  orders.forEach(function (order) {
    const card = cloneTpl(tpl.orderCard);

    const rewardBox = role(card, 'rewardBox');
    if (order.rewardCoupon) {
      rewardBox.hidden = false;
      role(rewardBox, 'rewardCode').textContent = order.rewardCoupon.couponCode;
      role(rewardBox, 'rewardPercent').textContent = order.rewardCoupon.discountPercent + '% OFF';
      role(rewardBox, 'rewardMin').textContent = formatMoney(order.rewardCoupon.minOrder);
      role(rewardBox, 'rewardNote').textContent = order.rewardCoupon.used
        ? 'This coupon has already been used.'
        : 'Valid till ' + formatNiceDate(order.rewardCoupon.expiresAt) + '. Take a screenshot to save it.';
      const copyBtn = role(rewardBox, 'rewardCopyBtn');
      copyBtn.addEventListener('click', function () { copyText(order.rewardCoupon.couponCode, copyBtn); });
    } else {
      rewardBox.hidden = true;
    }

    role(card, 'orderId').textContent = order.orderId;
    role(card, 'time').textContent = order.orderDate + ' ' + order.orderTime;

    role(card, 'steps').dataset.status = order.orderStatus;
    role(card, 'statusText').textContent = STATUS_TEXT[order.orderStatus] || '';
    role(card, 'statusUpdated').textContent = 'Updated ' + order.statusUpdatedAt;
    role(card, 'cancelledNotice').hidden = order.orderStatus !== 'CANCELLED';

    const itemsList = role(card, 'items');
    order.items.forEach(function (line) {
      const li = cloneTpl(tpl.trackLine);
      role(li, 'qty').textContent = 'x' + line.quantity;
      role(li, 'name').textContent = line.itemName;
      role(li, 'lineTotal').textContent = formatMoney(line.lineTotal);
      itemsList.appendChild(li);
    });

    role(card, 'subtotal').textContent = formatMoney(order.subtotal);

    const discountRow = role(card, 'discountRow');
    if (order.couponCode) {
      discountRow.hidden = false;
      role(card, 'discountLabel').textContent = 'Discount (' + order.couponCode + ')';
      role(card, 'discount').textContent = '-' + formatMoney(order.discountAmount);
    } else {
      discountRow.hidden = true;
    }

    role(card, 'total').textContent = formatMoney(order.finalTotal);

    const specialBox = role(card, 'specialBox');
    if (order.specialRequest) {
      specialBox.hidden = false;
      role(card, 'special').textContent = order.specialRequest;
    } else {
      specialBox.hidden = true;
    }

    if (order.orderStatus !== 'CANCELLED') {
      grandTotal += order.finalTotal;
    }

    el.trackOrdersList.appendChild(card);
  });

  el.trackGrandTotal.textContent = formatMoney(grandTotal);
}
  function fetchSessionOrders(showErrors) {
  if (!state.tableToken || !state.customerKey) return Promise.resolve();

  return apiCall('getSessionOrders', {
    tableToken: state.tableToken,
    customerKey: state.customerKey
  }).then(function (data) {
    const orders = data.orders || [];
    state.sessionOrders = orders;
    if (orders.length) state.currentOrder = orders[orders.length - 1];
    renderSessionOrders(orders);
    hideTrackLoading();

    const anyActive = orders.some(function (o) {
      return o.orderStatus === 'NEW' || o.orderStatus === 'PREPARING';
    });
    if (!anyActive) stopPolling();
  }).catch(function (err) {
    hideTrackLoading();
    if (!handleFatalIfNeeded(err) && showErrors) {
      showToast(err.message, 'error');
    }
  });
}
  function startPolling() {
    stopPolling();
    const seconds = (state.publicConfig && state.publicConfig.pollSeconds) || 10;
    state.pollTimer = setInterval(function () { fetchSessionOrders(false); }, seconds * 1000);
  }
  function stopPolling() {
    if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
  }

  function refreshActiveOrder() {
  if (state.currentOrder) {
    el.activeOrderBanner.hidden = false;
    el.activeOrderTitle.textContent = 'Checking your order…';
    el.activeOrderSub.textContent = 'Please wait';
  }

  return apiCall('getActiveOrder', {
    tableToken: state.tableToken,
    customerKey: state.customerKey
  })
    .then(function (order) {
      if (!order) {
        el.activeOrderBanner.hidden = true;
        state.currentOrder = null;
        return;
      }

      state.currentOrder = order;
      el.activeOrderBanner.hidden = false;

      if (order.orderStatus === 'COMPLETED') {
        el.activeOrderTitle.textContent = 'Your last order is complete';
        el.activeOrderSub.textContent = 'Tap to view details';
      } else {
        el.activeOrderTitle.textContent = order.orderStatus === 'PREPARING'
          ? 'Your order is being prepared'
          : 'You have an order in progress';
        el.activeOrderSub.textContent = 'Tap to track it';
      }
    })
    .catch(function (err) {
      handleFatalIfNeeded(err);
    });
}

  /* ================================================================ */
  /* Modals                                                            */
  /* ================================================================ */
  function openModal(modal) { modal.hidden = false; }
  function closeModal(modal) { modal.hidden = true; }
  function bindModal(modal) {
    qAll('[data-close-modal]', modal).forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(modal); });
    });
  }

    /* ================================================================ */
  /* Notifications (in-app, poll based)                                */
  /* Contract (confirmed from Notifications.gs):                       */
  /*   saveNotificationSubscription: {tableToken, customerKey,         */
  /*     permission, endpoint?, pushKeys?, userAgent?} -> {subscribed} */
  /*   getCustomerNotifications: {customerKey, since} ->                */
  /*     {notifications[], serverTime}. since='' => no notifications,  */
  /*     only serverTime (baseline). since set => notifications with   */
  /*     createdAt >= since (inclusive, so dedupe by notificationId).  */
  /* ================================================================ */
  const NOTIF_SINCE_STORAGE = 'loc_notif_since';
  const NOTIF_SEEN_STORAGE = 'loc_notif_seen_ids';

  function maybeShowNotifyCard() {
    let opted = '';
    try { opted = localStorage.getItem(NOTIF_OPT_STORAGE) || ''; } catch (e) { /* ignore */ }
    state.notifOptedIn = opted === 'yes';
    el.notifyCard.hidden = state.notifOptedIn;
  }

  if (el.notifyBtn) {
    el.notifyBtn.addEventListener('click', function () {
      el.notifyBtn.disabled = true;
      apiCall('saveNotificationSubscription', {
        tableToken: state.tableToken,
        customerKey: state.customerKey,
        permission: 'granted',
        userAgent: navigator.userAgent
      }).then(function () {
        state.notifOptedIn = true;
        try { localStorage.setItem(NOTIF_OPT_STORAGE, 'yes'); } catch (e) { /* ignore */ }
        el.notifyCard.hidden = true;
        showToast('Notifications enabled. Keep this page open to receive offers.', 'success');
        establishNotificationBaseline_();
      }).catch(function (err) {
        showToast(err.message, 'error');
      }).finally(function () {
        el.notifyBtn.disabled = false;
      });
    });
  }

  function getNotifSince_() {
    try { return localStorage.getItem(NOTIF_SINCE_STORAGE) || ''; } catch (e) { return ''; }
  }
  function setNotifSince_(stamp) {
    try { localStorage.setItem(NOTIF_SINCE_STORAGE, stamp); } catch (e) { /* ignore */ }
  }
  function getSeenNotifIds_() {
    try { return JSON.parse(localStorage.getItem(NOTIF_SEEN_STORAGE) || '[]'); } catch (e) { return []; }
  }
  function addSeenNotifIds_(ids) {
    const merged = getSeenNotifIds_().concat(ids).slice(-50);
    try { localStorage.setItem(NOTIF_SEEN_STORAGE, JSON.stringify(merged)); } catch (e) { /* ignore */ }
  }

  /** First call ever (or after opting in): just fetch serverTime, show nothing old. */
  function establishNotificationBaseline_() {
    if (getNotifSince_()) return;
    apiCall('getCustomerNotifications', { customerKey: state.customerKey, since: '' })
      .then(function (data) { setNotifSince_(data.serverTime); })
      .catch(function () { /* best-effort */ });
  }

  function startNotificationPolling() {
    if (!state.publicConfig) return;
    if (state.notifOptedIn) establishNotificationBaseline_();
    const intervalMs = Math.max((state.publicConfig.pollSeconds || 10), 10) * 3 * 1000;
    pollNotifications();
    state.notifTimer = setInterval(pollNotifications, intervalMs);
  }

  function pollNotifications() {
    if (!state.notifOptedIn) return;
    const since = getNotifSince_();
    if (!since) { establishNotificationBaseline_(); return; }
    apiCall('getCustomerNotifications', { customerKey: state.customerKey, since: since })
      .then(function (data) {
        const seen = getSeenNotifIds_();
        const fresh = (data.notifications || []).filter(function (n) {
          return n && n.notificationId && seen.indexOf(n.notificationId) === -1;
        });
        if (fresh.length) {
          showNotification(fresh[fresh.length - 1]);
          addSeenNotifIds_(fresh.map(function (n) { return n.notificationId; }));
        }
        setNotifSince_(data.serverTime);
      })
      .catch(function () { /* notifications are best-effort: fail silently */ });
  }

  function showNotification(n) {
    if (n.imageUrl) { el.notifImage.src = n.imageUrl; el.notifImage.hidden = false; }
    else { el.notifImage.hidden = true; }
    el.notifTitle.textContent = n.title || '';
    el.notifMessage.textContent = n.message || '';
    if (n.buttonLink) {
      el.notifLink.href = n.buttonLink;
      el.notifLink.textContent = n.buttonText || 'Open';
      el.notifLink.hidden = false;
    } else {
      el.notifLink.hidden = true;
    }
    openModal(el.notifModal);
  }

  /* ================================================================ */
  /* Event binding                                                     */
  /* ================================================================ */
  function bindEvents() {
    el.aboutBtn.addEventListener('click', function () { openModal(el.aboutModal); });
    bindModal(el.aboutModal);
    bindModal(el.notifModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!el.aboutModal.hidden) closeModal(el.aboutModal);
        if (!el.notifModal.hidden) closeModal(el.notifModal);
      }
    });

    el.searchInput.addEventListener('input', function () {
      state.searchTerm = el.searchInput.value;
      el.searchClearBtn.hidden = !state.searchTerm;
      applyFilters();
    });
    el.searchClearBtn.addEventListener('click', function () {
      el.searchInput.value = '';
      state.searchTerm = '';
      el.searchClearBtn.hidden = true;
      applyFilters();
      el.searchInput.focus();
    });
    el.vegOnlyToggle.addEventListener('change', function () {
      state.vegOnly = el.vegOnlyToggle.checked;
      applyFilters();
    });

el.activeOrderRefreshBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  el.activeOrderRefreshBtn.classList.add('is-spinning');
  refreshActiveOrder().then(function () {
    el.activeOrderRefreshBtn.classList.remove('is-spinning');
  }).catch(function () {
    el.activeOrderRefreshBtn.classList.remove('is-spinning');
  });
});
    
    el.activeOrderBanner.addEventListener('click', function () {
  if (!state.currentOrder) return;
  el.trackSuccess.hidden = true;
  showTrackLoading();
  switchView('track');
  fetchSessionOrders(true).then(function () {
    const anyActive = (state.sessionOrders || []).some(function (o) {
      return o.orderStatus === 'NEW' || o.orderStatus === 'PREPARING';
    });
    if (anyActive) startPolling();
  });
});

    el.viewCartBtn.addEventListener('click', function () { switchView('cart'); });
    el.cartBackBtn.addEventListener('click', function () { switchView('menu'); });
    el.cartAddMoreBtn.addEventListener('click', function () { switchView('menu'); });
    el.clearCartBtn.addEventListener('click', function () {
      if (!state.cart.size) return;
      clearCart();
      showToast('Cart cleared.', 'success');
    });

    el.specialRequest.addEventListener('input', function () {
      const max = (state.publicConfig && state.publicConfig.maxSpecialRequestLength) || 300;
      el.specialCount.textContent = el.specialRequest.value.length + '/' + max;
    });
        el.confirmRewardCopyBtn.addEventListener('click', function () { copyText(el.confirmRewardCode.textContent, el.confirmRewardCopyBtn); });
    el.trackRewardCopyBtn.addEventListener('click', function () { copyText(el.trackRewardCode.textContent, el.trackRewardCopyBtn); });
    el.orderConfirmedDoneBtn.addEventListener('click', function () {
  closeModal(el.orderConfirmedModal);
  el.trackSuccess.hidden = false;
  renderSessionOrders([state.currentOrder]);
  hideTrackLoading();
  switchView('track');
  fetchSessionOrders(true).then(function () { startPolling(); });
});
    
    el.applyCouponBtn.addEventListener('click', applyCoupon);
    el.removeCouponBtn.addEventListener('click', removeCoupon);

    el.orderForm.addEventListener('submit', submitOrder);

    el.trackBackBtn.addEventListener('click', function () { switchView('menu'); });
    el.trackRefreshBtn.addEventListener('click', function () {
  showTrackLoading();
  fetchSessionOrders(true);
});
    el.newOrderBtn.addEventListener('click', function () { switchView('menu'); });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();

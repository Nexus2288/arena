/* =========================================================
   script.js — Customer site (Part 9)  [ASSUMPTION BUILD]
   Mismatch ho to sirf neeche ka block "A" edit karo.
   Test: browser console mein  __diag()
   ========================================================= */
(function () {
  'use strict';

  /* ================= 1. ASSUMPTIONS (sirf yahan edit) ================= */
  const A = {
    actions: {
      publicConfig:   'getPublicConfig',
      menu:           'getMenu',
      resolveTable:   'resolveTable',
      validateCoupon: 'validateCoupon',
      createOrder:    'createOrder',
      trackOrder:     'trackOrder'
    },
    // request param names
    params: {
      tableToken: 'token',        // resolveTable?token=...
      trackOrderId: 'orderId',    // trackOrder?orderId=...&trackingToken=...
      trackToken: 'trackingToken'
    },
    urlTableParam: 't',           // site?t=TOKEN
    // element IDs in index.html
    ids: {
      restaurantName: 'restaurantName',
      tableLabel:     'tableLabel',
      statusBanner:   'statusBanner',
      searchInput:    'searchInput',
      categoryTabs:   'categoryTabs',
      menuList:       'menuList',
      cartBar:        'cartBar',
      cartCount:      'cartCount',
      cartTotal:      'cartTotal',
      openCartBtn:    'openCartBtn',
      cartModal:      'cartModal',
      closeCartBtn:   'closeCartBtn',
      cartItems:      'cartItems',
      couponInput:    'couponInput',
      applyCouponBtn: 'applyCouponBtn',
      couponMsg:      'couponMsg',
      subtotal:       'subtotal',
      discount:       'discount',
      grandTotal:     'grandTotal',
      customerName:   'customerName',
      customerPhone:  'customerPhone',
      orderNote:      'orderNote',
      placeOrderBtn:  'placeOrderBtn',
      trackModal:     'trackModal',
      trackBody:      'trackBody',
      closeTrackBtn:  'closeTrackBtn',
      toast:          'toast'
    },
    // diag in IDs ko "optional" maanega (missing ho to warning, error nahi)
    optionalIds: ['statusBanner', 'searchInput', 'customerName', 'customerPhone', 'orderNote', 'couponInput', 'applyCouponBtn', 'couponMsg', 'discount'],
    classes: { hidden: 'hidden', open: '' },   // open: agar CSS .open/.show use karta hai to yahan likho
    phoneRegex: /^\d{10}$/,
    pollMs: 8000,
    timeoutMs: 20000,
    // status normalisation: backend ka status (lowercase) -> step key
    statusMap: {
      new: 'placed', placed: 'placed', pending: 'placed', received: 'placed',
      accepted: 'accepted', confirmed: 'accepted',
      preparing: 'preparing', cooking: 'preparing',
      ready: 'ready',
      served: 'served', completed: 'served', delivered: 'served', done: 'served',
      rejected: 'rejected', cancelled: 'rejected', canceled: 'rejected'
    },
    steps: [
      { key: 'placed',    label: 'Order received' },
      { key: 'accepted',  label: 'Accepted' },
      { key: 'preparing', label: 'Preparing' },
      { key: 'ready',     label: 'Ready' },
      { key: 'served',    label: 'Served' }
    ],
    terminal: ['served', 'rejected']
  };

  /* ================= 2. HELPERS ================= */
  const $ = (key) => document.getElementById(A.ids[key]);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v, d = 0) => { const n = Number(v); return isFinite(n) ? n : d; };
  const uid = () => 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function show(node, on) {
    if (!node) return;
    node.classList.toggle(A.classes.hidden, !on);
    if (A.classes.open) node.classList.toggle(A.classes.open, on);
  }

  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    show(t, true);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => show(t, false), 3000);
  }

  function getApiUrl() {
    return (window.APP_CONFIG && window.APP_CONFIG.API_URL) ||
           window.API_URL ||
           (window.FRONTEND_CONFIG && window.FRONTEND_CONFIG.API_URL) || '';
  }

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ================= 3. API ADAPTER ================= */
  function unwrap(res) {
    if (!res || typeof res !== 'object') throw new Error('Invalid server response');
    if (res.ok === false || res.success === false || res.error) {
      const e = new Error(res.error || res.message || 'Request failed');
      e.code = res.code; e.raw = res;
      throw e;
    }
    return res.data !== undefined ? res.data : res;
  }

  async function request(url, opts) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), A.timeoutMs);
    try {
      const r = await fetch(url, Object.assign({ signal: ctrl.signal }, opts));
      const text = await r.text();
      let json;
      try { json = JSON.parse(text); }
      catch (e) { throw new Error('Server ne JSON nahi diya (Web App access/deploy check karo)'); }
      return unwrap(json);
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('Server slow hai, dobara try karo');
      throw e;
    } finally { clearTimeout(to); }
  }

  const api = {
    get(action, params) {
      const base = getApiUrl();
      if (!base) throw new Error('API_URL set nahi hai (frontend-config.js)');
      const q = new URLSearchParams(Object.assign({ action }, params || {}));
      return request(base + (base.includes('?') ? '&' : '?') + q.toString());
    },
    post(action, body) {
      const base = getApiUrl();
      if (!base) throw new Error('API_URL set nahi hai (frontend-config.js)');
      return request(base, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // preflight avoid
        body: JSON.stringify(Object.assign({ action }, body || {}))
      });
    }
  };

  /* ================= 4. NORMALISERS (field-name tolerance) ================= */
  const pick = (o, keys, d) => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; return d; };

  function normConfig(c) {
    c = c || {};
    return {
      name: pick(c, ['restaurantName', 'name', 'cafeName'], 'Restaurant'),
      currency: pick(c, ['currency', 'currencySymbol'], '₹'),
      open: pick(c, ['ordersOpen', 'isOpen', 'acceptingOrders', 'open'], true) !== false &&
            String(pick(c, ['ordersOpen', 'isOpen', 'acceptingOrders', 'open'], true)).toLowerCase() !== 'false',
      message: pick(c, ['closedMessage', 'message', 'notice'], '')
    };
  }

  function normItem(i) {
    const avail = pick(i, ['available', 'isAvailable', 'inStock', 'active'], true);
    return {
      id: String(pick(i, ['id', 'itemId', 'item_id', 'ItemID'], '')),
      name: String(pick(i, ['name', 'itemName', 'title'], 'Item')),
      price: num(pick(i, ['price', 'rate', 'amount'], 0)),
      category: String(pick(i, ['category', 'categoryName', 'cat'], 'Menu')),
      desc: String(pick(i, ['description', 'desc'], '')),
      veg: pick(i, ['veg', 'isVeg'], null),
      image: String(pick(i, ['image', 'imageUrl', 'photo'], '')),
      available: !(avail === false || String(avail).toLowerCase() === 'false' || String(avail).toLowerCase() === 'no')
    };
  }

  function normMenu(d) {
    const arr = Array.isArray(d) ? d : (d && (d.items || d.menu)) || [];
    return arr.map(normItem).filter((x) => x.id);
  }

  function normOrder(o) {
    o = o || {};
    const raw = String(pick(o, ['status', 'orderStatus'], 'placed')).toLowerCase();
    return {
      id: String(pick(o, ['orderId', 'id', 'order_id'], '')),
      status: A.statusMap[raw] || 'placed',
      rawStatus: raw,
      total: num(pick(o, ['total', 'grandTotal', 'amount'], 0)),
      eta: pick(o, ['eta', 'etaMinutes', 'prepTime'], ''),
      reason: pick(o, ['reason', 'rejectReason', 'note'], '')
    };
  }

  /* ================= 5. STATE ================= */
  const S = {
    cfg: normConfig({}),
    token: '',
    table: null,
    menu: [],
    cart: {},               // id -> {id,name,price,qty}
    cat: 'All',
    q: '',
    coupon: null,           // {code, discount}
    placing: false,
    reqId: null,
    active: store.get('active_order', null),   // {orderId, trackingToken}
    pollTimer: null,
    lastStatus: null
  };

  const money = (n) => S.cfg.currency + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '');
  const cartKey = () => 'cart_' + (S.token || 'none');

  /* ================= 6. MENU RENDER ================= */
  function categories() {
    const seen = ['All'];
    S.menu.forEach((m) => { if (!seen.includes(m.category)) seen.push(m.category); });
    return seen;
  }

  function renderTabs() {
    const box = $('categoryTabs'); if (!box) return;
    box.innerHTML = categories().map((c) =>
      `<button type="button" class="cat-tab${c === S.cat ? ' active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  }

  function renderMenu() {
    const box = $('menuList'); if (!box) return;
    const q = S.q.trim().toLowerCase();
    const list = S.menu.filter((m) =>
      (S.cat === 'All' || m.category === S.cat) &&
      (!q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)));
    if (!list.length) { box.innerHTML = '<p class="empty">Koi item nahi mila.</p>'; return; }
    box.innerHTML = list.map((m) => {
      const qty = S.cart[m.id] ? S.cart[m.id].qty : 0;
      const vegDot = m.veg === null ? '' :
        `<span class="veg-dot ${(m.veg === true || String(m.veg).toLowerCase() === 'true' || String(m.veg).toLowerCase() === 'veg') ? 'veg' : 'nonveg'}"></span>`;
      const ctrl = !m.available ? '<span class="soldout">Sold out</span>'
        : qty === 0 ? `<button type="button" class="add-btn" data-act="add" data-id="${esc(m.id)}">Add</button>`
        : `<div class="qty-ctrl"><button type="button" data-act="dec" data-id="${esc(m.id)}">−</button><span>${qty}</span><button type="button" data-act="inc" data-id="${esc(m.id)}">+</button></div>`;
      return `<div class="menu-item${m.available ? '' : ' unavailable'}">
        ${m.image ? `<img src="${esc(m.image)}" alt="" loading="lazy">` : ''}
        <div class="mi-info">${vegDot}<h3>${esc(m.name)}</h3>
          ${m.desc ? `<p>${esc(m.desc)}</p>` : ''}
          <strong>${money(m.price)}</strong></div>
        <div class="mi-ctrl">${ctrl}</div></div>`;
    }).join('');
  }

  /* ================= 7. CART ================= */
  const subtotal = () => Object.values(S.cart).reduce((s, i) => s + i.price * i.qty, 0);
  const count = () => Object.values(S.cart).reduce((s, i) => s + i.qty, 0);
  const saveCart = () => store.set(cartKey(), S.cart);

  function changeQty(id, delta) {
    const m = S.menu.find((x) => x.id === id);
    if (!m || !m.available) return;
    const cur = S.cart[id] ? S.cart[id].qty : 0;
    const next = Math.max(0, Math.min(50, cur + delta));
    if (next === 0) delete S.cart[id];
    else S.cart[id] = { id, name: m.name, price: m.price, qty: next };
    saveCart();
    onCartChanged();
  }

  let revalidateTimer;
  function onCartChanged() {
    renderMenu(); renderCart();
    if (S.coupon) {
      clearTimeout(revalidateTimer);
      revalidateTimer = setTimeout(() => applyCoupon(S.coupon.code, true), 400);
    }
  }

  function renderCart() {
    const n = count(), sub = subtotal();
    const disc = S.coupon ? Math.min(S.coupon.discount, sub) : 0;
    const bar = $('cartBar'); show(bar, n > 0);
    if ($('cartCount')) $('cartCount').textContent = n;
    if ($('cartTotal')) $('cartTotal').textContent = money(sub - disc);
    if ($('subtotal')) $('subtotal').textContent = money(sub);
    if ($('discount')) $('discount').textContent = disc ? '−' + money(disc) : money(0);
    if ($('grandTotal')) $('grandTotal').textContent = money(sub - disc);

    const box = $('cartItems');
    if (box) {
      const items = Object.values(S.cart);
      box.innerHTML = items.length ? items.map((i) =>
        `<div class="cart-row"><div class="cr-name">${esc(i.name)}<small>${money(i.price)} each</small></div>
          <div class="qty-ctrl"><button type="button" data-act="dec" data-id="${esc(i.id)}">−</button><span>${i.qty}</span><button type="button" data-act="inc" data-id="${esc(i.id)}">+</button></div>
          <div class="cr-amt">${money(i.price * i.qty)}</div></div>`).join('')
        : '<p class="empty">Cart khaali hai.</p>';
    }
    const pb = $('placeOrderBtn');
    if (pb) pb.disabled = S.placing || n === 0 || !S.table || !S.cfg.open;
  }

  /* ================= 8. COUPON ================= */
  async function applyCoupon(codeArg, silent) {
    const input = $('couponInput');
    const code = String(codeArg || (input && input.value) || '').trim().toUpperCase();
    const msg = $('couponMsg');
    const say = (t, ok) => { if (msg) { msg.textContent = t; msg.className = 'coupon-msg ' + (ok ? 'ok' : 'err'); } };
    if (!code) { say('Coupon code likho', false); return; }
    if (!count()) { say('Pehle cart mein item daalo', false); return; }
    try {
      const d = await api.post(A.actions.validateCoupon, {
        code,
        subtotal: subtotal(),
        items: Object.values(S.cart).map((i) => ({ id: i.id, qty: i.qty }))
      });
      const valid = pick(d, ['valid', 'isValid'], true);
      if (valid === false) throw new Error(pick(d, ['message', 'reason'], 'Coupon valid nahi hai'));
      const discount = num(pick(d, ['discount', 'discountAmount'], 0));
      S.coupon = { code: String(pick(d, ['code'], code)).toUpperCase(), discount };
      if (input) input.value = S.coupon.code;
      say(pick(d, ['message'], 'Coupon laga: −' + money(discount)), true);
    } catch (e) {
      S.coupon = null;
      say(e.message, false);
      if (silent) toast('Coupon hata diya: ' + e.message);
    }
    renderCart();
  }

  /* ================= 9. PLACE ORDER ================= */
  async function placeOrder() {
    if (S.placing) return;
    if (!S.table) return toast('Table QR scan karke aao');
    if (!S.cfg.open) return toast(S.cfg.message || 'Abhi orders band hain');
    if (!count()) return toast('Cart khaali hai');
    const name = ($('customerName') ? $('customerName').value : '').trim();
    const phone = ($('customerPhone') ? $('customerPhone').value : '').replace(/[\s-]/g, '');
    if (phone && !A.phoneRegex.test(phone)) return toast('Phone number sahi daalo');

    S.placing = true; renderCart();
    const btn = $('placeOrderBtn'); const old = btn ? btn.textContent : '';
    if (btn) btn.textContent = 'Placing…';
    if (!S.reqId) S.reqId = uid();     // retry par wahi id (duplicate order se bachne ke liye)
    try {
      const d = await api.post(A.actions.createOrder, {
        token: S.token,
        customerName: name,
        customerPhone: phone,
        note: ($('orderNote') ? $('orderNote').value : '').trim(),
        items: Object.values(S.cart).map((i) => ({ id: i.id, qty: i.qty })),
        couponCode: S.coupon ? S.coupon.code : '',
        requestId: S.reqId
      });
      const orderId = String(pick(d, ['orderId', 'id'], ''));
      if (!orderId) throw new Error('Order ID nahi mili');
      S.active = { orderId, trackingToken: String(pick(d, ['trackingToken', 'trackToken', 'token'], '')) };
      store.set('active_order', S.active);
      S.cart = {}; S.coupon = null; S.reqId = null; saveCart();
      if ($('couponInput')) $('couponInput').value = '';
      if ($('couponMsg')) $('couponMsg').textContent = '';
      show($('cartModal'), false);
      onCartChanged();
      toast('Order place ho gaya! #' + orderId);
      openTrack();
    } catch (e) {
      toast(e.message);
    } finally {
      S.placing = false;
      if (btn) btn.textContent = old || 'Place Order';
      renderCart();
    }
  }

  /* ================= 10. TRACKING ================= */
  async function fetchOrder() {
    if (!S.active) return null;
    const p = {};
    p[A.params.trackOrderId] = S.active.orderId;
    if (S.active.trackingToken) p[A.params.trackToken] = S.active.trackingToken;
    p[A.params.tableToken] = S.token;
    return normOrder(await api.get(A.actions.trackOrder, p));
  }

  function renderTrack(o) {
    const body = $('trackBody'); if (!body) return;
    if (!o) { body.innerHTML = '<p class="empty">Koi active order nahi.</p>'; return; }
    let html = `<h3>Order #${esc(o.id || (S.active && S.active.orderId))}</h3>`;
    if (o.status === 'rejected') {
      html += `<p class="track-bad">Order cancel/reject ho gaya.${o.reason ? ' ' + esc(o.reason) : ''}</p>`;
    } else {
      const idx = A.steps.findIndex((s) => s.key === o.status);
      html += '<ol class="track-steps">' + A.steps.map((s, i) =>
        `<li class="${i < idx ? 'done' : i === idx ? 'current' : ''}">${esc(s.label)}</li>`).join('') + '</ol>';
      if (o.eta && o.status !== 'served') html += `<p>Estimated time: ${esc(o.eta)} min</p>`;
    }
    if (o.total) html += `<p>Total: <strong>${money(o.total)}</strong></p>`;
    if (A.terminal.includes(o.status)) html += '<button type="button" id="trackDoneBtn" class="btn">Naya order</button>';
    body.innerHTML = html;
  }

  function renderBanner(o) {
    const b = $('statusBanner'); if (!b) return;
    if (!o) { show(b, false); return; }
    const label = (A.steps.find((s) => s.key === o.status) || { label: 'Rejected' }).label;
    b.textContent = `Order #${o.id || S.active.orderId}: ${label} — tap karke dekho`;
    show(b, true);
  }

  async function refreshOrder() {
    if (!S.active) { renderBanner(null); return; }
    try {
      const o = await fetchOrder();
      if (S.lastStatus && S.lastStatus !== o.status) toast('Order update: ' + o.status);
      S.lastStatus = o.status;
      renderTrack(o); renderBanner(o);
      if (A.terminal.includes(o.status)) stopPolling();
    } catch (e) {
      const body = $('trackBody');
      if (body && !body.innerHTML) body.innerHTML = `<p class="track-bad">${esc(e.message)}</p>`;
    }
  }

  function startPolling() {
    stopPolling();
    S.pollTimer = setInterval(() => { if (!document.hidden) refreshOrder(); }, A.pollMs);
  }
  function stopPolling() { clearInterval(S.pollTimer); S.pollTimer = null; }

  function openTrack() { show($('trackModal'), true); refreshOrder(); startPolling(); }
  function clearActive() {
    S.active = null; S.lastStatus = null; store.del('active_order');
    stopPolling(); renderBanner(null); show($('trackModal'), false);
  }

  /* ================= 11. EVENTS ================= */
  function bind() {
    const on = (key, ev, fn) => { const n = $(key); if (n) n.addEventListener(ev, fn); };

    on('categoryTabs', 'click', (e) => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      S.cat = b.dataset.cat; renderTabs(); renderMenu();
    });
    on('searchInput', 'input', (e) => { S.q = e.target.value; renderMenu(); });

    const qtyHandler = (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      changeQty(b.dataset.id, b.dataset.act === 'dec' ? -1 : 1);
    };
    on('menuList', 'click', qtyHandler);
    on('cartItems', 'click', qtyHandler);

    on('openCartBtn', 'click', () => { renderCart(); show($('cartModal'), true); });
    on('cartBar', 'click', (e) => { if (!e.target.closest('#' + A.ids.openCartBtn)) { renderCart(); show($('cartModal'), true); } });
    on('closeCartBtn', 'click', () => show($('cartModal'), false));
    on('applyCouponBtn', 'click', () => applyCoupon());
    on('placeOrderBtn', 'click', placeOrder);

    on('statusBanner', 'click', openTrack);
    on('closeTrackBtn', 'click', () => show($('trackModal'), false));
    on('trackBody', 'click', (e) => { if (e.target.id === 'trackDoneBtn') clearActive(); });

    document.addEventListener('visibilitychange', () => { if (!document.hidden && S.active) refreshOrder(); });
  }

  /* ================= 12. INIT ================= */
  async function init() {
    bind();
    S.token = new URLSearchParams(location.search).get(A.urlTableParam) || store.get('last_token', '');
    show($('cartModal'), false); show($('trackModal'), false); show($('cartBar'), false);

    const menuBox = $('menuList');
    if (menuBox) menuBox.innerHTML = '<p class="empty">Loading menu…</p>';

    try {
      const [cfg, menu] = await Promise.all([
        api.get(A.actions.publicConfig).catch(() => ({})),
        api.get(A.actions.menu)
      ]);
      S.cfg = normConfig(cfg);
      S.menu = normMenu(menu);
    } catch (e) {
      if (menuBox) menuBox.innerHTML = `<p class="empty">Menu load nahi hua: ${esc(e.message)}</p>`;
      return;
    }
    if ($('restaurantName')) $('restaurantName').textContent = S.cfg.name;
    document.title = S.cfg.name;

    if (S.token) {
      try {
        const t = await api.get(A.actions.resolveTable, { [A.params.tableToken]: S.token });
        S.table = { name: String(pick(t, ['tableName', 'name', 'label', 'tableNumber', 'table'], 'Table')) };
        store.set('last_token', S.token);
      } catch (e) { S.table = null; toast('Table link galat/expired hai: ' + e.message); }
    }
    if ($('tableLabel')) $('tableLabel').textContent = S.table ? S.table.name : 'Table scan karo';
    if (!S.cfg.open) toast(S.cfg.message || 'Abhi orders band hain');

    S.cart = store.get(cartKey(), {});
    // cart ko latest menu se reconcile karo
    Object.keys(S.cart).forEach((id) => {
      const m = S.menu.find((x) => x.id === id);
      if (!m || !m.available) delete S.cart[id];
      else { S.cart[id].price = m.price; S.cart[id].name = m.name; }
    });
    saveCart();

    renderTabs(); renderMenu(); renderCart();
    if (S.active) { refreshOrder(); startPolling(); }
  }

  /* ================= 13. SELF TEST: __diag() ================= */
  window.__diag = async function (opts) {
    opts = opts || {};
    const rows = [];
    const add = (check, ok, detail) => rows.push({ check, result: ok === 'warn' ? 'WARN' : ok ? 'PASS' : 'FAIL', detail: detail || '' });

    // A) config
    add('API_URL set', !!getApiUrl(), getApiUrl() || 'frontend-config.js check karo');

    // B) DOM IDs
    Object.entries(A.ids).forEach(([key, id]) => {
      const found = !!document.getElementById(id);
      add('DOM #' + id, found ? true : (A.optionalIds.includes(key) ? 'warn' : false), found ? '' : 'index.html mein nahi mila');
    });

    // C) backend
    const run = async (label, fn, validate) => {
      try { const d = await fn(); const msg = validate(d); add(label, msg === true, msg === true ? '' : msg); return d; }
      catch (e) { add(label, false, e.message); }
    };

    await run('GET ' + A.actions.publicConfig, () => api.get(A.actions.publicConfig),
      (d) => (d && typeof d === 'object') ? true : 'object nahi mila');

    const menu = await run('GET ' + A.actions.menu, () => api.get(A.actions.menu), (d) => {
      const items = normMenu(d);
      if (!items.length) return 'koi item nahi mila (id field ka naam check karo). Raw: ' + JSON.stringify(d).slice(0, 150);
      const bad = items.filter((i) => !i.name || !(i.price >= 0));
      return bad.length ? bad.length + ' items mein name/price galat' : true;
    });

    const tok = S.token;
    if (tok) {
      await run('GET ' + A.actions.resolveTable, () => api.get(A.actions.resolveTable, { [A.params.tableToken]: tok }),
        (d) => (d && typeof d === 'object') ? true : 'object nahi mila');
    } else add('GET ' + A.actions.resolveTable, 'warn', 'URL mein ?t=TOKEN nahi — skip');

    // bogus token must fail gracefully (error JSON), not crash
    try { await api.get(A.actions.resolveTable, { [A.params.tableToken]: 'INVALID_TOKEN_XYZ' }); add('Invalid token rejected', false, 'backend ne invalid token accept kar liya!'); }
    catch (e) { add('Invalid token rejected', true, e.message); }

    // coupon bogus
    try {
      const d = await api.post(A.actions.validateCoupon, { code: 'NOPE_NOT_REAL', subtotal: 100, items: [] });
      add('Bogus coupon rejected', pick(d, ['valid', 'isValid'], true) === false, JSON.stringify(d).slice(0, 120));
    } catch (e) { add('Bogus coupon rejected', true, e.message); }

    // D) real order (opt-in — REAL order + email banega)
    if (opts.order && tok && menu) {
      const it = normMenu(menu).find((i) => i.available);
      if (it) {
        try {
          const d = await api.post(A.actions.createOrder, { token: tok, customerName: 'DIAG TEST', customerPhone: '', note: 'diag test - ignore',
            items: [{ id: it.id, qty: 1 }], couponCode: '', requestId: uid() });
          const oid = pick(d, ['orderId', 'id'], '');
          add('POST createOrder', !!oid, 'orderId=' + oid + ' (sheet se test row delete kar do)');
          if (oid) {
            const p = { [A.params.trackOrderId]: oid, [A.params.tableToken]: tok };
            const tt = pick(d, ['trackingToken', 'trackToken', 'token'], '');
            if (tt) p[A.params.trackToken] = tt;
            await run('GET ' + A.actions.trackOrder, () => api.get(A.actions.trackOrder, p),
              (x) => normOrder(x).id ? true : 'order id/status nahi mila. Raw: ' + JSON.stringify(x).slice(0, 150));
          }
        } catch (e) { add('POST createOrder', false, e.message); }
      }
    } else add('POST createOrder', 'warn', 'skip (chalane ke liye __diag({order:true}))');

    console.table(rows);
    const fails = rows.filter((r) => r.result === 'FAIL').length;
    console.log(fails ? `❌ ${fails} FAIL — table ka detail column dekho aur mujhe bhejo` : '✅ Sab PASS');
    return rows;
  };

  document.addEventListener('DOMContentLoaded', init);
})();
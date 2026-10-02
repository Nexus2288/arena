/**
 * dashboard.js
 * Owner dashboard logic for Love Over Coffee.
 * Talks ONLY to the Apps Script backend via window.LOC_CONFIG.API_URL.
 */
'use strict';

(function () {
  const API_URL = (window.LOC_CONFIG && window.LOC_CONFIG.API_URL) || '';
  const TOKEN_KEY = 'loc_owner_token';
  const EXPIRES_KEY = 'loc_owner_expires';

  const $ = (id) => document.getElementById(id);
  const qAll = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const el = {
    screenLoading: $('screenLoading'),
    screenLogin: $('screenLogin'),
    loginForm: $('loginForm'),
    accessKeyInput: $('accessKeyInput'),
    loginError: $('loginError'),
    loginBtn: $('loginBtn'),
    app: $('app'),
    cafeNameLabel: $('cafeNameLabel'),
    logoutBtn: $('logoutBtn'),
    tabBar: $('tabBar'),

    statTodayOrders: $('statTodayOrders'),
    statTodaySales: $('statTodaySales'),
    statAvgOrder: $('statAvgOrder'),
    statActiveOrders: $('statActiveOrders'),
    statNewOrders: $('statNewOrders'),
    statPreparingOrders: $('statPreparingOrders'),
    statCompletedToday: $('statCompletedToday'),
    statCancelledToday: $('statCancelledToday'),
    statTotalCustomers: $('statTotalCustomers'),
    statActiveTables: $('statActiveTables'),
    homeRefreshBtn: $('homeRefreshBtn'),
    homeRecentOrdersBody: $('homeRecentOrdersBody'),
    homeRecentEmpty: $('homeRecentEmpty'),

    ordersStatusFilter: $('ordersStatusFilter'),
    ordersDateFrom: $('ordersDateFrom'),
    ordersDateTo: $('ordersDateTo'),
    ordersLimit: $('ordersLimit'),
    ordersFilterBtn: $('ordersFilterBtn'),
    ordersResetBtn: $('ordersResetBtn'),
    ordersBody: $('ordersBody'),
    ordersEmpty: $('ordersEmpty'),

    menuAddBtn: $('menuAddBtn'),
    menuBody: $('menuBody'),
    menuEmpty: $('menuEmpty'),

    couponAddBtn: $('couponAddBtn'),
    couponsBody: $('couponsBody'),
    couponsEmpty: $('couponsEmpty'),

    tableAddBtn: $('tableAddBtn'),
    tablesBody: $('tablesBody'),
    tablesEmpty: $('tablesEmpty'),

    customersSearch: $('customersSearch'),
    customersSelectionBar: $('customersSelectionBar'),
    customersSelectedCount: $('customersSelectedCount'),
    customersNotifyBtn: $('customersNotifyBtn'),
    customersClearSelectionBtn: $('customersClearSelectionBtn'),
    customersBody: $('customersBody'),
    customersEmpty: $('customersEmpty'),

    analyticsRange: $('analyticsRange'),
    analyticsDate: $('analyticsDate'),
    analyticsDateFrom: $('analyticsDateFrom'),
    analyticsDateTo: $('analyticsDateTo'),
    analyticsApplyBtn: $('analyticsApplyBtn'),
    analyticsSales: $('analyticsSales'),
    analyticsOrders: $('analyticsOrders'),
    analyticsAvg: $('analyticsAvg'),
    analyticsDiscount: $('analyticsDiscount'),
    analyticsSeriesBody: $('analyticsSeriesBody'),
    analyticsTopItemsBody: $('analyticsTopItemsBody'),
    analyticsTopItemsEmpty: $('analyticsTopItemsEmpty'),

    notifyForm: $('notifyForm'),
    notifyTitle: $('notifyTitle'),
    notifyMessage: $('notifyMessage'),
    notifyImageUrl: $('notifyImageUrl'),
    notifyButtonText: $('notifyButtonText'),
    notifyButtonLink: $('notifyButtonLink'),
    notifyAudience: $('notifyAudience'),
    notifyRecentDaysField: $('notifyRecentDaysField'),
    notifyRecentDays: $('notifyRecentDays'),
    notifySelectedField: $('notifySelectedField'),
    notifySelectedSummary: $('notifySelectedSummary'),
    notifyError: $('notifyError'),
    notifySendBtn: $('notifySendBtn'),
    notificationsHistoryBody: $('notificationsHistoryBody'),
    notificationsEmpty: $('notificationsEmpty'),

    settingsForm: $('settingsForm'),
    settingCafeName: $('settingCafeName'),
    settingTagline: $('settingTagline'),
    settingAbout: $('settingAbout'),
    settingReviewUrl: $('settingReviewUrl'),
    settingInstagram: $('settingInstagram'),
    settingFacebook: $('settingFacebook'),
    settingYoutube: $('settingYoutube'),
    settingX: $('settingX'),
    settingsError: $('settingsError'),
    settingsSuccess: $('settingsSuccess'),
    settingsSaveBtn: $('settingsSaveBtn'),
    infoCurrency: $('infoCurrency'),
    infoTimezone: $('infoTimezone'),
    infoWebAppUrl: $('infoWebAppUrl'),
    infoCafeEmail: $('infoCafeEmail'),
    infoPushConfigured: $('infoPushConfigured'),
    infoOrderHours: $('infoOrderHours'),

    orderModal: $('orderModal'),
    orderModalTitle: $('orderModalTitle'),
    orderModalCustomer: $('orderModalCustomer'),
    orderModalMobile: $('orderModalMobile'),
    orderModalTable: $('orderModalTable'),
    orderModalTime: $('orderModalTime'),
    orderModalSpecialBox: $('orderModalSpecialBox'),
    orderModalSpecial: $('orderModalSpecial'),
    orderModalItemsBody: $('orderModalItemsBody'),
    orderModalSubtotal: $('orderModalSubtotal'),
    orderModalDiscountRow: $('orderModalDiscountRow'),
    orderModalDiscountLabel: $('orderModalDiscountLabel'),
    orderModalDiscount: $('orderModalDiscount'),
    orderModalTotal: $('orderModalTotal'),
    orderModalActions: $('orderModalActions'),

    menuModal: $('menuModal'),
    menuModalTitle: $('menuModalTitle'),
    menuForm: $('menuForm'),
    menuItemId: $('menuItemId'),
    menuItemName: $('menuItemName'),
    menuItemCategory: $('menuItemCategory'),
    menuItemPrice: $('menuItemPrice'),
    menuItemVeg: $('menuItemVeg'),
    menuItemTag: $('menuItemTag'),
    menuItemTagline: $('menuItemTagline'),
    menuItemAvailable: $('menuItemAvailable'),
    menuFormError: $('menuFormError'),
    menuFormSaveBtn: $('menuFormSaveBtn'),

    couponModal: $('couponModal'),
    couponModalTitle: $('couponModalTitle'),
    couponForm: $('couponForm'),
    couponIsNew: $('couponIsNew'),
    couponFormCode: $('couponFormCode'),
    couponFormDescription: $('couponFormDescription'),
    couponFormMin: $('couponFormMin'),
    couponFormMax: $('couponFormMax'),
    couponFormPercent: $('couponFormPercent'),
    couponFormActive: $('couponFormActive'),
    couponFormError: $('couponFormError'),
    couponFormSaveBtn: $('couponFormSaveBtn'),

    tableModal: $('tableModal'),
    tableModalTitle: $('tableModalTitle'),
    tableForm: $('tableForm'),
    tableFormId: $('tableFormId'),
    tableFormNumber: $('tableFormNumber'),
    tableFormName: $('tableFormName'),
    tableFormActive: $('tableFormActive'),
    tableFormError: $('tableFormError'),
    tableFormSaveBtn: $('tableFormSaveBtn'),

    confirmModal: $('confirmModal'),
    confirmTitle: $('confirmTitle'),
    confirmMessage: $('confirmMessage'),
    confirmCancelBtn: $('confirmCancelBtn'),
    confirmOkBtn: $('confirmOkBtn'),

    toastHost: $('toastHost')
  };

  const tpl = {
    orderRow: $('tplOrderRow'),
    orderLineRow: $('tplOrderLineRow'),
    menuRow: $('tplMenuRow'),
    couponRow: $('tplCouponRow'),
    tableRow: $('tplTableRow'),
    customerRow: $('tplCustomerRow'),
    notificationRow: $('tplNotificationRow'),
    seriesRow: $('tplSeriesRow'),
    topItemRow: $('tplTopItemRow')
  };

  function cloneTpl(t) { return t.content.firstElementChild.cloneNode(true); }
  function role(root, name) { return root.querySelector('[data-role="' + name + '"]'); }

  const state = {
    ownerToken: '',
    currency: '\u20b9',
    selectedCustomers: new Map(), // customerId -> customerName
    coupons: [],
    menuCategories: []
  };

  /* ---------------- Toast ---------------- */
  function showToast(message, type) {
    const div = document.createElement('div');
    div.className = 'toast' + (type ? ' toast--' + type : '');
    div.textContent = message;
    el.toastHost.appendChild(div);
    setTimeout(function () { div.remove(); }, 3600);
  }

  /* ---------------- Money ---------------- */
  function formatMoney(amount) {
    const n = Math.round((Number(amount) || 0) * 100) / 100;
    const negative = n < 0;
    const parts = Math.abs(n).toFixed(2).split('.');
    let intPart = parts[0];
    const last3 = intPart.slice(-3);
    let rest = intPart.slice(0, -3);
    if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',';
    const decimals = parts[1] === '00' ? '' : '.' + parts[1];
    return (negative ? '-' : '') + state.currency + rest + last3 + decimals;
  }

  /* ---------------- API ---------------- */
  function apiError(code, message) {
    const e = new Error(message); e.isApiError = true; e.code = code; return e;
  }

  function apiCall(action, payload, ownerRequired) {
    const body = Object.assign({ action: action }, payload || {});
    if (ownerRequired !== false) body.ownerToken = state.ownerToken;
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json || typeof json !== 'object') throw apiError('SERVER_ERROR', 'Unexpected response from the server.');
        if (json.ok) return json.data;
        throw apiError(json.code || 'SERVER_ERROR', json.message || 'Something went wrong.');
      }).catch(function (err) {
        if (err && err.isApiError) throw err;
        throw apiError('NETWORK_ERROR', 'Could not reach the server. Please check your internet connection.');
      });
  }

  function ownerCall(action, payload) {
    return apiCall(action, payload, true).catch(function (err) {
      if (err.code === 'UNAUTHORIZED') {
        clearSession();
        showLogin('Your session has expired. Please log in again.');
      }
      throw err;
    });
  }

  function setBtnLoading(btn, loading) {
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
  }

  /* ---------------- Session ---------------- */
  function saveSession(token, expiresAt) {
    state.ownerToken = token;
    try { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(EXPIRES_KEY, expiresAt); } catch (e) { /* ignore */ }
  }
  function clearSession() {
    state.ownerToken = '';
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(EXPIRES_KEY); } catch (e) { /* ignore */ }
  }
  function loadSession() {
    let token = '', expiresAt = '';
    try { token = localStorage.getItem(TOKEN_KEY) || ''; expiresAt = localStorage.getItem(EXPIRES_KEY) || ''; } catch (e) { /* ignore */ }
    if (!token || !expiresAt) return false;
    const exp = new Date(expiresAt);
    if (isNaN(exp.getTime()) || exp.getTime() <= Date.now()) return false;
    state.ownerToken = token;
    return true;
  }

  function showLogin(message) {
    el.screenLoading.hidden = true;
    el.app.hidden = true;
    el.screenLogin.hidden = false;
    el.loginForm.reset();
    if (message) { el.loginError.textContent = message; el.loginError.hidden = false; }
    else { el.loginError.hidden = true; }
  }
  function showApp() {
    el.screenLoading.hidden = true;
    el.screenLogin.hidden = true;
    el.app.hidden = false;
  }

  el.loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    el.loginError.hidden = true;
    const key = el.accessKeyInput.value;
    if (!key) { el.loginError.textContent = 'Please enter the access key.'; el.loginError.hidden = false; return; }
    setBtnLoading(el.loginBtn, true);
    apiCall('ownerLogin', { accessKey: key }, false)
      .then(function (data) {
        saveSession(data.token, data.expiresAt);
        startApp();
      })
      .catch(function (err) {
        el.loginError.textContent = err.message;
        el.loginError.hidden = false;
      })
      .finally(function () { setBtnLoading(el.loginBtn, false); });
  });

  el.logoutBtn.addEventListener('click', function () {
    clearSession();
    showLogin('');
  });

  /* ---------------- Tabs ---------------- */
  function switchTab(name) {
    qAll('.tab', el.tabBar).forEach(function (t) { t.classList.toggle('is-active', t.dataset.tab === name); });
    qAll('.tab-panel').forEach(function (p) { p.hidden = p.id !== 'tab' + capitalize(name); });
    const loaders = {
      home: loadHome, orders: loadOrders, menu: loadMenu, coupons: loadCoupons,
      tables: loadTables, customers: loadCustomers, analytics: loadAnalytics,
      notifications: loadNotifications, settings: loadSettings
    };
    if (loaders[name]) loaders[name]();
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  el.tabBar.addEventListener('click', function (e) {
    const btn = e.target.closest('.tab');
    if (btn) switchTab(btn.dataset.tab);
  });

  /* ---------------- Confirm modal ---------------- */
  function confirmAction(title, message) {
    return new Promise(function (resolve) {
      el.confirmTitle.textContent = title;
      el.confirmMessage.textContent = message;
      el.confirmModal.hidden = false;
      function cleanup(result) {
        el.confirmModal.hidden = true;
        el.confirmOkBtn.removeEventListener('click', onOk);
        el.confirmCancelBtn.removeEventListener('click', onCancel);
        resolve(result);
      }
      function onOk() { cleanup(true); }
      function onCancel() { cleanup(false); }
      el.confirmOkBtn.addEventListener('click', onOk);
      el.confirmCancelBtn.addEventListener('click', onCancel);
    });
  }

  function openModal(modal) { modal.hidden = false; }
  function closeModal(modal) { modal.hidden = true; }
  qAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () { closeModal(btn.closest('.modal')); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    qAll('.modal').forEach(function (m) { if (!m.hidden) closeModal(m); });
  });

  /* ================================================================ */
  /* Orders (shared by Home + Orders tabs)                             */
  /* ================================================================ */
  const STATUS_LABEL = { NEW: 'New', PREPARING: 'Preparing', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

  function orderActionsForStatus(status) {
    if (status === 'NEW') return [{ label: 'Start Preparing', status: 'PREPARING', primary: true }, { label: 'Cancel', status: 'CANCELLED', primary: false }];
    if (status === 'PREPARING') return [{ label: 'Mark Completed', status: 'COMPLETED', primary: true }, { label: 'Cancel', status: 'CANCELLED', primary: false }];
    return [];
  }

  function renderOrderRow(order, onChanged) {
    const tr = cloneTpl(tpl.orderRow);
    const orderIdBtn = document.createElement('button');
    orderIdBtn.type = 'button';
    orderIdBtn.className = 'link-btn link-btn--strong';
    orderIdBtn.textContent = order.orderId;
    orderIdBtn.addEventListener('click', function () { openOrderModal(order, onChanged); });
    role(tr, 'orderId').appendChild(orderIdBtn);

    role(tr, 'table').textContent = order.tableNumber;
    role(tr, 'customer').textContent = order.customerName;
    role(tr, 'total').textContent = formatMoney(order.finalTotal);
    const pill = role(tr, 'statusPill');
    pill.textContent = STATUS_LABEL[order.orderStatus] || order.orderStatus;
    pill.classList.add('status-pill--' + order.orderStatus);
    role(tr, 'time').textContent = order.orderDate + ' ' + order.orderTime;

    const actionsHost = role(tr, 'actions');
    orderActionsForStatus(order.orderStatus).forEach(function (action) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = action.primary ? 'btn-primary btn-primary--small' : 'btn-outline btn-outline--small';
      btn.textContent = action.label;
      btn.style.marginRight = '6px';
      btn.addEventListener('click', function () {
        handleOrderStatusChange(order, action.status, btn, onChanged);
      });
      actionsHost.appendChild(btn);
    });
    return tr;
  }

  function handleOrderStatusChange(order, newStatus, btn, onChanged) {
    const verb = newStatus === 'CANCELLED' ? 'cancel' : 'update';
    confirmAction('Confirm action', 'Are you sure you want to ' + verb + ' order ' + order.orderId + '?')
      .then(function (ok) {
        if (!ok) return;
        setBtnLoading(btn, true);
        return ownerCall('ownerUpdateOrderStatus', { orderId: order.orderId, status: newStatus })
          .then(function (data) {
            showToast('Order ' + data.order.orderId + ' updated.', 'success');
            if (onChanged) onChanged();
          })
          .catch(function (err) { showToast(err.message, 'error'); })
          .finally(function () { setBtnLoading(btn, false); });
      });
  }

  function openOrderModal(order, onChanged) {
    el.orderModalTitle.textContent = 'Order ' + order.orderId;
    el.orderModalCustomer.textContent = order.customerName;
    el.orderModalMobile.textContent = order.mobile;
    el.orderModalTable.textContent = order.tableNumber;
    el.orderModalTime.textContent = order.orderDate + ' ' + order.orderTime;
    if (order.specialRequest) {
      el.orderModalSpecialBox.hidden = false;
      el.orderModalSpecial.textContent = order.specialRequest;
    } else {
      el.orderModalSpecialBox.hidden = true;
    }
    el.orderModalItemsBody.innerHTML = '';
    order.items.forEach(function (line) {
      const tr = cloneTpl(tpl.orderLineRow);
      role(tr, 'name').textContent = line.itemName;
      role(tr, 'qty').textContent = line.quantity;
      role(tr, 'price').textContent = formatMoney(line.price);
      role(tr, 'total').textContent = formatMoney(line.lineTotal);
      el.orderModalItemsBody.appendChild(tr);
    });
    el.orderModalSubtotal.textContent = formatMoney(order.subtotal);
    if (order.couponCode) {
      el.orderModalDiscountRow.hidden = false;
      el.orderModalDiscountLabel.textContent = 'Discount (' + order.couponCode + ')';
      el.orderModalDiscount.textContent = '-' + formatMoney(order.discountAmount);
    } else {
      el.orderModalDiscountRow.hidden = true;
    }
    el.orderModalTotal.textContent = formatMoney(order.finalTotal);

    el.orderModalActions.innerHTML = '';
    orderActionsForStatus(order.orderStatus).forEach(function (action) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = action.primary ? 'btn-primary' : 'btn-outline';
      btn.textContent = action.label;
      btn.addEventListener('click', function () {
        handleOrderStatusChange(order, action.status, btn, function () {
          closeModal(el.orderModal);
          if (onChanged) onChanged();
        });
      });
      el.orderModalActions.appendChild(btn);
    });
    openModal(el.orderModal);
  }

  /* ---------------- Home ---------------- */
  function loadHome() {
    ownerCall('ownerDashboardSummary', {}).then(function (data) {
      el.statTodayOrders.textContent = data.todayOrders;
      el.statTodaySales.textContent = formatMoney(data.todaySales);
      el.statAvgOrder.textContent = formatMoney(data.avgOrderValue);
      el.statActiveOrders.textContent = data.activeOrders;
      el.statNewOrders.textContent = data.newOrders;
      el.statPreparingOrders.textContent = data.preparingOrders;
      el.statCompletedToday.textContent = data.completedToday;
      el.statCancelledToday.textContent = data.cancelledToday;
      el.statTotalCustomers.textContent = data.totalCustomers;
      el.statActiveTables.textContent = data.activeTables;

      el.homeRecentOrdersBody.innerHTML = '';
      el.homeRecentEmpty.hidden = data.recentOrders.length > 0;
      data.recentOrders.forEach(function (o) {
        el.homeRecentOrdersBody.appendChild(renderOrderRow(o, loadHome));
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }
  el.homeRefreshBtn.addEventListener('click', loadHome);

  /* ---------------- Orders tab ---------------- */
  function loadOrders() {
    const payload = {};
    if (el.ordersStatusFilter.value) payload.status = el.ordersStatusFilter.value;
    if (el.ordersDateFrom.value) payload.dateFrom = el.ordersDateFrom.value;
    if (el.ordersDateTo.value) payload.dateTo = el.ordersDateTo.value;
    if (el.ordersLimit.value) payload.limit = Number(el.ordersLimit.value);
    ownerCall('ownerListOrders', payload).then(function (data) {
      el.ordersBody.innerHTML = '';
      el.ordersEmpty.hidden = data.orders.length > 0;
      data.orders.forEach(function (o) {
        el.ordersBody.appendChild(renderOrderRow(o, loadOrders));
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }
  el.ordersFilterBtn.addEventListener('click', loadOrders);
  el.ordersResetBtn.addEventListener('click', function () {
    el.ordersStatusFilter.value = '';
    el.ordersDateFrom.value = '';
    el.ordersDateTo.value = '';
    el.ordersLimit.value = '100';
    loadOrders();
  });

  /* ================================================================ */
  /* Menu                                                              */
  /* ================================================================ */
  function loadMenu() {
    ownerCall('ownerListMenu', {}).then(function (data) {
      state.menuCategories = uniqueStrings(data.items.map(function (i) { return i.category; }));
      el.menuBody.innerHTML = '';
      el.menuEmpty.hidden = data.items.length > 0;
      data.items.forEach(function (item) {
        const tr = cloneTpl(tpl.menuRow);
        role(tr, 'name').textContent = item.itemName;
        role(tr, 'category').textContent = item.category;
        role(tr, 'price').textContent = formatMoney(item.price);
        const vegMark = role(tr, 'vegMark');
        if (item.vegStatus === 'NON_VEG') vegMark.classList.add('is-nonveg');
        const toggle = role(tr, 'availableToggle');
        toggle.checked = item.available;
        toggle.addEventListener('change', function () {
          ownerCall('ownerSetMenuAvailability', { itemId: item.itemId, available: toggle.checked })
            .then(function () { showToast('Item updated.', 'success'); })
            .catch(function (err) { toggle.checked = !toggle.checked; showToast(err.message, 'error'); });
        });
        role(tr, 'editBtn').addEventListener('click', function () { openMenuModal(item); });
        role(tr, 'deleteBtn').addEventListener('click', function () {
          confirmAction('Delete item', 'Delete "' + item.itemName + '"? This cannot be undone.').then(function (ok) {
            if (!ok) return;
            ownerCall('ownerDeleteMenuItem', { itemId: item.itemId })
              .then(function () { showToast('Item deleted.', 'success'); loadMenu(); })
              .catch(function (err) { showToast(err.message, 'error'); });
          });
        });
        el.menuBody.appendChild(tr);
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }

  function uniqueStrings(list) {
    const seen = {}; const out = [];
    list.forEach(function (v) { if (!seen[v]) { seen[v] = true; out.push(v); } });
    return out;
  }

  function openMenuModal(item) {
    el.menuForm.reset();
    el.menuFormError.hidden = true;
    if (item) {
      el.menuModalTitle.textContent = 'Edit item';
      el.menuItemId.value = item.itemId;
      el.menuItemName.value = item.itemName;
      el.menuItemCategory.value = item.category;
      el.menuItemPrice.value = item.price;
      el.menuItemVeg.value = item.vegStatus;
      el.menuItemTag.value = item.tag || '';
      el.menuItemTagline.value = item.tagline || '';
      el.menuItemAvailable.checked = item.available;
    } else {
      el.menuModalTitle.textContent = 'Add item';
      el.menuItemId.value = '';
      el.menuItemAvailable.checked = true;
    }
    openModal(el.menuModal);
  }
  el.menuAddBtn.addEventListener('click', function () { openMenuModal(null); });

  el.menuForm.addEventListener('submit', function (e) {
    e.preventDefault();
    el.menuFormError.hidden = true;
    const payload = {
      itemId: el.menuItemId.value || undefined,
      itemName: el.menuItemName.value.trim(),
      category: el.menuItemCategory.value.trim(),
      price: el.menuItemPrice.value,
      vegStatus: el.menuItemVeg.value,
      tag: el.menuItemTag.value.trim(),
      tagline: el.menuItemTagline.value.trim(),
      available: el.menuItemAvailable.checked
    };
    setBtnLoading(el.menuFormSaveBtn, true);
    ownerCall('ownerSaveMenuItem', payload)
      .then(function () {
        showToast('Item saved.', 'success');
        closeModal(el.menuModal);
        loadMenu();
      })
      .catch(function (err) { el.menuFormError.textContent = err.message; el.menuFormError.hidden = false; })
      .finally(function () { setBtnLoading(el.menuFormSaveBtn, false); });
  });

  /* ================================================================ */
  /* Coupons                                                           */
  /* ================================================================ */
  function loadCoupons() {
    ownerCall('ownerListCoupons', {}).then(function (data) {
      state.coupons = data.coupons;
      el.couponsBody.innerHTML = '';
      el.couponsEmpty.hidden = data.coupons.length > 0;
      data.coupons.forEach(function (c) {
        const tr = cloneTpl(tpl.couponRow);
        role(tr, 'code').textContent = c.couponCode;
        role(tr, 'range').textContent = formatMoney(c.minOrder) + ' \u2013 ' +
          (c.maxOrder === null ? 'no limit' : formatMoney(c.maxOrder));
        role(tr, 'discount').textContent = c.discountPercent + '%';
        const toggle = role(tr, 'activeToggle');
        toggle.checked = c.active;
        toggle.addEventListener('change', function () {
          ownerCall('ownerSetCouponActive', { couponCode: c.couponCode, active: toggle.checked })
            .then(function () { showToast('Coupon updated.', 'success'); loadCoupons(); })
            .catch(function (err) { toggle.checked = !toggle.checked; showToast(err.message, 'error'); });
        });
        role(tr, 'usageCount').textContent = c.usageCount;
        role(tr, 'totalDiscount').textContent = formatMoney(c.totalDiscount);
        role(tr, 'editBtn').addEventListener('click', function () { openCouponModal(c); });
        el.couponsBody.appendChild(tr);
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }

  function openCouponModal(coupon) {
    el.couponForm.reset();
    el.couponFormError.hidden = true;
    if (coupon) {
      el.couponModalTitle.textContent = 'Edit coupon';
      el.couponIsNew.value = 'false';
      el.couponFormCode.value = coupon.couponCode;
      el.couponFormCode.disabled = true;
      el.couponFormDescription.value = coupon.description || '';
      el.couponFormMin.value = coupon.minOrder;
      el.couponFormMax.value = coupon.maxOrder === null ? '' : coupon.maxOrder;
      el.couponFormPercent.value = coupon.discountPercent;
      el.couponFormActive.checked = coupon.active;
    } else {
      el.couponModalTitle.textContent = 'Add coupon';
      el.couponIsNew.value = 'true';
      el.couponFormCode.disabled = false;
      el.couponFormActive.checked = true;
    }
    openModal(el.couponModal);
  }
  el.couponAddBtn.addEventListener('click', function () { openCouponModal(null); });

  el.couponForm.addEventListener('submit', function (e) {
    e.preventDefault();
    el.couponFormError.hidden = true;
    const payload = {
      couponCode: el.couponFormCode.value.trim().toUpperCase(),
      description: el.couponFormDescription.value.trim(),
      minOrder: el.couponFormMin.value,
      maxOrder: el.couponFormMax.value === '' ? '' : el.couponFormMax.value,
      discountPercent: el.couponFormPercent.value,
      active: el.couponFormActive.checked,
      isNew: el.couponIsNew.value === 'true'
    };
    setBtnLoading(el.couponFormSaveBtn, true);
    ownerCall('ownerSaveCoupon', payload)
      .then(function () {
        showToast('Coupon saved.', 'success');
        closeModal(el.couponModal);
        loadCoupons();
      })
      .catch(function (err) { el.couponFormError.textContent = err.message; el.couponFormError.hidden = false; })
      .finally(function () { setBtnLoading(el.couponFormSaveBtn, false); });
  });

  /* ================================================================ */
  /* Tables                                                            */
  /* ================================================================ */
  function loadTables() {
    ownerCall('ownerListTables', {}).then(function (data) {
      el.tablesBody.innerHTML = '';
      el.tablesEmpty.hidden = data.tables.length > 0;
      data.tables.forEach(function (t) {
        const tr = cloneTpl(tpl.tableRow);
        role(tr, 'number').textContent = t.tableNumber;
        role(tr, 'name').textContent = t.tableName;
        const qrInput = role(tr, 'qrUrl');
        qrInput.value = t.qrUrl || 'Not configured (set CUSTOMER_WEB_APP_URL)';
        const copyBtn = role(tr, 'copyBtn');
        if (!t.qrUrl) copyBtn.disabled = true;
        copyBtn.addEventListener('click', function () { copyToClipboard(t.qrUrl, copyBtn); });
        role(tr, 'regenBtn').addEventListener('click', function () {
          confirmAction('Regenerate QR link', 'The old QR code for Table ' + t.tableNumber +
            ' will stop working immediately. Continue?').then(function (ok) {
            if (!ok) return;
            ownerCall('ownerRegenerateTableToken', { tableId: t.tableId })
              .then(function () { showToast('New QR link generated.', 'success'); loadTables(); })
              .catch(function (err) { showToast(err.message, 'error'); });
          });
        });
        const toggle = role(tr, 'activeToggle');
        toggle.checked = t.active;
        toggle.addEventListener('change', function () {
          ownerCall('ownerSetTableActive', { tableId: t.tableId, active: toggle.checked })
            .then(function () { showToast('Table updated.', 'success'); })
            .catch(function (err) { toggle.checked = !toggle.checked; showToast(err.message, 'error'); });
        });
        role(tr, 'editBtn').addEventListener('click', function () { openTableModal(t); });
        el.tablesBody.appendChild(tr);
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }

  function copyToClipboard(text, btn) {
    if (!text) return;
    const done = function () {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = original; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { showToast('Could not copy automatically. Please copy manually.', 'error'); });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { showToast('Could not copy automatically.', 'error'); }
      ta.remove();
    }
  }

  function openTableModal(table) {
    el.tableForm.reset();
    el.tableFormError.hidden = true;
    if (table) {
      el.tableModalTitle.textContent = 'Edit table';
      el.tableFormId.value = table.tableId;
      el.tableFormNumber.value = table.tableNumber;
      el.tableFormName.value = table.tableName;
      el.tableFormActive.checked = table.active;
    } else {
      el.tableModalTitle.textContent = 'Add table';
      el.tableFormId.value = '';
      el.tableFormActive.checked = true;
    }
    openModal(el.tableModal);
  }
  el.tableAddBtn.addEventListener('click', function () { openTableModal(null); });

  el.tableForm.addEventListener('submit', function (e) {
    e.preventDefault();
    el.tableFormError.hidden = true;
    const payload = {
      tableId: el.tableFormId.value || undefined,
      tableNumber: el.tableFormNumber.value.trim(),
      tableName: el.tableFormName.value.trim(),
      active: el.tableFormActive.checked
    };
    setBtnLoading(el.tableFormSaveBtn, true);
    ownerCall('ownerSaveTable', payload)
      .then(function () {
        showToast('Table saved.', 'success');
        closeModal(el.tableModal);
        loadTables();
      })
      .catch(function (err) { el.tableFormError.textContent = err.message; el.tableFormError.hidden = false; })
      .finally(function () { setBtnLoading(el.tableFormSaveBtn, false); });
  });

  /* ================================================================ */
  /* Customers                                                         */
  /* ================================================================ */
  let customersSearchTimer = null;
  function loadCustomers() {
    ownerCall('ownerListCustomers', { search: el.customersSearch.value.trim() }).then(function (data) {
      el.customersBody.innerHTML = '';
      el.customersEmpty.hidden = data.customers.length > 0;
      data.customers.forEach(function (c) {
        const tr = cloneTpl(tpl.customerRow);
        const checkbox = role(tr, 'selectBox');
        checkbox.checked = state.selectedCustomers.has(c.customerId);
        checkbox.addEventListener('change', function () {
          if (checkbox.checked) state.selectedCustomers.set(c.customerId, c.customerName);
          else state.selectedCustomers.delete(c.customerId);
          updateSelectionBar();
        });
        role(tr, 'name').textContent = c.customerName;
        role(tr, 'mobile').textContent = c.mobile;
        role(tr, 'orders').textContent = c.orderCount;
        role(tr, 'totalSpent').textContent = formatMoney(c.totalSpent);
        role(tr, 'lastSeen').textContent = c.lastSeen;
        role(tr, 'notifAllowed').textContent = c.notificationAllowed ? 'Yes' : 'No';
        el.customersBody.appendChild(tr);
      });
      updateSelectionBar();
    }).catch(function (err) { showToast(err.message, 'error'); });
  }
  el.customersSearch.addEventListener('input', function () {
    clearTimeout(customersSearchTimer);
    customersSearchTimer = setTimeout(loadCustomers, 350);
  });

  function updateSelectionBar() {
    const count = state.selectedCustomers.size;
    el.customersSelectionBar.hidden = count === 0;
    el.customersSelectedCount.textContent = count + (count === 1 ? ' selected' : ' selected');
  }
  el.customersClearSelectionBtn.addEventListener('click', function () {
    state.selectedCustomers.clear();
    loadCustomers();
  });
  el.customersNotifyBtn.addEventListener('click', function () {
    switchTab('notifications');
    el.notifyAudience.value = 'SELECTED';
    toggleAudienceFields();
  });

  /* ================================================================ */
  /* Analytics                                                         */
  /* ================================================================ */
  function todayLocalDateString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function toggleAnalyticsInputs() {
    const range = el.analyticsRange.value;
    const isCustom = range === 'custom';
    el.analyticsDate.hidden = isCustom;
    el.analyticsDateFrom.hidden = !isCustom;
    el.analyticsDateTo.hidden = !isCustom;
  }
  el.analyticsRange.addEventListener('change', toggleAnalyticsInputs);

  function loadAnalytics() {
    if (!el.analyticsDate.value) el.analyticsDate.value = todayLocalDateString();
    toggleAnalyticsInputs();
    fetchAnalytics();
  }
  el.analyticsApplyBtn.addEventListener('click', fetchAnalytics);

  function fetchAnalytics() {
    const range = el.analyticsRange.value;
    const payload = { range: range };
    if (range === 'custom') {
      payload.dateFrom = el.analyticsDateFrom.value;
      payload.dateTo = el.analyticsDateTo.value;
    } else {
      payload.date = el.analyticsDate.value || todayLocalDateString();
    }
    ownerCall('ownerAnalytics', payload).then(function (data) {
      el.analyticsSales.textContent = formatMoney(data.totals.sales);
      el.analyticsOrders.textContent = data.totals.orders;
      el.analyticsAvg.textContent = formatMoney(data.totals.avgOrderValue);
      el.analyticsDiscount.textContent = formatMoney(data.totals.discountTotal);

      el.analyticsSeriesBody.innerHTML = '';
      data.series.forEach(function (row) {
        const tr = cloneTpl(tpl.seriesRow);
        role(tr, 'date').textContent = row.date;
        role(tr, 'orders').textContent = row.orders;
        role(tr, 'sales').textContent = formatMoney(row.sales);
        el.analyticsSeriesBody.appendChild(tr);
      });

      el.analyticsTopItemsBody.innerHTML = '';
      el.analyticsTopItemsEmpty.hidden = data.topItems.length > 0;
      data.topItems.forEach(function (item) {
        const tr = cloneTpl(tpl.topItemRow);
        role(tr, 'name').textContent = item.itemName;
        role(tr, 'qty').textContent = item.quantity;
        role(tr, 'revenue').textContent = formatMoney(item.revenue);
        el.analyticsTopItemsBody.appendChild(tr);
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }

  /* ================================================================ */
  /* Notifications                                                     */
  /* ================================================================ */
  function toggleAudienceFields() {
    const audience = el.notifyAudience.value;
    el.notifyRecentDaysField.hidden = audience !== 'RECENT';
    el.notifySelectedField.hidden = audience !== 'SELECTED';
    if (audience === 'SELECTED') {
      const count = state.selectedCustomers.size;
      el.notifySelectedSummary.textContent = count + ' customer(s) selected.' +
        (count === 0 ? ' Go to the Customers tab to select recipients.' : '');
    }
  }
  el.notifyAudience.addEventListener('change', toggleAudienceFields);

  function loadNotifications() {
    toggleAudienceFields();
    ownerCall('ownerListNotifications', {}).then(function (data) {
      el.notificationsHistoryBody.innerHTML = '';
      el.notificationsEmpty.hidden = data.notifications.length > 0;
      data.notifications.forEach(function (n) {
        const tr = cloneTpl(tpl.notificationRow);
        role(tr, 'title').textContent = n.title;
        role(tr, 'audience').textContent = n.audienceType;
        role(tr, 'recipients').textContent = n.recipientCount;
        role(tr, 'createdAt').textContent = n.createdAt;
        el.notificationsHistoryBody.appendChild(tr);
      });
    }).catch(function (err) { showToast(err.message, 'error'); });
  }

  el.notifyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    el.notifyError.hidden = true;
    const audience = el.notifyAudience.value;
    const payload = {
      title: el.notifyTitle.value.trim(),
      message: el.notifyMessage.value.trim(),
      imageUrl: el.notifyImageUrl.value.trim(),
      buttonText: el.notifyButtonText.value.trim(),
      buttonLink: el.notifyButtonLink.value.trim(),
      audience: audience
    };
    if (audience === 'RECENT') payload.recentDays = el.notifyRecentDays.value;
    if (audience === 'SELECTED') {
      const ids = Array.from(state.selectedCustomers.keys());
      if (!ids.length) {
        el.notifyError.textContent = 'Please select at least one customer from the Customers tab.';
        el.notifyError.hidden = false;
        return;
      }
      payload.customerIds = ids;
    }
    setBtnLoading(el.notifySendBtn, true);
    ownerCall('ownerSendNotification', payload)
      .then(function (data) {
        showToast('Notification sent to ' + data.recipientCount + ' customer(s).', 'success');
        el.notifyForm.reset();
        state.selectedCustomers.clear();
        toggleAudienceFields();
        loadNotifications();
      })
      .catch(function (err) { el.notifyError.textContent = err.message; el.notifyError.hidden = false; })
      .finally(function () { setBtnLoading(el.notifySendBtn, false); });
  });

  /* ================================================================ */
  /* Settings                                                          */
  /* ================================================================ */
  function loadSettings() {
    ownerCall('ownerGetSettings', {}).then(function (data) {
      el.settingCafeName.value = data.settings.CAFE_NAME || '';
      el.settingTagline.value = data.settings.CAFE_TAGLINE || '';
      el.settingAbout.value = data.settings.CAFE_ABOUT || '';
      el.settingReviewUrl.value = data.settings.GOOGLE_REVIEW_URL || '';
      el.settingInstagram.value = data.settings.INSTAGRAM_URL || '';
      el.settingFacebook.value = data.settings.FACEBOOK_URL || '';
      el.settingYoutube.value = data.settings.YOUTUBE_URL || '';
      el.settingX.value = data.settings.X_URL || '';

      el.infoCurrency.textContent = data.info.currency;
      el.infoTimezone.textContent = data.info.timezone;
      el.infoWebAppUrl.textContent = data.info.customerWebAppUrl || 'Not set';
      el.infoCafeEmail.textContent = data.info.cafeEmail || 'Not set';
      el.infoPushConfigured.textContent = data.info.pushConfigured ? 'Configured' : 'Not configured (in-app only)';
      el.infoOrderHours.textContent = data.info.orderHours + ' hour(s)';

      el.cafeNameLabel.textContent = data.settings.CAFE_NAME || 'Love Over Coffee';
      state.currency = data.info.currency || state.currency;
    }).catch(function (err) { showToast(err.message, 'error'); });
  }

  el.settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    el.settingsError.hidden = true;
    el.settingsSuccess.hidden = true;
    const settings = {
      CAFE_NAME: el.settingCafeName.value.trim(),
      CAFE_TAGLINE: el.settingTagline.value.trim(),
      CAFE_ABOUT: el.settingAbout.value.trim(),
      GOOGLE_REVIEW_URL: el.settingReviewUrl.value.trim(),
      INSTAGRAM_URL: el.settingInstagram.value.trim(),
      FACEBOOK_URL: el.settingFacebook.value.trim(),
      YOUTUBE_URL: el.settingYoutube.value.trim(),
      X_URL: el.settingX.value.trim()
    };
    setBtnLoading(el.settingsSaveBtn, true);
    ownerCall('ownerSaveSettings', { settings: settings })
      .then(function () {
        el.settingsSuccess.textContent = 'Settings saved.';
        el.settingsSuccess.hidden = false;
        el.cafeNameLabel.textContent = settings.CAFE_NAME;
        showToast('Settings saved.', 'success');
      })
      .catch(function (err) { el.settingsError.textContent = err.message; el.settingsError.hidden = false; })
      .finally(function () { setBtnLoading(el.settingsSaveBtn, false); });
  });

  /* ================================================================ */
  /* Boot                                                              */
  /* ================================================================ */
  function startApp() {
    showApp();
    loadSettings();
    switchTab('home');
  }

  function boot() {
    if (!API_URL) {
      el.screenLoading.hidden = true;
      el.screenLogin.hidden = false;
      el.loginError.textContent = 'The dashboard is not configured yet (missing API URL).';
      el.loginError.hidden = false;
      el.loginForm.hidden = true;
      return;
    }
    if (loadSession()) startApp();
    else showLogin('');
  }

  document.addEventListener('DOMContentLoaded', boot);
})();

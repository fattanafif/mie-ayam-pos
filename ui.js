// ===== UI HELPERS =====
function toast(msg, type='success') {
  const c=document.getElementById('toastContainer'),t=document.createElement('div');
  t.className='toast '+type; t.textContent=msg; c.appendChild(t);
  setTimeout(()=>{t.style.animation='toastOut .3s ease forwards';setTimeout(()=>t.remove(),300)},2500);
}
function showModal(id){document.getElementById(id).classList.add('active')}
function hideModal(id){document.getElementById(id).classList.remove('active')}

function switchPage(page) {
  if (page==='settings' && !State.pinVerified) { showPinModal(); return; }
  State.currentPage=page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  document.querySelectorAll('.bottom-nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  if(page==='history')renderHistory();
  if(page==='reports')renderReports();
  if(page==='settings')renderSettings();
}

// ===== THEME =====
function toggleTheme() {
  const isDark = !document.body.classList.contains('light-mode');
  document.body.classList.toggle('light-mode', isDark);
  document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
  State.settings.theme = isDark ? 'light' : 'dark';
  saveSettings();
}
function applyTheme() {
  const light = State.settings.theme === 'light';
  document.body.classList.toggle('light-mode', light);
  document.getElementById('themeToggle').textContent = light ? '☀️' : '🌙';
}

// ===== PIN =====
function showPinModal() {
  showModal('pinModal');
  document.getElementById('pinError').classList.add('hidden');
  document.querySelectorAll('.pin-digit').forEach((d,i) => { d.value=''; if(i===0) setTimeout(()=>d.focus(),100); });
}
function verifyPin() {
  const digits = document.querySelectorAll('.pin-digit');
  const pin = Array.from(digits).map(d=>d.value).join('');
  if (pin.length < 4) return; // belum lengkap
  if (pin === (State.settings.pin||'1234')) {
    State.pinVerified = true;
    hideModal('pinModal');
    document.getElementById('pinError').classList.add('hidden');
    switchPage('settings');
  } else {
    document.getElementById('pinError').classList.remove('hidden');
    document.getElementById('pinError').textContent = '❌ PIN salah! Coba lagi.';
    digits.forEach(d=>d.value='');
    digits.forEach(d=>d.style.borderColor='var(--danger)');
    setTimeout(()=>{ digits.forEach(d=>d.style.borderColor=''); digits[0].focus(); }, 800);
  }
}

// ===== CASHIER SELECT =====
function showCashierSelect() {
  const list = document.getElementById('cashierSelectList');
  list.innerHTML = State.cashiers.map(c =>
    `<button class="btn-secondary" style="width:100%;margin-bottom:8px;padding:14px;font-size:1rem" onclick="selectCashier('${c.replace(/'/g,"\\'")}')">${c}</button>`
  ).join('');
  showModal('cashierModal');
}
function selectCashier(name) {
  State.currentCashier = name;
  hideModal('cashierModal');
  updateCashierBar();
  startShift();
  toast('Selamat datang, ' + name + '! 👋');
}

// ===== SHIFT =====
function startShift() {
  State.currentShift = {
    cashier: State.currentCashier,
    startTime: new Date().toISOString(),
    endTime: null,
    orders: []
  };
  updateShiftStatus();
}
function updateShiftStatus() {
  const el = document.getElementById('shiftStatus');
  if (State.currentShift && !State.currentShift.endTime) {
    const t = new Date(State.currentShift.startTime).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    el.innerHTML = `🟢 Shift aktif sejak ${t}`;
  } else {
    el.innerHTML = '⏸ Belum mulai shift';
  }
}

// ===== CLOCK =====
function updateClock() {
  const now=new Date();
  const sc=document.getElementById('sidebarClock'),sd=document.getElementById('sidebarDate');
  if(sc)sc.textContent=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  if(sd)sd.textContent=now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short',year:'numeric'});
}

function updateCashierBar() {
  document.getElementById('cbName').textContent = State.currentCashier;
  document.getElementById('cbQueue').textContent = 'Antrian: #' + State.queueNumber;
}

// ===== CATEGORY TABS =====
function renderCategoryTabs() {
  const c=document.getElementById('categoryTabs');
  const cats=getCategories();
  c.innerHTML='<button class="cat-tab active" data-category="all">Semua</button>'+
    cats.map(cat=>`<button class="cat-tab" data-category="${cat}">${cat}</button>`).join('');
  c.querySelectorAll('.cat-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      State.selectedCategory=btn.dataset.category;
      c.querySelectorAll('.cat-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderMenuGrid();
    });
  });
}

// ===== MENU GRID (with stock) =====
function renderMenuGrid() {
  const grid=document.getElementById('menuGrid');
  let items=State.menu;
  if(State.selectedCategory!=='all')items=items.filter(m=>m.category===State.selectedCategory);
  const cartIds=State.cart.map(c=>c.id);
  grid.innerHTML=items.map(m=>{
    const outOfStock = m.stock === 0;
    const lowStock = m.stock > 0 && m.stock <= 5;
    let stockHtml = '';
    if (m.stock >= 0) {
      if (outOfStock) stockHtml = '<div class="stock-badge stock-out">HABIS</div>';
      else if (lowStock) stockHtml = `<div class="stock-badge stock-low">Sisa: ${m.stock}</div>`;
      else stockHtml = `<div class="stock-badge" style="color:var(--text3)">Stok: ${m.stock}</div>`;
    }
    return `<div class="menu-card ${cartIds.includes(m.id)?'in-cart':''} ${outOfStock?'out-of-stock':''}" data-id="${m.id}">
      <span class="menu-card-cat">${m.category}</span>
      <span class="menu-card-emoji">${m.emoji||'🍜'}</span>
      <div class="menu-card-name">${m.name}</div>
      <div class="menu-card-price">${formatRp(m.price)}</div>
      ${stockHtml}
    </div>`;
  }).join('');
  grid.querySelectorAll('.menu-card:not(.out-of-stock)').forEach(card=>{
    card.addEventListener('click',()=>addToCart(Number(card.dataset.id)));
  });
}

// ===== CART =====
function addToCart(menuId) {
  const item=State.menu.find(m=>m.id===menuId);
  if(!item)return;
  if(item.stock===0)return;
  const existing=State.cart.find(c=>c.id===menuId);
  if(existing){
    if(item.stock>0 && existing.qty>=item.stock){toast('Stok tidak cukup!','error');return;}
    existing.qty++;
  } else {
    State.cart.push({id:item.id,name:item.name,price:item.price,qty:1,note:''});
  }
  renderCart(); renderMenuGrid();
}
function updateCartQty(menuId,delta){
  const item=State.cart.find(c=>c.id===menuId);
  if(!item)return;
  const menu=State.menu.find(m=>m.id===menuId);
  if(delta>0 && menu && menu.stock>0 && item.qty>=menu.stock){toast('Stok tidak cukup!','error');return;}
  item.qty+=delta;
  if(item.qty<=0)State.cart=State.cart.filter(c=>c.id!==menuId);
  renderCart(); renderMenuGrid();
}
function updateCartNote(menuId,note){
  const item=State.cart.find(c=>c.id===menuId);
  if(item)item.note=note;
}
function clearCart(){State.cart=[];document.getElementById('orderNote').value='';renderCart();renderMenuGrid();}
function renderCart(){
  const el=document.getElementById('cartItems'),totalEl=document.getElementById('cartTotal');
  const badgeEl=document.getElementById('cartBadge'),btnPay=document.getElementById('btnPay');
  const total=getCartTotal(),count=State.cart.reduce((s,c)=>s+c.qty,0);
  badgeEl.textContent=count; totalEl.textContent=formatRp(total); btnPay.disabled=!State.cart.length;
  if(!State.cart.length){
    el.innerHTML='<div class="cart-empty"><span class="cart-empty-icon">🍜</span><p>Belum ada pesanan</p></div>';
    return;
  }
  el.innerHTML=State.cart.map(c=>`
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">${formatRp(c.price)}</div>
        <textarea class="cart-note" rows="1" placeholder="📝 catatan..." onchange="updateCartNote(${c.id},this.value)">${c.note||''}</textarea>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateCartQty(${c.id},-1)">−</button>
        <span class="qty-value">${c.qty}</span>
        <button class="qty-btn" onclick="updateCartQty(${c.id},1)">+</button>
      </div>
      <div class="cart-item-subtotal">${formatRp(c.price*c.qty)}</div>
    </div>`).join('');
}

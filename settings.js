// ===== EMOJI PICKER =====
const CATEGORY_EMOJIS={
  Mie:['🍜','🍲','🍝','🍗','🥢','🍛','🥡','🍚','🥘','🫕'],
  Minuman:['🧊','☕','🥤','🍊','🍋','🧃','🥛','🍵','💧','🫖'],
  Tambahan:['🥟','🍢','🫘','🥠','🍘','🥜','🧆','🍤','🥚','🫔'],
  Lainnya:['📦','🍿','🧁','🍩','🍪','🌮','🌯','🥗','🍰','🧀'],
};
function renderEmojiPicker(cat){
  const p=document.getElementById('emojiPicker');
  const emojis=CATEGORY_EMOJIS[cat]||CATEGORY_EMOJIS['Lainnya'];
  const cur=document.getElementById('menuEmoji').value;
  p.innerHTML=emojis.map(e=>`<span class="emoji-pick${e===cur?' active':''}" data-emoji="${e}">${e}</span>`).join('');
  p.querySelectorAll('.emoji-pick').forEach(b=>b.addEventListener('click',()=>{
    document.getElementById('menuEmoji').value=b.dataset.emoji;
    p.querySelectorAll('.emoji-pick').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  }));
}
function onCategoryChange(){
  const cat=document.getElementById('menuCategory').value;
  const ei=document.getElementById('menuEmoji');
  const ce=CATEGORY_EMOJIS[cat]||CATEGORY_EMOJIS['Lainnya'];
  if(!ei.value||!ce.includes(ei.value))ei.value=ce[0];
  renderEmojiPicker(cat);
}

// ===== SETTINGS RENDER =====
function renderSettings(){
  const s=State.settings;
  document.getElementById('settingShopName').value=s.shopName||'';
  document.getElementById('settingAddress').value=s.address||'';
  document.getElementById('settingPhone').value=s.phone||'';
  document.getElementById('settingFooter').value=s.footer||'';
  const dd=s.defaultDiscount||{type:'percent',value:0};
  document.getElementById('defaultDiscountType').value=dd.type;
  document.getElementById('defaultDiscountValue').value=dd.value;
  renderMenuManageList();
  renderEmojiPicker(document.getElementById('menuCategory').value);
  renderCashierList();
}

function saveShopSettings(){
  State.settings.shopName=document.getElementById('settingShopName').value.trim();
  State.settings.address=document.getElementById('settingAddress').value.trim();
  State.settings.phone=document.getElementById('settingPhone').value.trim();
  State.settings.footer=document.getElementById('settingFooter').value.trim();
  saveSettings();
  document.getElementById('shopNameSidebar').textContent=State.settings.shopName;
  toast('Info toko disimpan! ✅');
}

// ===== MENU CRUD =====
function renderMenuManageList(){
  const list=document.getElementById('menuManageList');
  list.innerHTML=State.menu.map(m=>`
    <div class="manage-item">
      <span class="manage-item-emoji">${m.emoji||'🍜'}</span>
      <div class="manage-item-info">
        <div class="manage-item-name">${m.name}</div>
        <div class="manage-item-detail">${m.category} • ${formatRp(m.price)} • Stok: ${m.stock<0?'∞':m.stock}</div>
      </div>
      <div class="manage-item-actions">
        <button class="btn-icon" onclick="editMenuItem(${m.id})" title="Edit">✏️</button>
        <button class="btn-icon" onclick="deleteMenuItem(${m.id})" title="Hapus">🗑️</button>
      </div>
    </div>`).join('');
}

function saveMenuItem(){
  const name=document.getElementById('menuName').value.trim();
  const price=Number(document.getElementById('menuPrice').value);
  const category=document.getElementById('menuCategory').value;
  const emoji=document.getElementById('menuEmoji').value.trim()||'🍜';
  const stock=Number(document.getElementById('menuStock').value);
  const editId=document.getElementById('editMenuId').value;
  if(!name||!price){toast('Lengkapi nama dan harga!','error');return;}
  if(editId){
    const item=State.menu.find(m=>m.id===Number(editId));
    if(item){item.name=name;item.price=price;item.category=category;item.emoji=emoji;item.stock=isNaN(stock)?-1:stock;}
    cancelEditMenu();toast('Menu diperbarui! ✅');
  } else {
    const newId=State.menu.length?Math.max(...State.menu.map(m=>m.id))+1:1;
    State.menu.push({id:newId,name,price,category,emoji,stock:isNaN(stock)?-1:stock});
    toast('Menu ditambahkan! ✅');
  }
  saveMenu();clearMenuForm();renderMenuManageList();renderCategoryTabs();renderMenuGrid();
}

function editMenuItem(id){
  const item=State.menu.find(m=>m.id===id);if(!item)return;
  document.getElementById('editMenuId').value=id;
  document.getElementById('menuName').value=item.name;
  document.getElementById('menuPrice').value=item.price;
  document.getElementById('menuCategory').value=item.category;
  document.getElementById('menuEmoji').value=item.emoji||'🍜';
  document.getElementById('menuStock').value=item.stock!==undefined?item.stock:-1;
  document.getElementById('btnSaveMenu').textContent='💾 Simpan';
  document.getElementById('btnCancelEdit').classList.remove('hidden');
  document.getElementById('menuName').focus();
  renderEmojiPicker(item.category);
}

function cancelEditMenu(){
  document.getElementById('editMenuId').value='';
  document.getElementById('btnSaveMenu').textContent='➕ Tambah Menu';
  document.getElementById('btnCancelEdit').classList.add('hidden');
  clearMenuForm();
}
function clearMenuForm(){
  document.getElementById('menuName').value='';document.getElementById('menuPrice').value='';
  document.getElementById('menuEmoji').value='';document.getElementById('menuCategory').value='Mie';
  document.getElementById('menuStock').value='-1';
}

function deleteAllMenu(){
  if(!State.menu.length){toast('Menu sudah kosong','info');return;}
  showModal('confirmDeleteMenuModal');
}
function confirmDeleteAllMenu(){
  State.menu=[];saveMenu();clearCart();renderMenuManageList();renderCategoryTabs();renderMenuGrid();
  hideModal('confirmDeleteMenuModal');toast('Semua menu dihapus! 🗑️');
}
function deleteMenuItem(id){
  const item=State.menu.find(m=>m.id===id);if(!item)return;
  if(confirm('Hapus "'+item.name+'"?')){
    State.menu=State.menu.filter(m=>m.id!==id);saveMenu();renderMenuManageList();renderCategoryTabs();renderMenuGrid();toast('Menu dihapus');
  }
}

// ===== PIN =====
function changePin(){
  const cur=document.getElementById('currentPin').value;
  const nw=document.getElementById('newPin').value;
  if(cur!==(State.settings.pin||'1234')){toast('PIN lama salah!','error');return;}
  if(!nw||nw.length<4){toast('PIN baru minimal 4 digit!','error');return;}
  State.settings.pin=nw;saveSettings();
  document.getElementById('currentPin').value='';document.getElementById('newPin').value='';
  toast('PIN berhasil diubah! 🔐');
}

// ===== CASHIER MANAGEMENT =====
function renderCashierList(){
  const el=document.getElementById('cashierList');
  el.innerHTML=State.cashiers.map((c,i)=>`
    <div class="manage-item" style="margin-bottom:4px">
      <span>👤</span><div class="manage-item-info"><div class="manage-item-name">${c}</div></div>
      ${State.cashiers.length>1?`<button class="btn-icon" onclick="removeCashier(${i})">🗑️</button>`:''}
    </div>`).join('');
}
function addCashier(){
  const name=document.getElementById('newCashierName').value.trim();
  if(!name){toast('Masukkan nama kasir!','error');return;}
  if(State.cashiers.includes(name)){toast('Kasir sudah ada!','error');return;}
  State.cashiers.push(name);saveCashiers();renderCashierList();
  document.getElementById('newCashierName').value='';toast('Kasir ditambahkan! 👤');
}
function removeCashier(idx){
  if(State.cashiers.length<=1){toast('Minimal 1 kasir!','error');return;}
  if(confirm('Hapus kasir "'+State.cashiers[idx]+'"?')){
    State.cashiers.splice(idx,1);saveCashiers();renderCashierList();
  }
}

// ===== DISCOUNT SETTINGS =====
function saveDiscountSettings(){
  State.settings.defaultDiscount={
    type:document.getElementById('defaultDiscountType').value,
    value:Number(document.getElementById('defaultDiscountValue').value)||0
  };
  saveSettings();toast('Diskon default disimpan! 🏷️');
}

// ===== EXPORT/IMPORT =====
function exportData(){
  const data={menu:State.menu,orders:State.orders,settings:State.settings,cashiers:State.cashiers,shifts:State.shifts,exportDate:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='kasir-mie-ayam-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  toast('Data di-export! 📤');
}
function importData(file){
  const r=new FileReader();
  r.onload=e=>{
    try{
      const d=JSON.parse(e.target.result);
      if(d.menu){State.menu=d.menu;saveMenu();}
      if(d.orders){State.orders=d.orders;saveOrders();}
      if(d.settings){State.settings=d.settings;saveSettings();}
      if(d.cashiers){State.cashiers=d.cashiers;saveCashiers();}
      renderSettings();renderCategoryTabs();renderMenuGrid();
      toast('Data di-import! 📥');
    }catch(err){toast('File tidak valid!','error');}
  };r.readAsText(file);
}
function resetAllData(){
  if(confirm('RESET semua data ke default?')){
    State.menu=[...DEFAULT_MENU];State.orders=[];State.settings={...DEFAULT_SETTINGS};
    State.cashiers=['Kasir 1'];State.shifts=[];
    saveMenu();saveOrders();saveSettings();saveCashiers();saveShifts();
    renderSettings();renderCategoryTabs();renderMenuGrid();renderCart();
    toast('Data direset! 🔄');
  }
}

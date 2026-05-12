// ===== PAYMENT =====
function openPayment(){
  const total=getCartTotal();
  if(!total)return;
  const q=getNextQueue();
  document.getElementById('payQueueNum').textContent=q;
  document.getElementById('paymentAmount').textContent=formatRp(total);
  document.getElementById('cashAmount').value='';
  document.getElementById('customerName').value='';
  document.getElementById('customerPhone').value='';
  document.getElementById('changeDisplay').classList.add('hidden');
  document.getElementById('cashInputGroup').classList.remove('hidden');
  document.querySelectorAll('.pm-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('.pm-btn[data-method="cash"]').classList.add('active');
  // Set default discount
  const dd=State.settings.defaultDiscount||{type:'percent',value:0};
  document.getElementById('discountType').value=dd.type;
  document.getElementById('discountValue').value=dd.value;
  updateDiscount();
  renderQuickCash(getPayTotal());
  showModal('paymentModal');
}
function getDiscountAmount(){
  const total=getCartTotal();
  const type=document.getElementById('discountType').value;
  const val=Number(document.getElementById('discountValue').value)||0;
  if(type==='percent')return Math.round(total*val/100);
  return Math.min(val,total);
}
function getPayTotal(){return getCartTotal()-getDiscountAmount();}
function updateDiscount(){
  const disc=getDiscountAmount(),final_=getPayTotal();
  const dd=document.getElementById('discountDisplay');
  if(disc>0){dd.classList.remove('hidden');document.getElementById('discountAmount').textContent='-'+formatRp(disc);}
  else dd.classList.add('hidden');
  document.getElementById('finalTotal').textContent=formatRp(final_);
  renderQuickCash(final_);
}
function renderQuickCash(total){
  const c=document.getElementById('quickCash');
  const r=Math.ceil(total/10000)*10000;
  const amounts=[...new Set([r,r+10000,50000,100000])].filter(a=>a>=total).sort((a,b)=>a-b).slice(0,4);
  c.innerHTML=amounts.map(a=>`<button class="quick-cash-btn" data-amount="${a}">${formatRp(a)}</button>`).join('');
  c.querySelectorAll('.quick-cash-btn').forEach(b=>b.addEventListener('click',()=>{
    document.getElementById('cashAmount').value=b.dataset.amount;updateChange();
  }));
}
function updateChange(){
  const total=getPayTotal(),cash=Number(document.getElementById('cashAmount').value)||0;
  const el=document.getElementById('changeDisplay');
  if(cash>=total&&cash>0){el.classList.remove('hidden');document.getElementById('changeAmount').textContent=formatRp(cash-total);}
  else el.classList.add('hidden');
}
function confirmPayment(){
  const subtotal=getCartTotal(),disc=getDiscountAmount(),total=getPayTotal();
  const method=document.querySelector('.pm-btn.active')?.dataset.method||'cash';
  const cash=Number(document.getElementById('cashAmount').value)||0;
  const customer=document.getElementById('customerName').value.trim()||'Tamu';
  const phone=document.getElementById('customerPhone').value.trim();
  const orderNote=document.getElementById('orderNote').value.trim();
  const queueNum=Number(document.getElementById('payQueueNum').textContent);
  if(method==='cash'&&cash<total){toast('Uang tidak cukup!','error');return;}
  // Reduce stock
  State.cart.forEach(c=>{const m=State.menu.find(x=>x.id===c.id);if(m&&m.stock>0)m.stock-=c.qty;});
  saveMenu();
  const order={
    id:generateId(), queueNumber:queueNum,
    items:State.cart.map(c=>({...c,subtotal:c.price*c.qty})),
    subtotal, discount:disc, discountType:document.getElementById('discountType').value,
    discountValue:Number(document.getElementById('discountValue').value)||0,
    total, method,
    cash:method==='cash'?cash:total, change:method==='cash'?cash-total:0,
    customer, phone, note:orderNote,
    cashier:State.currentCashier,
    date:new Date().toISOString()
  };
  State.orders.unshift(order); saveOrders();
  if(State.currentShift)State.currentShift.orders.push(order.id);
  hideModal('paymentModal');
  showReceipt(order);
  clearCart(); updateCashierBar();
  renderMenuGrid();
  toast('Pembayaran berhasil! ✅');
}

// ===== RECEIPT =====
function buildReceiptText(order){
  const s=State.settings,d=new Date(order.date);
  const ds=d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
  const ts=d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  const ml={cash:'Tunai',transfer:'Transfer',qris:'QRIS'}[order.method]||order.method;
  let txt=`${s.shopName}\n${s.address}\n${s.phone}\n${ds} ${ts} | #${order.id}\nAntrian: #${order.queueNumber||'-'}\nKasir: ${order.cashier||'-'}\nPelanggan: ${order.customer}\n${'─'.repeat(28)}\n`;
  order.items.forEach(i=>{
    txt+=`${i.name} x${i.qty}  ${formatRp(i.subtotal)}\n`;
    if(i.note)txt+=`  📝 ${i.note}\n`;
  });
  if(order.note)txt+=`\n📝 Catatan: ${order.note}\n`;
  txt+=`${'─'.repeat(28)}\n`;
  if(order.discount>0)txt+=`Subtotal: ${formatRp(order.subtotal)}\nDiskon: -${formatRp(order.discount)}\n`;
  txt+=`TOTAL: ${formatRp(order.total)}\n${ml}: ${formatRp(order.cash)}\n`;
  if(order.change>0)txt+=`Kembalian: ${formatRp(order.change)}\n`;
  txt+=`${'─'.repeat(28)}\n${s.footer}`;
  return txt;
}
function showReceipt(order){
  const s=State.settings,d=new Date(order.date);
  const ds=d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
  const ts=d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  const ml={cash:'Tunai',transfer:'Transfer',qris:'QRIS'}[order.method]||order.method;
  let h=`<div class="r-header"><div class="r-shop">${s.shopName}</div><div class="r-info">${s.address}<br>${s.phone}</div>
    <div class="r-info">${ds} ${ts} | #${order.id}</div>
    <div class="r-info">Antrian: <strong>#${order.queueNumber||'-'}</strong> | Kasir: ${order.cashier||'-'}</div>
    <div class="r-info">Pelanggan: ${order.customer}</div></div><div class="r-items">`;
  order.items.forEach(i=>{
    h+=`<div class="r-item"><span>${i.name} x${i.qty}</span><span>${formatRp(i.subtotal)}</span></div>`;
    if(i.note)h+=`<div class="r-info" style="font-size:.65rem;margin-left:8px">📝 ${i.note}</div>`;
  });
  if(order.note)h+=`<div class="r-info" style="margin-top:4px">📝 ${order.note}</div>`;
  h+=`</div>`;
  if(order.discount>0)h+=`<div class="r-item"><span>Subtotal</span><span>${formatRp(order.subtotal)}</span></div><div class="r-item" style="color:#e74c3c"><span>Diskon</span><span>-${formatRp(order.discount)}</span></div>`;
  h+=`<div class="r-total"><span>TOTAL</span><span>${formatRp(order.total)}</span></div>`;
  h+=`<div class="r-item"><span>${ml}</span><span>${formatRp(order.cash)}</span></div>`;
  if(order.change>0)h+=`<div class="r-item"><span>Kembalian</span><span>${formatRp(order.change)}</span></div>`;
  h+=`<div class="r-footer">${s.footer}</div>`;
  document.getElementById('receiptContent').innerHTML=h;
  // Store for WA
  document.getElementById('btnSendWA').dataset.orderId=order.id;
  document.getElementById('btnSendWA').dataset.phone=order.phone||'';
  showModal('receiptModal');
}
function sendWhatsApp(){
  const btn=document.getElementById('btnSendWA');
  const order=State.orders.find(o=>o.id===btn.dataset.orderId);
  if(!order)return;
  let phone=btn.dataset.phone||order.phone||'';
  if(!phone){phone=prompt('Masukkan nomor HP (08xxx):');if(!phone)return;}
  phone=phone.replace(/^0/,'62').replace(/[^0-9]/g,'');
  const text=encodeURIComponent(buildReceiptText(order));
  window.open(`https://wa.me/${phone}?text=${text}`,'_blank');
  toast('Membuka WhatsApp... 📱');
}

// ===== HISTORY =====
function renderHistory(){
  const df=document.getElementById('historyDateFilter').value;
  let orders=State.orders;
  if(df)orders=orders.filter(o=>o.date.startsWith(df));
  const ts=orders.reduce((s,o)=>s+o.total,0),to=orders.length;
  document.getElementById('historyStats').innerHTML=`
    <div class="stat-card"><div class="stat-value">${formatRp(ts)}</div><div class="stat-label">Total Penjualan</div></div>
    <div class="stat-card"><div class="stat-value">${to}</div><div class="stat-label">Total Pesanan</div></div>
    <div class="stat-card"><div class="stat-value">${formatRp(to?Math.round(ts/to):0)}</div><div class="stat-label">Rata-rata</div></div>`;
  const list=document.getElementById('historyList');
  if(!orders.length){list.innerHTML='<div class="empty-state"><span class="empty-icon">📋</span><p>Belum ada riwayat</p></div>';return;}
  list.innerHTML=orders.map(o=>{
    const d=new Date(o.date),names=o.items.map(i=>i.name).join(', ');
    return `<div class="history-card" data-id="${o.id}">
      <div class="hc-left"><div class="hc-id">#${o.queueNumber||'?'} — ${o.id}</div>
        <div class="hc-time">${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</div>
        <div class="hc-items">${names.length>40?names.substring(0,40)+'...':names}</div></div>
      <div class="hc-right"><div class="hc-total">${formatRp(o.total)}</div>
        <div class="hc-method">${o.customer} • ${o.cashier||'-'}</div></div></div>`;
  }).join('');
  list.querySelectorAll('.history-card').forEach(c=>c.addEventListener('click',()=>showOrderDetail(c.dataset.id)));
}
function showOrderDetail(id){
  const order=State.orders.find(o=>o.id===id);if(!order)return;
  showReceipt(order);// reuse receipt render
  // Actually show in detail modal
  document.getElementById('orderDetailContent').innerHTML=document.getElementById('receiptContent').innerHTML;
  hideModal('receiptModal');
  document.getElementById('btnDeleteOrder').onclick=()=>{
    if(confirm('Hapus pesanan #'+order.id+'?')){
      State.orders=State.orders.filter(o=>o.id!==id);saveOrders();hideModal('orderDetailModal');renderHistory();toast('Pesanan dihapus');
    }
  };
  showModal('orderDetailModal');
}

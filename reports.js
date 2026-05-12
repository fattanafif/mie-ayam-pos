// ===== REPORTS =====
function filterOrdersByPeriod(){
  const p=document.getElementById('reportPeriod').value;
  const now=new Date(),orders=State.orders;
  if(p==='today')return orders.filter(o=>o.date.startsWith(getTodayStr()));
  if(p==='week'){const w=new Date(now-7*864e5);return orders.filter(o=>new Date(o.date)>=w);}
  if(p==='month'){const m=new Date(now-30*864e5);return orders.filter(o=>new Date(o.date)>=m);}
  return orders;
}
function renderReports(){
  const orders=filterOrdersByPeriod();
  const total=orders.reduce((s,o)=>s+o.total,0),count=orders.length;
  const avg=count?Math.round(total/count):0;
  const itemsSold=orders.reduce((s,o)=>s+o.items.reduce((a,i)=>a+i.qty,0),0);
  document.getElementById('reportCards').innerHTML=`
    <div class="report-card rc-sales"><div class="rc-label">Total Penjualan</div><div class="rc-value">${formatRp(total)}</div><div class="rc-icon">💰</div></div>
    <div class="report-card rc-orders"><div class="rc-label">Jumlah Pesanan</div><div class="rc-value">${count}</div><div class="rc-icon">📦</div></div>
    <div class="report-card rc-avg"><div class="rc-label">Rata-rata</div><div class="rc-value">${formatRp(avg)}</div><div class="rc-icon">📈</div></div>
    <div class="report-card rc-items"><div class="rc-label">Item Terjual</div><div class="rc-value">${itemsSold}</div><div class="rc-icon">🍜</div></div>`;
  renderSalesChart(orders);
  renderPeakChart(orders);
  renderTopItems(orders);
  renderShiftSection();
}

// ===== SALES CHART =====
function renderSalesChart(orders){
  const canvas=document.getElementById('salesChart'),ctx=canvas.getContext('2d');
  const rect=canvas.parentElement.getBoundingClientRect();
  canvas.width=rect.width-40;canvas.height=rect.height-40;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!orders.length){ctx.fillStyle='#6a6a80';ctx.font='14px Inter';ctx.textAlign='center';ctx.fillText('Belum ada data',canvas.width/2,canvas.height/2);return;}
  const daily={};
  orders.forEach(o=>{const d=o.date.slice(0,10);daily[d]=(daily[d]||0)+o.total;});
  const dates=Object.keys(daily).sort().slice(-7),vals=dates.map(d=>daily[d]);
  const max=Math.max(...vals),W=canvas.width,H=canvas.height,pad=40;
  const barW=(W-pad*2)/dates.length*.6,gap=(W-pad*2)/dates.length;
  dates.forEach((d,i)=>{
    const h=max?(vals[i]/max)*(H-pad*2):0;
    const x=pad+i*gap+(gap-barW)/2,y=H-pad-h;
    const g=ctx.createLinearGradient(x,y,x,H-pad);g.addColorStop(0,'#ff6b35');g.addColorStop(1,'#f7a834');
    ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,barW,h,4);ctx.fill();
    ctx.fillStyle='#a0a0b8';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText(d.slice(5),x+barW/2,H-pad+14);
    ctx.fillStyle='#e8e8f0';ctx.font='11px Inter';ctx.fillText(formatRp(vals[i]),x+barW/2,y-6);
  });
}

// ===== PEAK HOURS CHART =====
function renderPeakChart(orders){
  const canvas=document.getElementById('peakChart'),ctx=canvas.getContext('2d');
  const rect=canvas.parentElement.getBoundingClientRect();
  canvas.width=rect.width-40;canvas.height=rect.height-40;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!orders.length){ctx.fillStyle='#6a6a80';ctx.font='14px Inter';ctx.textAlign='center';ctx.fillText('Belum ada data',canvas.width/2,canvas.height/2);return;}
  const hours=Array(24).fill(0);
  orders.forEach(o=>{const h=new Date(o.date).getHours();hours[h]+=o.items.reduce((s,i)=>s+i.qty,0);});
  const active=[];for(let i=6;i<=22;i++)active.push({h:i,v:hours[i]});
  const max=Math.max(...active.map(a=>a.v))||1;
  const W=canvas.width,H=canvas.height,pad=40;
  const barW=(W-pad*2)/active.length*.7,gap=(W-pad*2)/active.length;
  active.forEach((a,i)=>{
    const h=max?(a.v/max)*(H-pad*2):0;
    const x=pad+i*gap+(gap-barW)/2,y=H-pad-h;
    const isTop=a.v===max&&a.v>0;
    const g=ctx.createLinearGradient(x,y,x,H-pad);
    g.addColorStop(0,isTop?'#e74c3c':'#3498db');g.addColorStop(1,isTop?'#ff6b35':'#2ecc71');
    ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,barW,h,3);ctx.fill();
    ctx.fillStyle='#a0a0b8';ctx.font='10px Inter';ctx.textAlign='center';
    ctx.fillText(`${String(a.h).padStart(2,'0')}:00`,x+barW/2,H-pad+14);
    if(a.v>0){ctx.fillStyle='#e8e8f0';ctx.font='10px Inter';ctx.fillText(a.v,x+barW/2,y-4);}
  });
}

// ===== TOP ITEMS =====
function renderTopItems(orders){
  const items={};
  orders.forEach(o=>o.items.forEach(i=>{items[i.name]=(items[i.name]||0)+i.qty;}));
  const sorted=Object.entries(items).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const max=sorted[0]?sorted[0][1]:1;
  document.getElementById('topItemsList').innerHTML=sorted.map((s,i)=>`
    <div class="top-item"><div class="top-rank">#${i+1}</div><div class="top-info"><div class="top-name">${s[0]}</div>
      <div class="top-count">${s[1]} porsi</div><div class="top-bar"><div class="top-bar-fill" style="width:${(s[1]/max)*100}%"></div></div></div></div>`).join('')||'<div class="empty-state">Belum ada data</div>';
}

// ===== SHIFT SECTION =====
function renderShiftSection(){
  const el=document.getElementById('shiftSection');
  if(!State.currentShift){
    el.innerHTML='<button class="btn-primary" id="btnStartShift">▶️ Mulai Shift</button>';
    document.getElementById('btnStartShift').addEventListener('click',()=>{showCashierSelect();});
    return;
  }
  const sh=State.currentShift,shiftOrders=State.orders.filter(o=>sh.orders.includes(o.id));
  const total=shiftOrders.reduce((s,o)=>s+o.total,0);
  const cash=shiftOrders.filter(o=>o.method==='cash').reduce((s,o)=>s+o.total,0);
  const transfer=shiftOrders.filter(o=>o.method!=='cash').reduce((s,o)=>s+o.total,0);
  el.innerHTML=`
    <div style="margin-bottom:12px">
      <div><strong>Kasir:</strong> ${sh.cashier}</div>
      <div><strong>Mulai:</strong> ${new Date(sh.startTime).toLocaleTimeString('id-ID')}</div>
    </div>
    <div class="shift-summary">
      <div class="shift-stat"><div class="shift-stat-val">${formatRp(total)}</div><div class="shift-stat-lbl">Total</div></div>
      <div class="shift-stat"><div class="shift-stat-val">${shiftOrders.length}</div><div class="shift-stat-lbl">Pesanan</div></div>
      <div class="shift-stat"><div class="shift-stat-val">${formatRp(cash)}</div><div class="shift-stat-lbl">Tunai</div></div>
      <div class="shift-stat"><div class="shift-stat-val">${formatRp(transfer)}</div><div class="shift-stat-lbl">Non-Tunai</div></div>
    </div>
    <button class="btn-danger" id="btnCloseShift">🔒 Tutup Shift</button>`;
  document.getElementById('btnCloseShift').addEventListener('click',openCloseShift);
}
function openCloseShift(){
  if(!State.currentShift)return;
  const sh=State.currentShift,shiftOrders=State.orders.filter(o=>sh.orders.includes(o.id));
  const total=shiftOrders.reduce((s,o)=>s+o.total,0);
  const cash=shiftOrders.filter(o=>o.method==='cash').reduce((s,o)=>s+o.total,0);
  const nonCash=shiftOrders.filter(o=>o.method!=='cash').reduce((s,o)=>s+o.total,0);
  document.getElementById('shiftCloseContent').innerHTML=`
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:2rem">💰</div><p><strong>Rekap Shift</strong></p></div>
    <div class="shift-summary">
      <div class="shift-stat"><div class="shift-stat-val">${formatRp(total)}</div><div class="shift-stat-lbl">Total</div></div>
      <div class="shift-stat"><div class="shift-stat-val">${shiftOrders.length}</div><div class="shift-stat-lbl">Pesanan</div></div>
      <div class="shift-stat"><div class="shift-stat-val">${formatRp(cash)}</div><div class="shift-stat-lbl">Tunai</div></div>
      <div class="shift-stat"><div class="shift-stat-val">${formatRp(nonCash)}</div><div class="shift-stat-lbl">Non-Tunai</div></div>
    </div>
    <p style="font-size:.82rem;color:var(--text2);margin-top:8px">Kasir: ${sh.cashier} | Mulai: ${new Date(sh.startTime).toLocaleTimeString('id-ID')}</p>`;
  showModal('shiftCloseModal');
}
function confirmCloseShift(){
  if(!State.currentShift)return;
  State.currentShift.endTime=new Date().toISOString();
  State.shifts.push({...State.currentShift});
  saveShifts();
  State.currentShift=null;
  hideModal('shiftCloseModal');
  updateShiftStatus();
  renderShiftSection();
  toast('Shift ditutup! 💰');
}

// ===== PRINT DAILY REPORT =====
function printDailyReport(){
  const orders=filterOrdersByPeriod();
  const total=orders.reduce((s,o)=>s+o.total,0);
  const cash=orders.filter(o=>o.method==='cash').reduce((s,o)=>s+o.total,0);
  const nonCash=total-cash;
  const s=State.settings,now=new Date();
  let h=`<div style="font-family:monospace;font-size:12px;color:#222;background:#fff;padding:16px">
    <div style="text-align:center;font-weight:700;font-size:14px">${s.shopName}</div>
    <div style="text-align:center;font-size:10px">${s.address}</div>
    <div style="text-align:center;font-size:10px;margin-bottom:8px">LAPORAN HARIAN — ${now.toLocaleDateString('id-ID')}</div>
    <div style="border-top:1px dashed #999;margin:4px 0"></div>
    <div>Total Penjualan: ${formatRp(total)}</div>
    <div>Jumlah Pesanan: ${orders.length}</div>
    <div>Tunai: ${formatRp(cash)}</div>
    <div>Non-Tunai: ${formatRp(nonCash)}</div>
    <div style="border-top:1px dashed #999;margin:8px 0"></div>`;
  orders.forEach(o=>{
    const t=new Date(o.date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    h+=`<div>#${o.queueNumber||'?'} ${t} — ${formatRp(o.total)} (${o.method})</div>`;
  });
  h+=`<div style="border-top:1px dashed #999;margin:8px 0;text-align:center;font-size:10px">Dicetak: ${now.toLocaleString('id-ID')}</div></div>`;
  document.getElementById('printReport').innerHTML=h;
  document.getElementById('printReport').style.display='block';
  window.print();
  setTimeout(()=>{document.getElementById('printReport').style.display='none';},1000);
}

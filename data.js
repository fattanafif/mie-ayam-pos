// ===== DATA & STATE =====
const DEFAULT_MENU = [
  {id:1,name:'Mie Ayam Biasa',category:'Mie',price:15000,emoji:'🍜',stock:-1},
  {id:2,name:'Mie Ayam Spesial',category:'Mie',price:20000,emoji:'🍜',stock:-1},
  {id:3,name:'Mie Ayam Jumbo',category:'Mie',price:25000,emoji:'🍲',stock:-1},
  {id:4,name:'Mie Ayam Bakso',category:'Mie',price:22000,emoji:'🍲',stock:-1},
  {id:5,name:'Mie Ayam Ceker',category:'Mie',price:20000,emoji:'🍗',stock:-1},
  {id:6,name:'Mie Yamin Biasa',category:'Mie',price:15000,emoji:'🍝',stock:-1},
  {id:7,name:'Mie Yamin Spesial',category:'Mie',price:20000,emoji:'🍝',stock:-1},
  {id:8,name:'Pangsit Goreng',category:'Tambahan',price:8000,emoji:'🥟',stock:-1},
  {id:9,name:'Bakso Goreng',category:'Tambahan',price:10000,emoji:'🍢',stock:-1},
  {id:10,name:'Tahu Goreng',category:'Tambahan',price:5000,emoji:'🫘',stock:-1},
  {id:11,name:'Es Teh Manis',category:'Minuman',price:5000,emoji:'🧊',stock:-1},
  {id:12,name:'Es Jeruk',category:'Minuman',price:7000,emoji:'🍊',stock:-1},
  {id:13,name:'Teh Hangat',category:'Minuman',price:4000,emoji:'☕',stock:-1},
  {id:14,name:'Kopi',category:'Minuman',price:5000,emoji:'☕',stock:-1},
  {id:15,name:'Air Mineral',category:'Minuman',price:3000,emoji:'💧',stock:-1},
];
const DEFAULT_SETTINGS = {
  shopName:'Warung Mie Ayam',address:'Jl. Contoh No. 123',
  phone:'0812-3456-7890',footer:'Terima kasih sudah mampir! 🙏',
  pin:'1234',theme:'dark',defaultDiscount:{type:'percent',value:0}
};
const State = {
  menu:[],orders:[],settings:{},cart:[],
  cashiers:['Kasir 1'],currentCashier:'Kasir 1',
  shifts:[],currentShift:null,
  queueNumber:0,queueDate:'',
  currentPage:'pos',selectedCategory:'all',editMenuId:null,
  pinVerified:false
};

async function loadData() {
  try {
    const r = await fetch('/api/data');
    if (r.ok) {
      const d = await r.json();
      State.menu = d.menu?.length ? d.menu : [...DEFAULT_MENU];
      State.orders = d.orders || [];
      State.settings = d.settings?.shopName ? d.settings : {...DEFAULT_SETTINGS};
      State.cashiers = d.cashiers?.length ? d.cashiers : ['Kasir 1'];
      State.shifts = d.shifts || [];
      State.queueDate = d.queueDate || '';
      State.queueNumber = d.queueNumber || 0;
      // Ensure stock field exists
      State.menu.forEach(m => { if (m.stock === undefined) m.stock = -1; });
      if (!State.settings.pin) State.settings.pin = '1234';
      if (!State.settings.theme) State.settings.theme = 'dark';
      if (!State.settings.defaultDiscount) State.settings.defaultDiscount = {type:'percent',value:0};
      return;
    }
  } catch(e) {}
  try {
    State.menu = JSON.parse(localStorage.getItem('ma_menu')) || [...DEFAULT_MENU];
    State.orders = JSON.parse(localStorage.getItem('ma_orders')) || [];
    State.settings = JSON.parse(localStorage.getItem('ma_settings')) || {...DEFAULT_SETTINGS};
  } catch(e) { State.menu=[...DEFAULT_MENU];State.orders=[];State.settings={...DEFAULT_SETTINGS}; }
}

function _sync(endpoint, data) { fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).catch(()=>{}); }
function saveMenu() { localStorage.setItem('ma_menu',JSON.stringify(State.menu)); _sync('/api/menu',State.menu); }
function saveOrders() { localStorage.setItem('ma_orders',JSON.stringify(State.orders)); _sync('/api/orders',State.orders); }
function saveSettings() { localStorage.setItem('ma_settings',JSON.stringify(State.settings)); _sync('/api/settings',State.settings); }
function saveCashiers() { _sync('/api/cashiers',State.cashiers); }
function saveShifts() { _sync('/api/shifts',State.shifts); }
function saveQueue() { _sync('/api/queue',{queueDate:State.queueDate,queueNumber:State.queueNumber}); }

function formatRp(n) { return 'Rp '+Number(n).toLocaleString('id-ID'); }
function generateId() { return Date.now().toString(36).toUpperCase()+Math.random().toString(36).substring(2,5).toUpperCase(); }
function getCartTotal() { return State.cart.reduce((s,i)=>s+i.price*i.qty,0); }
function getCategories() { return [...new Set(State.menu.map(m=>m.category))]; }

function getNextQueue() {
  const today = new Date().toISOString().slice(0,10);
  if (State.queueDate !== today) { State.queueDate = today; State.queueNumber = 0; }
  State.queueNumber++;
  saveQueue();
  return State.queueNumber;
}

function getTodayStr() { return new Date().toISOString().slice(0,10); }

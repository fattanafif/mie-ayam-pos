const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4200;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json({limit:'5mb'}));
app.use(express.static(__dirname));

function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const d = {
      settings: {
        shopName:'Warung Mie Ayam', address:'Jl. Contoh No. 123',
        phone:'0812-3456-7890', footer:'Terima kasih sudah mampir! 🙏',
        pin:'1234', theme:'dark',
        defaultDiscount: { type:'percent', value:0 }
      },
      menu: [], orders: [], cashiers: ['Kasir 1'],
      shifts: [], queueDate: '', queueNumber: 0
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2));
  }
}

function readDB() {
  try {
    const d = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!d.cashiers) d.cashiers = ['Kasir 1'];
    if (!d.shifts) d.shifts = [];
    if (!d.settings.pin) d.settings.pin = '1234';
    if (!d.settings.theme) d.settings.theme = 'dark';
    if (!d.settings.defaultDiscount) d.settings.defaultDiscount = {type:'percent',value:0};
    return d;
  } catch(e) { return {settings:{},menu:[],orders:[],cashiers:['Kasir 1'],shifts:[],queueDate:'',queueNumber:0}; }
}

function writeDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

app.get('/api/data', (req,res) => res.json(readDB()));

app.post('/api/data', (req,res) => {
  try {
    const d = readDB();
    for (const k of ['settings','menu','orders','cashiers','shifts','queueDate','queueNumber']) {
      if (req.body[k] !== undefined) d[k] = req.body[k];
    }
    writeDB(d); res.json({success:true});
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

app.post('/api/settings', (req,res) => { const d=readDB(); d.settings=req.body; writeDB(d); res.json({success:true}); });
app.post('/api/menu', (req,res) => { const d=readDB(); d.menu=req.body; writeDB(d); res.json({success:true}); });
app.post('/api/orders', (req,res) => { const d=readDB(); d.orders=req.body; writeDB(d); res.json({success:true}); });
app.post('/api/cashiers', (req,res) => { const d=readDB(); d.cashiers=req.body; writeDB(d); res.json({success:true}); });
app.post('/api/shifts', (req,res) => { const d=readDB(); d.shifts=req.body; writeDB(d); res.json({success:true}); });
app.post('/api/queue', (req,res) => { const d=readDB(); d.queueDate=req.body.queueDate; d.queueNumber=req.body.queueNumber; writeDB(d); res.json({success:true}); });

app.post('/api/verify-pin', (req,res) => {
  const d = readDB();
  res.json({ success: req.body.pin === (d.settings.pin||'1234') });
});

initDB();
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🍜 KASIR MIE AYAM — POS System');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💾 ${DB_FILE}\n`);
});

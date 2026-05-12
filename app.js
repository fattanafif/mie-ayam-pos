// ===== MAIN APP =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  applyTheme();
  document.getElementById('shopNameSidebar').textContent = State.settings.shopName;

  // Navigation
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(btn =>
    btn.addEventListener('click', () => switchPage(btn.dataset.page))
  );

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Cart
  document.getElementById('cartToggle').addEventListener('click', () =>
    document.getElementById('posCart').classList.toggle('cart-open')
  );
  document.getElementById('btnClearCart').addEventListener('click', () => {
    if (State.cart.length && confirm('Kosongkan pesanan?')) clearCart();
  });

  // Payment
  document.getElementById('btnPay').addEventListener('click', openPayment);
  document.getElementById('btnClosePayment').addEventListener('click', () => hideModal('paymentModal'));
  document.getElementById('cashAmount').addEventListener('input', updateChange);
  document.getElementById('discountType').addEventListener('change', updateDiscount);
  document.getElementById('discountValue').addEventListener('input', updateDiscount);
  document.querySelectorAll('.pm-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pm-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const g = document.getElementById('cashInputGroup');
      btn.dataset.method === 'cash' ? g.classList.remove('hidden') : g.classList.add('hidden');
    })
  );
  document.getElementById('btnConfirmPayment').addEventListener('click', confirmPayment);

  // Receipt
  document.getElementById('btnCloseReceipt').addEventListener('click', () => hideModal('receiptModal'));
  document.getElementById('btnNewOrder').addEventListener('click', () => hideModal('receiptModal'));
  document.getElementById('btnPrintReceipt').addEventListener('click', () => window.print());
  document.getElementById('btnSendWA').addEventListener('click', sendWhatsApp);

  // Order Detail
  document.getElementById('btnCloseOrderDetail').addEventListener('click', () => hideModal('orderDetailModal'));
  document.getElementById('btnCloseDetail2').addEventListener('click', () => hideModal('orderDetailModal'));

  // History
  document.getElementById('historyDateFilter').addEventListener('change', renderHistory);
  document.getElementById('btnClearHistory').addEventListener('click', () => {
    if (State.orders.length && confirm('Hapus semua riwayat?')) {
      State.orders = []; saveOrders(); renderHistory(); toast('Riwayat dihapus');
    }
  });

  // Reports
  document.getElementById('reportPeriod').addEventListener('change', renderReports);
  document.getElementById('btnPrintDailyReport').addEventListener('click', printDailyReport);

  // Shift
  document.getElementById('btnConfirmCloseShift').addEventListener('click', confirmCloseShift);
  document.getElementById('btnCancelCloseShift').addEventListener('click', () => hideModal('shiftCloseModal'));
  document.getElementById('btnCloseShiftModal').addEventListener('click', () => hideModal('shiftCloseModal'));

  // Settings
  document.getElementById('btnSaveShop').addEventListener('click', saveShopSettings);
  document.getElementById('menuCategory').addEventListener('change', onCategoryChange);
  document.getElementById('btnSaveMenu').addEventListener('click', saveMenuItem);
  document.getElementById('btnCancelEdit').addEventListener('click', cancelEditMenu);
  document.getElementById('btnDeleteAllMenu').addEventListener('click', deleteAllMenu);
  document.getElementById('btnConfirmDeleteAll').addEventListener('click', confirmDeleteAllMenu);
  document.getElementById('btnCancelDeleteAll').addEventListener('click', () => hideModal('confirmDeleteMenuModal'));
  document.getElementById('btnCloseConfirmDelete').addEventListener('click', () => hideModal('confirmDeleteMenuModal'));
  document.getElementById('btnChangePin').addEventListener('click', changePin);
  document.getElementById('btnAddCashier').addEventListener('click', addCashier);
  document.getElementById('btnSaveDiscount').addEventListener('click', saveDiscountSettings);
  document.getElementById('btnExportData').addEventListener('click', exportData);
  document.getElementById('btnImportData').addEventListener('click', () => document.getElementById('importFileInput').click());
  document.getElementById('importFileInput').addEventListener('change', e => { if(e.target.files[0])importData(e.target.files[0]);e.target.value=''; });
  document.getElementById('btnResetData').addEventListener('click', resetAllData);

  // PIN modal
  document.getElementById('btnVerifyPin').addEventListener('click', verifyPin);
  document.getElementById('btnCancelPin').addEventListener('click', () => { hideModal('pinModal'); switchPage('pos'); });
  // PIN digit auto-focus + auto-submit on last digit
  document.querySelectorAll('.pin-digit').forEach((d, i, all) => {
    d.addEventListener('input', () => {
      if (d.value && i < all.length - 1) all[i + 1].focus();
      if (d.value && i === all.length - 1) setTimeout(verifyPin, 100);
    });
    d.addEventListener('keydown', e => { if (e.key === 'Backspace' && !d.value && i > 0) all[i - 1].focus(); });
  });

  // Close modals on overlay
  document.querySelectorAll('.modal-overlay').forEach(o =>
    o.addEventListener('click', e => { if (e.target === o && o.id !== 'cashierModal') o.classList.remove('active'); })
  );

  // Initial render
  renderCategoryTabs();
  renderMenuGrid();
  renderCart();
  updateClock();
  setInterval(updateClock, 30000);
  updateCashierBar();
  document.getElementById('historyDateFilter').value = getTodayStr();

  // Show cashier select on first load
  showCashierSelect();
});

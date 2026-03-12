// borrowing-system.js - Combined JS for borrow, return, report, dashboard sync to admin

// localStorage keys
const BORROWED_ITEMS_KEY = 'borrowedItems';
const RETURNED_ITEMS_KEY = 'returnedItems';
const REPORTED_ITEMS_KEY = 'reportedItems';
const ITEMS_KEY = 'items';

// Initialize sample items if none exist

function initItems() {
  if (!localStorage.getItem(ITEMS_KEY)) {
    const realisticItems = [
      'Projector', 'Extension Cord', 'Whiteboard Marker Set', 'Laptop', 'Microphone', 'Pointer', 'Speaker System',
      'USB Cable', 'HDMI Cable', 'Power Strip', 'Dry Erase Board', 'Laser Pointer', 'Conference Microphone',
      'Document Camera', 'Webcam', 'Tablet Stand', 'Wireless Presenter', 'Projector Screen', 'Audio Mixer',
      'Digital Camera', 'Tripod', 'Green Screen', 'Lighting Kit', 'Microphone Stand', 'Headphones', 'Earphones',
      'Wireless Mouse', 'Keyboard', 'Monitor', 'Printer Cable', 'Scanner', 'Overhead Projector', 'Slide Projector',
      'Flip Chart', 'Magnetic Board', 'Cork Board', 'Easel Pad', 'Marker Holder', 'Eraser', 'Cleaning Spray',
      'Battery Charger', 'SD Card Reader', 'Flash Drive', 'External Hard Drive', 'Power Bank', 'Adapter',
      'VGA Cable', 'Ethernet Cable', 'WiFi Router', 'Network Switch', 'Modem', 'Backup Battery'
    ];
    
    const items = realisticItems.map((name, i) => ({
      id: i + 1,
      name,
      status: 'available'
    })).concat(Array.from({length: Math.max(0, 50 - realisticItems.length)}, (_, i) => ({
      id: realisticItems.length + i + 1,
      name: `Equipment ${i + 1}`,
      status: 'available'
    })));
    
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }
}


// Get/Set helpers
function get(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Borrow
function submitBorrow(itemName, borrower) {
  initItems();
  const items = JSON.parse(localStorage.getItem(ITEMS_KEY));
  const borrowedItems = get(BORROWED_ITEMS_KEY);
  
  // Check if item exists and available
  const item = items.find(i => i.name === itemName && i.status === 'available');
  if (!item) return false;
  
  // Add to borrowed
  borrowedItems.push({
    item: itemName,
    borrower,
    date: new Date().toLocaleString(),
    id: item.id
  });
  
  // Update item status
  item.status = 'borrowed';
  
  set(BORROWED_ITEMS_KEY, borrowedItems);
  set(ITEMS_KEY, items);
  return true;
}

// Return
function submitReturn(itemName, returner) {
  const borrowedItems = get(BORROWED_ITEMS_KEY);
  const returnedItems = get(RETURNED_ITEMS_KEY);
  const items = JSON.parse(localStorage.getItem(ITEMS_KEY));
  
  const borrowedRecord = borrowedItems.find(b => b.item === itemName);
  if (!borrowedRecord) return false;
  
  // Add to returned
  returnedItems.push({
    item: itemName,
    returner,
    date: new Date().toLocaleString(),
    fromBorrowed: borrowedRecord
  });
  
  // Remove from borrowed, mark item available
  borrowedItems.splice(borrowedItems.indexOf(borrowedRecord), 1);
  const item = items.find(i => i.name === itemName);
  if (item) item.status = 'available';
  
  set(RETURNED_ITEMS_KEY, returnedItems);
  set(BORROWED_ITEMS_KEY, borrowedItems);
  set(ITEMS_KEY, items);
  return true;
}

// Report
function submitReport(itemName, issue) {
  initItems();
  const items = JSON.parse(localStorage.getItem(ITEMS_KEY));
  const reportedItems = get(REPORTED_ITEMS_KEY);
  
  const item = items.find(i => i.name === itemName);
  if (!item) return false;
  
  item.status = 'reported';
  
  reportedItems.push({
    item: itemName,
    issue,
    date: new Date().toLocaleString(),
    id: item.id
  });
  
  set(REPORTED_ITEMS_KEY, reportedItems);
  set(ITEMS_KEY, items);
  return true;
}

// Admin dashboard population functions
function populateAdminDashboard() {
  const items = JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]');
  const borrowedItems = get(BORROWED_ITEMS_KEY);
  const returnedItems = get(RETURNED_ITEMS_KEY);
  const reportedItems = get(REPORTED_ITEMS_KEY);
  
  // Stats
  const available = items.filter(i => i.status === 'available').length;
  const borrowed = borrowedItems.length;
  const returned = returnedItems.length;
  const reported = reportedItems.length;
  
  // Update DOM if elements exist
  const availableEl = document.getElementById('availableCount');
  if (availableEl) availableEl.textContent = available;
  
  const borrowedEl = document.getElementById('borrowedCount');
  if (borrowedEl) borrowedEl.textContent = borrowed;
  
  const returnedEl = document.getElementById('returnedCount');
  if (returnedEl) returnedEl.textContent = returned;
  
  const reportedEl = document.getElementById('reportedCount');
  if (reportedEl) reportedEl.textContent = reported;
  
  // Borrowed logs
  const borrowedList = document.getElementById('borrowedItemsList') || document.getElementById('borrowedItems');
  if (borrowedList) {

  borrowedList.innerHTML = borrowedItems.map(record => 
    `<li><strong>${record.item}</strong> borrowed by <strong>${record.borrower}</strong> on <em>${record.date}</em></li>`
  ).join('') || '<li>No borrowed items</li>';

  }
  
  // Returned logs
  const returnedList = document.getElementById('returnedItemsList') || document.getElementById('returnedItems');
  if (returnedList) {
    returnedList.innerHTML = returnedItems.map(record => 
      `<li>${record.item} returned by ${record.returner} on ${record.date}</li>`
    ).join('') || '<li>No returned items</li>';
  }
  
  // Reported logs
  const reportedList = document.getElementById('reportedItemsList') || document.getElementById('reportedItems');
  if (reportedList) {
    reportedList.innerHTML = reportedItems.map(record => 
      `<li>${record.item}: ${record.issue} (${record.date})</li>`
    ).join('') || '<li>No reported items</li>';
  }
}

// Page-specific init
document.addEventListener('DOMContentLoaded', () => {
  initItems();
  
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userInfo = document.querySelector('.user-info');
  if (userInfo && user.name) {
    userInfo.textContent = `Welcome, ${user.name}`;
  }
  
  // Page-specific

  if (document.getElementById('borrow-form')) {
    // Populate dropdown with available items
    const select = document.getElementById('item');
    if (select) {
      initItems();
      const items = JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]');
      const availableItems = items.filter(i => i.status === 'available');
      select.innerHTML = '<option value="">Select Item</option>' + 
        availableItems.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
    }
    
    document.getElementById('borrow-form').addEventListener('submit', e => {
      e.preventDefault();
      const item = document.getElementById('item').value;
      const borrower = document.getElementById('borrower').value.trim();
      if (!borrower || borrower.length < 2) {
        alert('Borrower name must be at least 2 characters.');
        return;
      }
      if (submitBorrow(item, borrower)) {
        alert('Item borrowed successfully!');
        e.target.reset();
        // Repopulate dropdown
        const newSelect = document.getElementById('item');
        if (newSelect) {
          const items = JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]');
          const availableItems = items.filter(i => i.status === 'available');
          newSelect.innerHTML = '<option value="">Select Item</option>' + 
            availableItems.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
        }
        populateAdminDashboard();
      } else {
        alert('Item not available or not found.');
      }
    });
  }

  

  if (document.getElementById('return-form')) {
    // Populate dropdown with borrowed items
    const select = document.getElementById('return-item');
    if (select) {
      const borrowedItems = get(BORROWED_ITEMS_KEY);
      select.innerHTML = '<option value="">Select Borrowed Item</option>' + 
        borrowedItems.map(item => `<option value="${item.item}">${item.item} (by ${item.borrower})</option>`).join('');
    }
    
    document.getElementById('return-form').addEventListener('submit', e => {
      e.preventDefault();
      const item = document.getElementById('return-item').value;
      const returner = document.getElementById('returner').value.trim();
      if (!returner || returner.length < 2) {
        alert('Returner name must be at least 2 characters.');
        return;
      }
      if (submitReturn(item, returner)) {
        alert('Item returned successfully!');
        e.target.reset();
        // Repopulate dropdown
        const newSelect = document.getElementById('return-item');
        if (newSelect) {
          const borrowedItems = get(BORROWED_ITEMS_KEY);
          newSelect.innerHTML = '<option value="">Select Borrowed Item</option>' + 
            borrowedItems.map(item => `<option value="${item.item}">${item.item} (by ${item.borrower})</option>`).join('');
        }
        populateAdminDashboard();
      } else {
        alert('Item not borrowed or not found.');
      }
    });
  }

  

  if (document.getElementById('report-form')) {
    // Populate dropdown with borrowed items
    const select = document.getElementById('report-item');
    if (select) {
      const borrowedItems = get(BORROWED_ITEMS_KEY);
      select.innerHTML = '<option value="">Select borrowed item to report</option>' + 
        borrowedItems.map(item => `<option value="${item.item}">${item.item} (by ${item.borrower})</option>`).join('');
    }
    
    document.getElementById('report-form').addEventListener('submit', e => {
      e.preventDefault();
      const item = document.getElementById('report-item').value;
      const issue = document.getElementById('issue').value;
      if (!issue || issue.trim().length < 10) {
        alert('Issue description must be at least 10 characters.');
        return;
      }
      if (submitReport(item, issue)) {
        alert('Issue reported successfully!');
        e.target.reset();
        // Repopulate dropdown
        const newSelect = document.getElementById('report-item');
        if (newSelect) {
          const borrowedItems = get(BORROWED_ITEMS_KEY);
          newSelect.innerHTML = '<option value="">Select borrowed item to report</option>' + 
            borrowedItems.map(item => `<option value="${item.item}">${item.item} (by ${item.borrower})</option>`).join('');
        }
        populateAdminDashboard();
      } else {
        alert('Item not borrowed.');
      }
    });
  }

  
  // Admin dashboard
  if (document.getElementById('availableCount') || document.querySelector('[id*=\"borrowed\"]') || document.querySelector('[id*=\"reported\"]')) {
    populateAdminDashboard();
  }
  
  // User dashboard - show stats
  if (document.getElementById('stats-section')) {
    populateAdminDashboard();
  }
});


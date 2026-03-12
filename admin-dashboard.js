// admin-dashboard.js

function loadDashboardStats() {
    const items = JSON.parse(localStorage.getItem("items")) || [];
    const borrowedItems = JSON.parse(localStorage.getItem("borrowedItems")) || [];
  
    const available = items.filter(i => i.status === "available").length;
    const borrowed = items.filter(i => i.status === "borrowed").length;
    const returned = items.filter(i => i.status === "returned").length;
    const notReturned = items.filter(i => i.status === "not-returned").length;
  
    document.getElementById("availableCount").textContent = available;
    document.getElementById("borrowedCount").textContent = borrowed;
    document.getElementById("returnedCount").textContent = returned;
    document.getElementById("notReturnedCount").textContent = notReturned;
  
    populateBorrowLogs(borrowedItems);
    populateNotReturnedLogs(items);
  }
  
  function populateBorrowLogs(borrowedItems) {
    const list = document.getElementById("borrowedItems");
    if (!list) return;
  
    list.innerHTML = "";
    if (borrowedItems.length === 0) {
      list.innerHTML = "<li>No borrowed items yet.</li>";
      return;
    }
  
    borrowedItems.forEach((record, index) => {
      const li = document.createElement("li");
      li.textContent = `#${index + 1} - ${record.item} borrowed by ${record.borrower} on ${record.date}`;
  
      // Add return button
      const btn = document.createElement("button");
      btn.textContent = "Return";
      btn.onclick = () => returnItem(record.item);
      li.appendChild(btn);
  
      list.appendChild(li);
    });
  }
  
  function populateNotReturnedLogs(items) {
    const list = document.getElementById("notReturnedItems");
    if (!list) return;
  
    list.innerHTML = "";
    const notReturnedItems = items.filter(i => i.status === "not-returned");
    if (notReturnedItems.length === 0) {
      list.innerHTML = "<li>No items marked as not returned.</li>";
      return;
    }
  
    notReturnedItems.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `#${index + 1} - ${item.name} (Not Returned)`;
  
      // Optionally allow marking as returned
      const btn = document.createElement("button");
      btn.textContent = "Mark Returned";
      btn.onclick = () => returnItem(item.name);
      li.appendChild(btn);
  
      list.appendChild(li);
    });
  }
  
  function showSection(section) {
    document.getElementById("stats-section").style.display = section === "stats" ? "block" : "none";
    document.getElementById("borrow-list").style.display = section === "borrowed" ? "block" : "none";
    document.getElementById("returned-list").style.display = section === "returned" ? "block" : "none";
    document.getElementById("notReturned-list").style.display = section === "notReturned" ? "block" : "none";
  }
  
  document.addEventListener("DOMContentLoaded", loadDashboardStats);
  
  let selectedItem = "";
  
  // Select item
  function selectItem(item) {
    selectedItem = item;
    alert("Selected Item: " + item);
  }
  
  // Submit borrow
  function submitBorrow() {
    const borrower = document.getElementById("borrower-input").value.trim();
  
    if (!selectedItem) {
      alert("Please select an item to borrow.");
      return;
    }
    if (!borrower) {
      alert("Please enter borrower name.");
      return;
    }
  
    const date = new Date().toLocaleString();
    const record = { item: selectedItem, borrower: borrower, date: date };
  
    // Save to borrowedItems
    let borrowedItems = JSON.parse(localStorage.getItem("borrowedItems")) || [];
    borrowedItems.push(record);
    localStorage.setItem("borrowedItems", JSON.stringify(borrowedItems));
  
    // Update item status in items array → mark as not-returned
    let items = JSON.parse(localStorage.getItem("items")) || [];
    items = items.map(i => {
      if (i.name === selectedItem && i.status === "available") {
        return { ...i, status: "not-returned" };
      }
      return i;
    });
    localStorage.setItem("items", JSON.stringify(items));
  
    displayBorrowedItems();
  
    document.getElementById("borrower-input").value = "";
    selectedItem = "";
  }
  
  // Return item
  function returnItem(itemName) {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    items = items.map(i => {
      if (i.name === itemName && (i.status === "borrowed" || i.status === "not-returned")) {
        return { ...i, status: "returned" };
      }
      return i;
    });
    localStorage.setItem("items", JSON.stringify(items));
  
    let borrowedItems = JSON.parse(localStorage.getItem("borrowedItems")) || [];
    borrowedItems = borrowedItems.filter(record => record.item !== itemName);
    localStorage.setItem("borrowedItems", JSON.stringify(borrowedItems));
  
    alert(itemName + " has been returned.");
  
    loadDashboardStats();
    displayBorrowedItems();
  }
  
  // Show borrowed items on borrow.html
  function displayBorrowedItems() {
    const itemsList = document.getElementById("items");
    if (itemsList) {
      itemsList.innerHTML = "";
      const borrowedItems = JSON.parse(localStorage.getItem("borrowedItems")) || [];
      borrowedItems.forEach((record, index) => {
        const li = document.createElement("li");
        li.textContent = `#${index + 1} - ${record.item} borrowed by ${record.borrower} on ${record.date}`;
        itemsList.appendChild(li);
      });
    }
  }
  
  // Show borrowed items on receipt.html
  window.addEventListener("DOMContentLoaded", () => {
    const receiptList = document.getElementById("receipt-list");
    if (receiptList) {
      const borrowedItems = JSON.parse(localStorage.getItem("borrowedItems")) || [];
      if (borrowedItems.length === 0) {
        receiptList.innerHTML = "<p>No items borrowed yet.</p>";
        return;
      }
      borrowedItems.forEach((record, index) => {
        const li = document.createElement("li");
        li.textContent = `#${index + 1} - ${record.item} borrowed by ${record.borrower} on ${record.date}`;
        receiptList.appendChild(li);
      });
    }
  
    displayBorrowedItems();
  });
  
  // Clear records
  function clearRecords() {
    localStorage.removeItem("borrowedItems");
    localStorage.removeItem("items");
    alert("Borrow records cleared.");
    location.reload();
  }
  
// signup-login.js

// Store accounts in localStorage
async function saveAccount(fullName, email, password) {
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const accountsKey = "accounts";
    
    // Sync from Firestore first
    await loadFromFirestore('accounts', accountsKey);
    
    // Reload accounts from localStorage after sync
    let accounts = JSON.parse(localStorage.getItem(accountsKey) || '[]');

    
    // Check if email already exists
    const existing = accounts.find(acc => acc.email === email);
    if (existing) {
      alert("Account with this email already exists!");
      return false;
    }
  
    accounts.push({ fullName, email, password, role: "user" }); // default role
localStorage.setItem(accountsKey, JSON.stringify(accounts));
    // Sync to Firestore
    await syncToFirestore('accounts', accounts);
    alert("Account created successfully!");
    return true;
  }

  
  // Validate sign-up form
  function validateSignupForm(event) {
    event.preventDefault();
  
    const fullName = document.querySelector('input[placeholder="Full Name"]').value.trim();
    const email = document.querySelector('input[placeholder="Email"]').value.trim();
    const password = document.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Confirm Password"]').value;
    const terms = document.querySelector('input[type="checkbox"]').checked;
  
    if (!terms) {
      alert("You must agree to the Terms & Conditions.");
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    if (saveAccount(fullName, email, password)) {
      window.location.href = "index.html"; // redirect to login
    }
  }
  
  // Validate login form
  function validateLoginForm(event) {
    event.preventDefault();
  
    const email = document.querySelector('.login-box input[placeholder="Email"]').value.trim();
    const password = document.querySelector('.login-box input[placeholder="Password"]').value;
  
    const accountsKey = "accounts";
    await loadFromFirestore('accounts', accountsKey);
    const accounts = JSON.parse(localStorage.getItem(accountsKey) || '[]');

    // Hardcoded admin account (you can also store it in localStorage)
    const adminEmail = "admin@cc";

    const adminPassword = "testadmin";
  
    if (email === adminEmail && password === adminPassword) {
      alert("Admin login successful! Welcome Administrator");
      window.location.href = "admin-dashboard.html"; // redirect to admin dashboard
      return;
    }
  
    const account = accounts.find(acc => acc.email === email && acc.password === password);
  
    if (account) {
      alert("Login successful! Welcome " + account.fullName);
      window.location.href = "dashboard.html"; // redirect to user dashboard
    } else {
      alert("Invalid email or password.");
    }
  }
  
  // Attach event listeners
  document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector('.signup-box form');
    const loginForm = document.querySelector('.login-box form');
  
    if (signupForm) {
      signupForm.addEventListener("submit", validateSignupForm);
    }
    if (loginForm) {
      loginForm.addEventListener("submit", validateLoginForm);
    }
  });
  
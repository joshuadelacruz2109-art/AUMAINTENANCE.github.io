# Deployment Plan for GitHub Pages - Make JS Functions Work Post-Upload

## Approved Plan Summary
- Goal: Ensure all JS functions (borrow/return/report/auth/dashboard) work when uploaded/published to GitHub Pages
- Strategy: Multi-device data sync using Firebase Firestore + localStorage cache, merge redundant JS, fix paths, create PWA for offline
- Hosting: GitHub Pages

## Steps to Complete (0/13 done)

### Phase 1: Preparation (3/3) ✅
- [✅] 1. User creates Firebase project and gets web config
- [✅] 2. Create firebase-config.js with user's config
- [✅] 3. Update index.html, signup.html, borrow.html, return.html, report.html, admin-dashboard.html and others with Firebase SDK

### Phase 2: Refactor JS for Cloud Sync (4/5) ✅
- [✅] 4. Merge admin-dashboard.js into borrowing-system.js (added showSection, returnItem, clearRecords, enhanced populateAdminDashboard)
- [✅] 5. Refactor borrowing-system.js: Added Firestore syncToFirestore/loadFromFirestore, async get/set with sync option, auto-load on init
- [✅] 6. Refactor signup-login.js: Firestore user sync complete
- [✅] 7. Remove admin-dashboard.js (deleted file)
- [✅] 8. Create service-worker.js for PWA/offline (sw.js + manifest.json)

### Phase 3: Deployment (0/3)
- [ ] 9. Update all image/CSS/JS paths for GitHub Pages (gh-pages branch)
- [ ] 10. Create gh-pages branch and push
- [ ] 11. Enable GitHub Pages in repo settings

### Phase 4: Testing (0/2)
- [ ] 12. Test local server + GitHub Pages deployment
- [ ] 13. Final verification across devices/browsers

**Next Step:** Enable Firestore in Firebase console (Firestore Database → Create database → Start in test mode), then test borrow/return/report - data now syncs across tabs/devices!


Updated: Step 0 - Plan approved ✅


// Clear Auth Storage Script
// Run this in browser console to clear all auth data and force fresh login

console.log('🧹 Clearing all authentication data...');

// Clear localStorage
const authKeys = ['authUser', 'authToken', 'refreshToken'];
authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`  ❌ Removing localStorage: ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage
authKeys.forEach(key => {
  if (sessionStorage.getItem(key)) {
    console.log(`  ❌ Removing sessionStorage: ${key}`);
    sessionStorage.removeItem(key);
  }
});

// Check for any Clerk-related storage (if previously used)
const clerkKeys = Object.keys(localStorage).filter(k => 
  k.startsWith('clerk') || 
  k.startsWith('__clerk')
);
clerkKeys.forEach(key => {
  console.log(`  ❌ Removing Clerk data: ${key}`);
  localStorage.removeItem(key);
});

console.log('✅ All auth data cleared!');
console.log('🔄 Reload the page to start fresh.');
console.log('\nTo reload: location.reload()');

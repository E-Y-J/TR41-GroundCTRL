// One-time cleanup script to remove bad (0,0) panel positions from localStorage
// Run this in the browser console: 
// fetch('/clear-bad-positions.js').then(r => r.text()).then(eval)

console.log('🧹 Cleaning up bad panel positions...');

let cleared = 0;

Object.keys(localStorage).forEach(key => {
  if (key.startsWith('panel-position-')) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && data.x === 0 && data.y === 0) {
        console.log(`❌ Removing bad (0,0) position for: ${key}`);
        localStorage.removeItem(key);
        cleared++;
      }
    } catch (e) {
      console.warn(`⚠️ Failed to parse ${key}:`, e);
    }
  }
});

console.log(`✅ Cleanup complete! Removed ${cleared} bad position(s).`);
console.log('🔄 Reload the page for changes to take effect.');

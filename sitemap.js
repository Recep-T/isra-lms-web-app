// sitemap.js
const fs = require('fs');
const path = require('path');
const { createSitemap } = require('sitemap');

// Your website domain
const hostname = 'https://nextinterviewblueprint.com';

// List of all your pages
const urls = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.8 },
  { url: '/register/demo', changefreq: 'monthly', priority: 0.8 },
  // Add more pages as needed
];

// Create sitemap
const sitemapInstance = createSitemap({
  hostname,
  urls,
});

// Ensure the public folder exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Write sitemap.xml
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapInstance.toString());

console.log('✅ sitemap.xml has been created in the public folder!');

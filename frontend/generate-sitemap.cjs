const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to generate slug
const getProductSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const getProductsFromProductsView = () => {
  const viewPath = path.join(__dirname, 'src', 'components', 'ProductsView.tsx');
  const products = [];
  try {
    if (fs.existsSync(viewPath)) {
      const content = fs.readFileSync(viewPath, 'utf8');
      // Match names in BROCHURE_PRODUCTS
      const nameRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = nameRegex.exec(content)) !== null) {
        if (!products.includes(match[1]) && !match[1].startsWith('/') && match[1].length < 100) {
          products.push(match[1]);
        }
      }
    }
  } catch (e) {
    console.error("Error reading ProductsView.tsx for fallback:", e);
  }
  return products;
};

const getProductsFromStaticFile = () => {
  const dataPath = path.join(__dirname, 'src', 'data.ts');
  const products = [];
  try {
    const content = fs.readFileSync(dataPath, 'utf8');
    // Match product names inside PRODUCTS array
    const nameRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = nameRegex.exec(content)) !== null) {
      if (!products.includes(match[1])) {
        products.push(match[1]);
      }
    }
  } catch (e) {
    console.error("Error reading data.ts for fallback:", e);
  }

  // Combine with brochure products
  const brochureProducts = getProductsFromProductsView();
  brochureProducts.forEach(name => {
    if (!products.includes(name)) {
      products.push(name);
    }
  });

  return products;
};

const writeSitemap = (productNames) => {
  const sitemapUrls = [
    'https://www.heatonetechnology.live/',
    'https://www.heatonetechnology.live/products',
    'https://www.heatonetechnology.live/contact',
    'https://www.heatonetechnology.live/admin'
  ];

  // De-duplicate names
  const uniqueNames = Array.from(new Set(productNames));

  uniqueNames.forEach(name => {
    sitemapUrls.push(`https://www.heatonetechnology.live/products/${getProductSlug(name)}`);
  });

  const today = new Date().toISOString().split('T')[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.endsWith('/contact') || url.endsWith('/admin') ? 'monthly' : 'weekly'}</changefreq>
    <priority>${url === 'https://www.heatonetechnology.live/' ? '1.0' : url.includes('/products/') ? '0.8' : '0.9'}</priority>
  </url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  // Ensure public directory exists
  const publicDir = path.dirname(sitemapPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(sitemapPath, sitemapXml);
  console.log(`Successfully generated sitemap.xml with ${sitemapUrls.length} entries.`);
};

// Main fetching logic with timeout
console.log("Fetching live products from backend for sitemap generation...");
const req = https.get('https://heatonetech.onrender.com/api/products', { timeout: 6000 }, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const data = JSON.parse(body);
        if (data && Array.isArray(data.products)) {
          const names = data.products.map(p => p.name);
          if (names.length > 0) {
            console.log(`Fetched ${names.length} products dynamically from backend.`);
            writeSitemap(names);
            process.exit(0);
          }
        }
      }
      throw new Error(`Invalid response or status code: ${res.statusCode}`);
    } catch (e) {
      console.warn("Could not parse products from live API. Falling back to static data...", e.message);
      const names = getProductsFromStaticFile();
      writeSitemap(names);
    }
  });
});

req.on('error', (e) => {
  console.warn("Backend API request failed. Falling back to static data...", e.message);
  const names = getProductsFromStaticFile();
  writeSitemap(names);
});

req.on('timeout', () => {
  req.destroy();
  console.warn("Backend API request timed out. Falling back to static data...");
  const names = getProductsFromStaticFile();
  writeSitemap(names);
});

// LocalStorage key for retailer products
const RETAILER_KEY = 'hh_retailer_products';

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  document.getElementById('retailerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addProduct();
  });
});

// Add a product
function addProduct() {
  const name = document.getElementById('prodName').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const shop = document.getElementById('prodShop').value.trim();

  if (!name || !desc || !shop) return alert("All fields required!");

  const products = JSON.parse(localStorage.getItem(RETAILER_KEY) || '[]');

  // Create product object
  const product = {
    id: Date.now(),
    name,
    description: desc,
    shop,
    createdAt: new Date().toISOString(),
    premium: true // All retailer products are premium for AR video
  };

  products.push(product);
  localStorage.setItem(RETAILER_KEY, JSON.stringify(products));

  alert("Product added successfully!");
  document.getElementById('retailerForm').reset();
  loadProducts();
}

// Render products
function loadProducts() {
  const products = JSON.parse(localStorage.getItem(RETAILER_KEY) || '[]');
  const container = document.getElementById('productList');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p>No products posted yet.</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <b>${p.name}</b>
      <p>${p.description}</p>
      <small class="muted">Shop: ${p.shop}</small>
      <small class="muted">Premium: ${p.premium ? 'Yes' : 'No'}</small>
    `;
    container.appendChild(card);
  });
}

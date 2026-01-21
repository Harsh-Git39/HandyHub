const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
  
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple file helpers
const USERS_FILE = path.join(__dirname, 'users.json');
const VIDEOS_FILE = path.join(__dirname, 'videos.json');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  } catch (e) {
    return [];
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Ensure users.json exists
if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);

// APIs

// Get videos (no auth required). The frontend will indicate user email to show premium state
app.get('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  res.json({ ok: true, videos });
});

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ ok: false, message: 'name, email, password required' });

  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ ok: false, message: 'User already exists' });
  }
  const newUser = { id: Date.now(), name, email: email.toLowerCase(), password, premium: false, createdAt: new Date().toISOString() };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  const safe = { id: newUser.id, name: newUser.name, email: newUser.email, premium: newUser.premium };
  res.json({ ok: true, user: safe });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, message: 'email & password required' });

  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  const safe = { id: user.id, name: user.name, email: user.email, premium: user.premium };
  res.json({ ok: true, user: safe });
});

// Simulate premium upgrade
app.post('/api/upgrade', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, message: 'email required' });

  const users = readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return res.status(404).json({ ok: false, message: 'User not found' });

  users[idx].premium = true;
  writeJSON(USERS_FILE, users);
  const safe = { id: users[idx].id, name: users[idx].name, email: users[idx].email, premium: users[idx].premium };
  res.json({ ok: true, user: safe, message: 'Upgraded to premium (simulated)' });
});

// Me (get current user info)
app.get('/api/me', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ ok: false, message: 'email required' });
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' });
  const safe = { id: user.id, name: user.name, email: user.email, premium: user.premium };
  res.json({ ok: true, user: safe });
});

// Serve index (fallback)
// ✅ Works with Express v5
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HandyHub prototype server running at http://localhost:${PORT}`);
});


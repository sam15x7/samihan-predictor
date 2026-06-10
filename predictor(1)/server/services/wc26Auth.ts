// [WC2026 ENHANCEMENT — Task 1]
import axios from 'axios';

const WC26_BASE = 'https://worldcup26.ir';
let _token = null;
let _tokenExpiry = 0;

export async function getWC26Token() {
  if (_token && Date.now() < _tokenExpiry) return _token;
  try {
    const res = await axios.post(`${WC26_BASE}/auth/login`, {
      email: process.env.WC26_EMAIL || "test@example.com",
      password: process.env.WC26_PASS || "password"
    });
    if (res.data && res.data.token) {
      _token = res.data.token;
      _tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23h refresh
      return _token;
    }
  } catch (e: any) {
    // Silently handle if the mock API is unavailable
  }
  return null;
}

export async function wc26Fetch(path: string) {
  const token = await getWC26Token();
  if (!token) return null; // No auth token available
  const res = await axios.get(`${WC26_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

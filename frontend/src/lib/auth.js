/**
 * Wallet Auth Library
 *
 * Handle wallet-based authentication di frontend:
 *   1. Request nonce dari backend
 *   2. User sign nonce dengan MetaMask
 *   3. Kirim signature ke backend → dapat JWT token
 *   4. Simpan token di localStorage
 *   5. Attach token ke setiap API request yang butuh auth
 *
 * Cara pakai di component:
 *   const { authToken, loginWithWallet, isAuthenticated } = useWalletAuth();
 */

import { getApiUrl } from "./api-url";

const TOKEN_KEY = "rp_auth_token";
const TOKEN_ADDRESS_KEY = "rp_auth_address";

/**
 * Cek apakah user sudah punya valid token
 */
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Cek apakah token masih valid (tidak expired)
 */
export function getStoredAddress() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_ADDRESS_KEY);
}

/**
 * Request nonce dari backend untuk wallet address
 */
async function requestNonce(address) {
  const res = await fetch(`${getApiUrl()}/api/auth/nonce?address=${address}`);
  if (!res.ok) throw new Error("Failed to get nonce");
  const data = await res.json();
  return data.nonce;
}

/**
 * Request user sign nonce dengan MetaMask
 */
async function signNonce(nonce) {
  if (!window.ethereum) throw new Error("MetaMask not installed");

  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (!accounts.length) throw new Error("No wallet connected");

  // personal_sign — user akan melihat pesan ini di MetaMask popup
  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [nonce, accounts[0]],
  });

  return { signature, address: accounts[0] };
}

/**
 * Verifikasi signature di backend dan dapat token JWT
 */
async function verifyWithBackend(address, signature) {
  const res = await fetch(`${getApiUrl()}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Verification failed");
  }

  return await res.json();
}

/**
 * Login penuh: nonce → sign → verify → token
 *
 * @param {string} address - Wallet address yang sudah terhubung
 * @returns {Promise<{token, address}>}
 */
export async function loginWithWallet(address) {
  // Step 1: Minta nonce dari backend
  const nonce = await requestNonce(address);

  // Step 2: User sign nonce dengan MetaMask (muncul popup)
  const { signature } = await signNonce(nonce);

  // Step 3: Verifikasi signature di backend
  const result = await verifyWithBackend(address, signature);

  // Step 4: Simpan token
  localStorage.setItem(TOKEN_KEY, result.token);
  localStorage.setItem(TOKEN_ADDRESS_KEY, result.address);

  return result;
}

/**
 * Logout — hapus token
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_ADDRESS_KEY);
}

/**
 * Cek apakah token masih valid via backend
 */
export async function checkAuth() {
  const token = getStoredToken();
  if (!token) return { authenticated: false };

  try {
    const res = await fetch(`${getApiUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      logout();
      return { authenticated: false };
    }

    const data = await res.json();
    return { authenticated: true, address: data.address };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Fetch wrapper yang otomatis attach auth token
 *
 * Dipakai untuk semua API call yang butuh authentication.
 *
 * @example
 *   const res = await authFetch("/api/papers", {
 *     method: "POST",
 *     body: formData,
 *   });
 */
export async function authFetch(url, options = {}) {
  const token = getStoredToken();

  const headers = {
    ...options.headers,
  };

  // Attach token kalau ada
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Full URL kalau relative
  const fullUrl = url.startsWith("http") ? url : `${getApiUrl()}${url}`;

  return fetch(fullUrl, { ...options, headers });
}

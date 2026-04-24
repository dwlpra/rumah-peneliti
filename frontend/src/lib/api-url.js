// API URL resolved at runtime to support both localhost and public access
let _api;
function getApiUrl() {
  if (_api) return _api;
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    _api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  } else {
    _api = `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return _api;
}

export { getApiUrl };

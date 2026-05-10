// API URL resolved at runtime to support both localhost and public access
let _api;
function getApiUrl() {
  if (_api) return _api;
  // Build-time env var takes priority (set during docker build)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'http://localhost:3001') {
    _api = envUrl;
    return _api;
  }
  if (typeof window === 'undefined') return envUrl || 'http://localhost:3001';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    _api = envUrl || 'http://localhost:3001';
  } else {
    // Production: use api subdomain
    _api = `${window.location.protocol}//api.${window.location.hostname}`;
  }
  return _api;
}

export { getApiUrl };

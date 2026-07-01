import axios from 'axios';

export let API_BASE_URL = 'http://localhost:3001';

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  
  if (hostname.endsWith('.loca.lt')) {
    // If accessed via localtunnel, use the backend localtunnel URL
    API_BASE_URL = 'https://fuzzy-api-v10.loca.lt';
  } else if (hostname.endsWith('.vercel.app')) {
    // If deployed on Vercel, use the Vercel backend URL
    API_BASE_URL = 'https://backend-nu-nine-23.vercel.app';
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // If on localhost, talk to backend localhost directly
    API_BASE_URL = 'http://localhost:3001';
  } else {
    // If accessed via local IP (e.g. 192.168.30.128), talk to backend local IP
    API_BASE_URL = `http://${hostname}:3001`;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add bearer token
apiClient.interceptors.request.use(
  (config) => {
    // Only send the bypass header if the destination is a localtunnel gateway
    if (config.baseURL?.includes('.loca.lt') || config.url?.includes('.loca.lt')) {
      config.headers['Bypass-Tunnel-Reminder'] = 'true';
    }

    try {
      // Decode JWT token from encrypted localStorage
      const encryptedToken = localStorage.getItem('fuzzy_auth_token');
      if (encryptedToken) {
        const token = atob(encryptedToken); // Simple encoding for protection
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error reading token', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auto logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Logging out...');
      localStorage.removeItem('fuzzy_auth_token');
      localStorage.removeItem('fuzzy_auth_user');
      
      // Redirect to login if in client environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

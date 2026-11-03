import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful 401 & 403 Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Token is invalid or expired: clear corrupted session and redirect cleanly
      console.warn('Session expired or unauthorized. Clearing credentials.');
      localStorage.removeItem('userInfo');
      // Only redirect if not already on the login or public pages
      const publicPaths = ['/login', '/register', '/', '/about', '/services', '/contact'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?expired=true';
      }
    } else if (status === 403) {
      console.warn('Access denied for this resource (403 Forbidden).');
    }

    return Promise.reject(error);
  }
);

export default api;

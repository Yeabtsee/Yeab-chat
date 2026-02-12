const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com' // You should update this after deployment or use an env var
  : 'http://localhost:5000';

export default API_URL;

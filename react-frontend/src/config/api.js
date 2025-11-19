// API Configuration
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Export both the base URL (for backward compatibility) and the axios instance
export { API_BASE_URL };
export default api;


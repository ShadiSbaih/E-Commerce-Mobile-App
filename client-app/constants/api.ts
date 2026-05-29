import axios from "axios";
// import { Platform } from "react-native";

// const LOCAL_API_URL = Platform.select({
//   android: "http://192.168.1.2:3000/api",
//   ios: "http://192.168.1.2:3000/api",
//   default: "http://localhost:3000/api",
// });

const api = axios.create({ baseURL: "https://e-commerce-rho-three-16.vercel.app/api" });

// Token provider and sign-out handler to be set by the auth context
let _getToken: (() => Promise<string | null>) | null = null;
let _signOut: (() => Promise<void>) | null = null;

/**
 * Register the auth handlers (call this from inside ClerkProvider).
 * This allows the interceptors to fetch tokens and sign out on 401.
 */
export function setAuthHandlers(
  getToken: () => Promise<string | null>,
  signOut: () => Promise<void>,
) {
  _getToken = getToken;
  _signOut = signOut;
}

// Request interceptor: attach Bearer token to every request
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 by signing the user out
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && _signOut) {
      console.warn("Received 401 - signing user out");
      await _signOut();
    }
    return Promise.reject(error);
  },
);

export default api;

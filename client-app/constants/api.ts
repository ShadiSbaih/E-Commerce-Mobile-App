import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const FALLBACK_API_URL = "https://e-commerce-rho-three-16.vercel.app/api";
const LOCAL_API_PORT = 3000;

/**
 * `localhost` is the device itself when the app runs on a physical phone.
 * Expo exposes the Metro host while developing, so use that host for the
 * local API as well. This keeps the same .env value usable on web, Android,
 * iOS simulators, and physical devices.
 */
function getLocalApiHost() {
  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];

  // Android Emulator maps 10.0.2.2 to the host computer. A physical
  // Android device must use the computer's LAN address instead.
  if (Platform.OS === "android" && Constants.isDevice === false) {
    return "10.0.2.2";
  }

  if (metroHost) return metroHost;
  if (Platform.OS === "android") return "10.0.2.2";
  return "localhost";
}

function resolveApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_URL;

  if (Platform.OS === "web") return configuredUrl;

  try {
    const url = new URL(configuredUrl);
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (isLocalhost) {
      url.hostname = getLocalApiHost();
      if (!url.port) url.port = String(LOCAL_API_PORT);
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    console.warn("Invalid EXPO_PUBLIC_API_BASE_URL; using the configured value as-is.");
  }

  return configuredUrl;
}

const API_URL = resolveApiUrl();

if (!API_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_BASE_URL environment variable");
}

const api = axios.create({ baseURL: API_URL });

declare module "axios" {
  interface AxiosRequestConfig {
    /** Prevent this request from showing the app-wide blocking loader. */
    skipGlobalLoading?: boolean;
  }
}

// Token provider and sign-out handler to be set by the auth context
let _getToken: (() => Promise<string | null>) | null = null;
let _signOut: (() => Promise<void>) | null = null;
let _startLoading: (() => void) | null = null;
let _stopLoading: (() => void) | null = null;

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

/** Register the app-level loading state used by the Axios interceptors. */
export function setLoadingHandlers(startLoading: () => void, stopLoading: () => void) {
  _startLoading = startLoading;
  _stopLoading = stopLoading;
}

// Request interceptor: attach Bearer token to every request
api.interceptors.request.use(
  async (config) => {
    if (!config.skipGlobalLoading) _startLoading?.();
    if (_getToken) {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    _stopLoading?.();
    return Promise.reject(error);
  },
);

// Response interceptor: handle 401 by signing the user out
api.interceptors.response.use(
  (response) => {
    if (!response.config.skipGlobalLoading) _stopLoading?.();
    return response;
  },
  async (error) => {
    if (!error.config?.skipGlobalLoading) _stopLoading?.();
    if (error.response?.status === 401 && _signOut) {
      console.warn("Received 401 - signing user out");
      await _signOut();
    }
    return Promise.reject(error);
  },
);

export default api;

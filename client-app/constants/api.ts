import axios from "axios";
// import { Platform } from "react-native";

// const LOCAL_API_URL = Platform.select({
//   android: "http://192.168.1.2:3000/api",
//   ios: "http://192.168.1.2:3000/api",
//   default: "http://localhost:3000/api",
// });

const api = axios.create({ baseURL: "https://e-commerce-rho-three-16.vercel.app/api" });

export default api;

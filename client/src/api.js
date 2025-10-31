import axios from "axios";

const API = axios.create({
  baseURL: "https://linkedin-clone-1-8jqm.onrender.com/api", // ✅ Use /api prefix
  withCredentials: true, // ✅ Needed when using cookies or CORS credentials
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

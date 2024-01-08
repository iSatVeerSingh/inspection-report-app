import axios from "axios";
const BASE_URL = "/api";

export const inspectionApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

inspectionApi.interceptors.request.use((config) => {
  const jsonUser = localStorage.getItem("user");
  if (jsonUser) {
    const user = JSON.parse(jsonUser);
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

inspectionApi.interceptors.response.use(
  (response) => response,
  (error: any) =>
    error.code === "ERR_NETWORK"
      ? { data: { message: "No Internet Connection. You are offline" } }
      : { data: { message: error.message } }
);

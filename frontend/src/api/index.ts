import axios from "axios";
import { redirect } from "react-router-dom";
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
  (error: any) => {
    if (error.code === "ERR_NETWORK") {
      return { data: { message: "No Internet Connection. You are offline" } };
    }

    if (error.response?.status === 401) {
      redirect("/login");
      return;
    }

    return {
      data: {
        message: error.message,
      },
    };
  }
);

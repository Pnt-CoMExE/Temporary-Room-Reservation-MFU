import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import router from "@/router";
import type { ApiError } from "@/types";

// ── Cookie helpers ────────────────────────────────────────
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
};

// ── API instance ──────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: (import.meta as Record<string, any>).env.VITE_API_URL || "",
  withCredentials: true,
  timeout: 30000, // 30s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie("mfu_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    // Network error (no response)
    if (!error.response) {
      const apiError: ApiError = {
        message:
          "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
      };
      return Promise.reject(apiError);
    }

    const { status, data } = error.response;

    // 401 — Token expired
    if (status === 401) {
      localStorage.clear();
      deleteCookie("mfu_token");
      router.push("/");
      const apiError: ApiError = {
        message: data?.message || "กรุณาเข้าสู่ระบบอีกครั้ง",
      };
      return Promise.reject(apiError);
    }

    // 403 — Forbidden
    if (status === 403) {
      const apiError: ApiError = {
        message: data?.message || "ไม่มีสิทธิ์เข้าถึง",
      };
      return Promise.reject(apiError);
    }

    // 404 — Not found
    if (status === 404) {
      const apiError: ApiError = {
        message: data?.message || "ไม่พบข้อมูลที่ร้องขอ",
      };
      return Promise.reject(apiError);
    }

    // 422/400 — Validation/Client errors
    if (status === 400 || status === 422) {
      const apiError: ApiError = {
        message: data?.message || "ข้อมูลที่ส่งไม่ถูกต้อง",
      };
      return Promise.reject(apiError);
    }

    // 500+ — Server errors
    const apiError: ApiError = {
      message: data?.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ โปรดลองอีกครั้ง",
    };
    return Promise.reject(apiError);
  }
);

export default api;

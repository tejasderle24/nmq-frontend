import { create } from "zustand";
import {
  loginApi,
  refreshTokenApi,
  logoutApi,
} from "../api/auth.api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem(USER_KEY)) || null,
  accessToken: sessionStorage.getItem(ACCESS_TOKEN_KEY) || null,
  refreshToken: sessionStorage.getItem(REFRESH_TOKEN_KEY) || null,

  loading: false,
  error: null,
  isAuthenticated: !!sessionStorage.getItem(ACCESS_TOKEN_KEY),

  // =========================
  // LOGIN
  // =========================
  login: async (data) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await loginApi(data);

      const {
        user,
        accessToken,
        refreshToken,
      } = response.data;

      // Save tokens
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      if (refreshToken) {
        sessionStorage.setItem(
          REFRESH_TOKEN_KEY,
          refreshToken
        );
      } else {
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      // Save user
      sessionStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );

      set({
        user,
        accessToken,
        refreshToken: refreshToken || null,
        loading: false,
        error: null,
        isAuthenticated: true,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed";

      set({
        loading: false,
        error: message,
        isAuthenticated: false,
      });

      throw new Error(message);
    }
  },

  // =========================
  // REFRESH ACCESS TOKEN
  // =========================
  refreshAccessToken: async () => {
    try {
      const refreshToken =
        sessionStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }

      const response =
        await refreshTokenApi(refreshToken);

      const { accessToken } = response.data;

      sessionStorage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken
      );

      set({
        accessToken,
        isAuthenticated: true,
      });

      return accessToken;
    } catch (error) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });

      throw error;
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    try {
      const refreshToken =
        sessionStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  },

  // =========================
  // CLEAR ERROR
  // =========================
  clearError: () => {
    set({
      error: null,
    });
  },

  // =========================
  // SET AUTH FROM STORAGE
  // =========================
  initializeAuth: () => {
    const accessToken =
      sessionStorage.getItem(ACCESS_TOKEN_KEY);

    const refreshToken =
      sessionStorage.getItem(REFRESH_TOKEN_KEY);

    const user =
      JSON.parse(sessionStorage.getItem(USER_KEY)) ||
      null;

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
    });
  },
}));

export default useAuthStore;
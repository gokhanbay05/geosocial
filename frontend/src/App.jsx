import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MapView from "./components/map/Map";
import LayoutOverlay from "./components/layout/LayoutOverlay";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuthStore } from "./store/useAuthStore";
import { Spinner } from "./components/core/Spinner";
import { useChatStore } from "./store/useChatStore";
import { useSettingsStore } from "./store/useSettingsStore";

export default function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated, user } = useAuthStore();
  const { connectSocket, disconnectSocket } = useChatStore();
  const { theme } = useSettingsStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user, connectSocket, disconnectSocket]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "",
          style: {
            border: "1px solid var(--color-border-default)",
            padding: "16px",
            color: "var(--color-text-dark)",
            backgroundColor: "var(--color-bg-surface-alt)",
            borderRadius: "12px",
            boxShadow: "0 4px 12px var(--color-shadow-default)",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: "var(--color-success-text)",
              secondary: "var(--color-bg-surface-alt)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-danger-text)",
              secondary: "var(--color-bg-surface-alt)",
            },
            style: {
              border: "1px solid var(--color-danger-border)",
              backgroundColor: "var(--color-danger-bg)",
              color: "var(--color-danger-text)",
            },
          },
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="h-screen w-screen overflow-hidden relative bg-[var(--color-bg-surface-alt)]">
                <MapView />
                <LayoutOverlay />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}
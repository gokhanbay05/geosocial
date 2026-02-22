import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getFileUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150";
  if (path.startsWith("http")) return path;
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) {
    return "now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  return "24h";
};

import api from "../lib/api";

export const register = async (userData) => {
  const formData = new FormData();
  formData.append("username", userData.username);
  formData.append("email", userData.email);
  formData.append("password", userData.password);

  if (userData.avatar) {
    formData.append("avatar", userData.avatar);
  }

  const response = await api.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data;
};
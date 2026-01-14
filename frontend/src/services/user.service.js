import api from "../lib/api";

export const getUserProfile = async (username, options = {}) => {
  const response = await api.get(`/users/${username}`, options);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.put(`/users/${userId}/follow`);
  return response.data;
};

export const searchUsers = async (query, options = {}) => {
  const response = await api.get(`/users/search?q=${query}`, options);
  return response.data;
};

export const updateProfile = async (userData) => {
  const formData = new FormData();

  if (userData.bio !== undefined) {
    formData.append("bio", userData.bio);
  }

  if (userData.avatar) {
    formData.append("avatar", userData.avatar);
  }

  const response = await api.put("/users/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


  return response.data;
};

export const updateAccount = async (data) => {
  const response = await api.put("/users/account", data);
  return response.data;
};
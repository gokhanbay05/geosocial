import api from "../lib/api";

export const getPostsInBounds = async (
  bounds,
  page = 1,
  sortBy = "newest",
  options = {}
) => {
  const params = {
    swLat: bounds._sw.lat,
    swLng: bounds._sw.lng,
    neLat: bounds._ne.lat,
    neLng: bounds._ne.lng,
    page,
    limit: 10,
    sortBy,
  };

  const response = await api.get("/posts", { params, ...options });
  return response.data;
};

export const getPostById = async (postId, options = {}) => {
  const response = await api.get(`/posts/${postId}`, options);
  return response.data;
};

export const getUserPosts = async (userId, options = {}) => {
  const response = await api.get(`/posts/user/${userId}`, options);
  return response.data;
};

export const createPost = async (postData) => {
  const formData = new FormData();
  formData.append("file", postData.file);
  formData.append("description", postData.description);
  formData.append("latitude", postData.latitude);
  formData.append("longitude", postData.longitude);

  const response = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.put(`/posts/${postId}/like`);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};
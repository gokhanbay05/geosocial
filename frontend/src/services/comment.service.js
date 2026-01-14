import api from "../lib/api";

export const getPostComments = async (
  postId,
  sortBy = "newest",
  options = {}
) => {
  const response = await api.get(
    `/comments/post/${postId}?sortBy=${sortBy}`,
    options
  );
  return response.data;
};

export const addComment = async (postId, text, parentId = null) => {
  const payload = { text };
  if (parentId) {
    payload.parentId = parentId;
  }

  const response = await api.post(`/comments/post/${postId}`, payload);
  return response.data;
};

export const getCommentReplies = async (commentId, options = {}) => {
  const response = await api.get(`/comments/${commentId}/replies`, options);
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await api.put(`/comments/${commentId}/like`);
  return response.data;
};
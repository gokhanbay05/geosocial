import { useState, useEffect, useRef } from "react";
import "../../css/feed/PostDetail.css";
import { useUIStore } from "../../store/useUIStore";
import { usePostStore } from "../../store/usePostStore";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../core/Button";
import Input from "../core/Input";
import Spinner from "../core/Spinner";
import Divider from "../core/Divider";
import CommentItem from "./CommentItem";
import { ChevronDown, Heart, Send, Trash2 } from "lucide-react";
import { getFileUrl, formatTimeAgo } from "../../lib/utils";
import { getPostComments, addComment } from "../../services/comment.service";
import { getPostById, likePost } from "../../services/post.service";
import { handleError } from "../../lib/errorHandler";
import toast from "react-hot-toast";
import SortSelect from "../core/SortSelect";

export default function PostDetail() {
  const { openModal, triggerRefresh } = useUIStore();
  const {
    activePost,
    closePostDetail,
    updatePost,
    replacePost
  } = usePostStore();
  const {
    openProfile,
    viewingProfile,
    updateViewedProfileStats
  } = useProfileStore();
  const { user: currentUser, updateUser } = useAuthStore();

  const [commentText, setCommentText] = useState("");
  const [lastPost, setLastPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [commentSortBy, setCommentSortBy] = useState("newest");

  const videoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    if (activePost?._id) {
      setLastPost(activePost);
      if (isMounted) setIsLoadingPost(true);
      getPostById(activePost._id, { signal: abortController.signal })
        .then((data) => {
          if (isMounted) {
            replacePost(data);
          }
        })
        .catch((err) => {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            handleError(err, { context: "PostDetail_FetchPost", showToast: false });
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingPost(false);
        });
    }
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [activePost?._id]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    if (activePost?._id) {
      if (isMounted) setIsLoadingComments(true);
      getPostComments(activePost._id, commentSortBy, {
        signal: abortController.signal,
      })
        .then((data) => {
          if (isMounted) setComments(data);
        })
        .catch((err) => {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            handleError(err, { context: "PostDetail_Comments" });
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingComments(false);
        });
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [activePost?._id, commentSortBy]);

  const isOpen = !!activePost;

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!activePost && !lastPost) return null;

  const post = activePost || lastPost;

  const overlayClass = `post-detail-overlay ${isOpen ? "is-active" : ""}`;

  const isLiked = post.likes?.some((like) => {
    const likeId = typeof like === "object" ? like._id : like;
    return likeId?.toString() === currentUser?._id?.toString();
  });

  const likeCount = post.stats?.likeCount ?? post.likes?.length ?? 0;
  const isOwner = currentUser?._id === post.author?._id;

  const toggleLike = async () => {
    if (!currentUser) return;

    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    let updatedLikes = [...(post.likes || [])];

    if (newIsLiked) {
      if (
        !updatedLikes.some(
          (id) => (id._id || id).toString() === currentUser._id.toString()
        )
      ) {
        updatedLikes.push(currentUser._id);
      }
    } else {
      updatedLikes = updatedLikes.filter(
        (id) => (id._id || id).toString() !== currentUser._id.toString()
      );
    }

    updatePost(post._id, {
      likes: updatedLikes,
      stats: { ...post.stats, likeCount: newLikeCount },
    });

    if (viewingProfile && post.author?.username === viewingProfile) {
      updateViewedProfileStats(newIsLiked ? 1 : -1);
    }

    if (post.author?._id === currentUser._id) {
      updateUser({
        stats: {
          ...currentUser.stats,
          totalLikesReceived:
            (currentUser.stats.totalLikesReceived || 0) + (newIsLiked ? 1 : -1),
        },
      });
    }

    try {
      await likePost(post._id);
    } catch (err) {
      handleError(err, { context: "PostDetail_Like" });
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    setIsSendingComment(true);
    try {
      const newComment = await addComment(post._id, commentText);

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      updatePost(post._id, {
        stats: {
          ...post.stats,
          commentCount: (post.stats?.commentCount || 0) + 1,
        },
      });

      toast.success("Comment sent");
    } catch (error) {
      handleError(error, { context: "PostDetail_AddComment" });
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleDelete = () => {
    openModal("deletePost", { postId: post._id });
  };

  const handleProfileClick = () => {
    if (post.author?.username) {
      openProfile(post.author.username);
    }
  };

  const SendButton = (
    <Button
      variant="ghost"
      size="icon"
      className="text-(--color-primary) hover:bg-transparent"
      onClick={handleSendComment}
      disabled={isSendingComment}
    >
      {isSendingComment ? <Spinner size="sm" /> : <Send size={18} />}
    </Button>
  );

  return (
    <div className={overlayClass}>
      <div className="detail-media-section">
        {post.mediaType === "image" && (
          <img
            src={getFileUrl(post.mediaUrl)}
            alt="Blur Background"
            className="media-background-blur"
          />
        )}

        {post.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={getFileUrl(post.mediaUrl)}
            className="detail-media"
            controls
            autoPlay
            muted={false}
          />
        ) : (
          <img
            src={getFileUrl(post.mediaUrl)}
            alt="Post Content"
            className="detail-media"
          />
        )}
      </div>

      <div className="detail-info-section">
        {isLoadingPost ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <>
            <div className="detail-header">
              <div
                className="user-block cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleProfileClick}
              >
                <img
                  src={getFileUrl(post.author?.avatarUrl)}
                  className="user-avatar"
                  alt="Avatar"
                />
                <div className="flex flex-col">
                  <span className="user-name">{post.author?.username}</span>
                  <span className="text-xs text-text-muted">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <Button variant="ghost" size="icon" onClick={handleDelete}>
                    <Trash2 size={20} />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={closePostDetail}>
                  <ChevronDown size={24} />
                </Button>
              </div>
            </div>

            <div className="detail-comments-container">
              {post.description && (
                <div className="comment-row">
                  <img
                    src={getFileUrl(post.author?.avatarUrl)}
                    className="comment-avatar cursor-pointer"
                    alt="Owner"
                    onClick={handleProfileClick}
                  />
                  <div className="comment-bubble">
                    <div>
                      <span
                        className="comment-user cursor-pointer hover:underline"
                        onClick={handleProfileClick}
                      >
                        {post.author?.username}
                      </span>
                      <span className="comment-msg">{post.description}</span>
                    </div>
                  </div>
                </div>
              )}

              <Divider text="Comments" />

              <div className="comment-sort-header">
                <SortSelect value={commentSortBy} onChange={setCommentSortBy} />
              </div>

              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" color="primary" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-sm text-text-muted py-8 opacity-70">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="detail-footer">
              <div className="footer-like-area">
                <Button
                  variant="ghost"
                  onClick={toggleLike}
                  className="like-btn"
                >
                  <Heart
                    size={22}
                    strokeWidth={2.5}
                    className={`like-icon ${isLiked ? "is-liked" : ""}`}
                  />
                </Button>
                <span className="like-count">
                  {likeCount}
                </span>
              </div>

              <div className="flex-1">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rightElement={SendButton}
                  className="comment-input-container"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
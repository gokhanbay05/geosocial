import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../core/avatar";
import Button from "../core/Button";
import Input from "../core/Input";
import Spinner from "../core/Spinner";
import { getFileUrl, formatTimeAgo } from "../../lib/utils";
import {
  getCommentReplies,
  addComment,
  likeComment,
} from "../../services/comment.service";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Send, Heart } from "lucide-react";
import { handleError } from "../../lib/errorHandler";
import toast from "react-hot-toast";
import "../../css/feed/CommentItem.css";

export default function CommentItem({ comment, postId, depth = 0 }) {
  const { openProfile } = useProfileStore();
  const { user: currentUser } = useAuthStore();

  const [replies, setReplies] = useState([]);
  const [areRepliesOpen, setAreRepliesOpen] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [isLiked, setIsLiked] = useState(() => {
    if (!comment.likes || !currentUser?._id) return false;
    return comment.likes.some((like) => {
      const likeId = typeof like === "object" ? like._id : like;
      return likeId?.toString() === currentUser._id.toString();
    });
  });

  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

  const hasReplies = comment.replyCount > 0 || replies.length > 0;
  const isTooDeep = depth >= 3;

  const handleLike = async () => {
    if (!currentUser) return;

    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;

    setIsLiked(!prevIsLiked);
    setLikeCount(prevIsLiked ? prevLikeCount - 1 : prevLikeCount + 1);

    try {
      await likeComment(comment._id);
    } catch (error) {
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
      handleError(error, { context: "LikeComment" });
    }
  };

  const handleToggleReplies = async () => {
    if (areRepliesOpen) {
      setAreRepliesOpen(false);
      return;
    }
    setAreRepliesOpen(true);

    if (replies.length === 0 && comment.replyCount > 0) {
      setIsLoadingReplies(true);
      try {
        const data = await getCommentReplies(comment._id);
        setReplies(data);
      } catch (error) {
        setAreRepliesOpen(false);
        handleError(error, { context: "FetchReplies" });
      } finally {
        setIsLoadingReplies(false);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const newReply = await addComment(postId, replyText, comment._id);
      setReplies((prev) => [...prev, newReply]);
      setReplyText("");
      setIsReplying(false);
      setAreRepliesOpen(true);
      toast.success("Yanıtlandı");
    } catch (error) {
      handleError(error, { context: "SendReply" });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleStartReplying = () => {
    if (isReplying) {
      setIsReplying(false);
      return;
    }
    setIsReplying(true);
    setReplyText(`@${comment.author?.username} `);
  };

  return (
    <div className="comment-item-container">
      <div className="comment-main-row">
        <div
          className="comment-avatar-wrapper"
          onClick={() => openProfile(comment.author?.username)}
        >
          <Avatar className="comment-avatar-small">
            <AvatarImage src={getFileUrl(comment.author?.avatarUrl)} />
            <AvatarFallback>{comment.author?.username?.[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="comment-content-wrapper">
          <div className="comment-bubble-box">
            <span
              className="comment-username"
              onClick={() => openProfile(comment.author?.username)}
            >
              {comment.author?.username}
            </span>
            <span className="comment-text">{comment.text}</span>
          </div>

          <div className="comment-actions">
            <span className="comment-date">
              {formatTimeAgo(comment.createdAt)}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="comment-btn-ghost"
              onClick={handleStartReplying}
            >
              Reply
            </Button>

            <div className="comment-like-wrapper">
              <Button
                variant="ghost"
                size="sm"
                className="comment-btn-ghost"
                onClick={handleLike}
              >
                <Heart
                  size={14}
                  className={`comment-like-icon ${isLiked ? "is-liked" : ""}`}
                />
              </Button>
              {likeCount > 0 && (
                <span className="comment-like-count">{likeCount}</span>
              )}
            </div>

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="comment-btn-ghost comment-show-replies-btn"
                onClick={handleToggleReplies}
              >
                {areRepliesOpen
                  ? "Hide"
                  : `Replies (${comment.replyCount || replies.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="reply-input-area">
          <Input
            placeholder={`@${comment.author?.username}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="reply-input"
            rightElement={
              <Button
                variant="ghost"
                size="icon"
                className="reply-send-btn"
                onClick={handleSendReply}
                disabled={isSendingReply}
              >
                {isSendingReply ? <Spinner size="sm" /> : <Send size={14} />}
              </Button>
            }
          />
        </div>
      )}

      {areRepliesOpen && (
        <div className={`replies-list ${isTooDeep ? "replies-flat" : ""}`}>
          {!isTooDeep && <div className="replies-line"></div>}

          {isLoadingReplies ? (
            <div className="replies-loading">
              <Spinner size="sm" />
            </div>
          ) : (
            replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
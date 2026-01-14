import { useState } from "react";
import { useUIStore } from "../../store/useUIStore";
import { usePostStore } from "../../store/usePostStore";
import Modal from "../core/Modal";
import Button from "../core/Button";
import Spinner from "../core/Spinner";
import { deletePost } from "../../services/post.service";
import { handleError } from "../../lib/errorHandler";
import toast from "react-hot-toast";
import "../../css/modals/DeletePostModal.css";

export default function DeletePostModal() {
  const { activeModal, closeModal, modalData, triggerRefresh } = useUIStore();
  const { closePostDetail, removePost } = usePostStore();
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = activeModal === "deletePost";
  const postId = modalData?.postId;

  const handleDelete = async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      await deletePost(postId);

      removePost(postId);
      closePostDetail();
      triggerRefresh();

      toast.success("Post deleted successfully!");
      closeModal();
    } catch (error) {
      handleError(error, { context: "DeletePost" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Delete Post">
      <div className="delete-modal-body">
        <p className="delete-modal-text">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>

        <div className="delete-modal-warning">
          Warning: All comments and likes associated with this post will also be deleted.
        </div>
      </div>

      <div className="delete-modal-actions">
        <Button variant="ghost" onClick={closeModal} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" color="white" /> : "Yes, Delete"}
        </Button>
      </div>
    </Modal>
  );
}
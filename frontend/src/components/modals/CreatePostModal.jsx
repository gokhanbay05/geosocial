import { useState, useRef } from "react";
import { useUIStore } from "../../store/useUIStore";
import Modal from "../core/Modal";
import Button from "../core/Button";
import Spinner from "../core/Spinner";
import { X, UploadCloud, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { createPost } from "../../services/post.service";
import { handleError } from "../../lib/errorHandler";
import "../../css/modals/CreatePostModal.css";

export default function CreatePostModal() {
  const { activeModal, closeModal, triggerRefresh } = useUIStore();

  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  const isOpen = activeModal === "createPost";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an image or video");
      return;
    }

    setIsLoading(true);

    if (!navigator.geolocation) {
      toast.error("Your browser does not support geolocation");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          await createPost({
            file: selectedFile,
            description,
            latitude,
            longitude,
          });

          toast.success("Post shared successfully! ");

          setDescription("");
          setSelectedFile(null);
          setPreviewUrl(null);
          triggerRefresh();
          closeModal();
        } catch (error) {
          handleError(error, { context: "CreatePost" });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        toast.error("Location could not be retrieved. Please allow location permissions.");
        setIsLoading(false);
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create New Post">
      <div
        className="create-post-upload-area"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        {previewUrl ? (
          <div className="create-post-preview-container">
            {selectedFile?.type.startsWith("video") ? (
              <video
                src={previewUrl}
                className="create-post-preview-media"
                controls
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="create-post-preview-media"
              />
            )}
            <button className="create-post-remove-btn" onClick={clearFile}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="create-post-empty-state">
            <UploadCloud className="create-post-upload-icon" />
            <span className="create-post-upload-text">Click to upload</span>
            <span className="create-post-upload-subtext">Max 50 MB</span>
          </div>
        )}
      </div>

      <div className="create-post-form-group">
        <label className="create-post-label">Description</label>
        <textarea
          className="create-post-textarea"
          rows="3"
          placeholder="What's happening?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="create-post-footer-info">
        <div className="create-post-location-info">
          <MapPin size={14} className="create-post-location-icon" />
          <span>Location will be added automatically</span>
        </div>

        <div className="create-post-actions">
          <Button variant="ghost" onClick={closeModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" color="white" /> Sharing...
              </>
            ) : (
              "Share"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
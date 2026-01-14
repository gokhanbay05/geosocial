import { useState, useRef, useEffect } from "react";
import { useUIStore } from "../../store/useUIStore";
import { useAuthStore } from "../../store/useAuthStore";
import Modal from "../core/Modal";
import Button from "../core/Button";
import Input from "../core/Input";
import Spinner from "../core/Spinner";
import { Camera, User } from "lucide-react";
import { getFileUrl } from "../../lib/utils";
import { updateProfile } from "../../services/user.service";
import { handleError } from "../../lib/errorHandler";
import toast from "react-hot-toast";
import "../../css/modals/EditProfileModal.css";

export default function EditProfileModal() {
  const { activeModal, closeModal } = useUIStore();
  const { user, updateUser } = useAuthStore();

  const [bio, setBio] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeModal === "editProfile" && user) {
      setBio(user.bio || "");
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [activeModal, user]);

  const isOpen = activeModal === "editProfile";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        handleError(new Error("File size must be less than 5MB"), { context: "AvatarUpload" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await updateProfile({ bio, avatar: selectedFile });
      updateUser(result);
      toast.success("Profile updated successfully!");
      closeModal();
    } catch (error) {
      handleError(error, { context: "UpdateProfile" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Edit Profile">
      <div className="edit-profile-avatar-section">
        <div
          className="edit-profile-avatar-wrapper"
          onClick={() => fileInputRef.current?.click()}
        >
          <img
            src={previewUrl || getFileUrl(user?.avatarUrl)}
            alt="Avatar"
            className="edit-profile-avatar-image"
          />
          <div className="edit-profile-avatar-overlay">
            <Camera className="edit-profile-camera-icon" size={24} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <span
          className="edit-profile-change-text"
          onClick={() => fileInputRef.current?.click()}
        >
          Change Photo
        </span>
      </div>

      <div className="edit-profile-form">
        <Input
          label="Username"
          value={user?.username || ""}
          disabled
          icon={<User size={18} />}
          className="opacity-70 cursor-not-allowed"
        />

        <div className="edit-profile-input-group">
          <label className="edit-profile-label">Bio</label>
          <textarea
            className="edit-profile-textarea"
            rows="3"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
          />
          <span className="edit-profile-char-count">{bio.length}/160</span>
        </div>
      </div>

      <div className="edit-profile-actions">
        <Button variant="ghost" onClick={closeModal} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" color="white" /> : "Save"}
        </Button>
      </div>
    </Modal>
  );
}
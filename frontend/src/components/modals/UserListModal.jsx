import { useUIStore } from "../../store/useUIStore";
import { useProfileStore } from "../../store/useProfileStore";
import Modal from "../core/Modal";
import { Avatar, AvatarImage, AvatarFallback } from "../core/avatar";
import { getFileUrl } from "../../lib/utils";
import "../../css/modals/UserListModal.css";

export default function UserListModal() {
  const { activeModal, closeModal, modalData } = useUIStore();
  const { openProfile } = useProfileStore();

  const isOpen = activeModal === "followers" || activeModal === "following";
  const title = activeModal === "followers" ? "Followers" : "Following";

  const users = modalData?.users || [];

  const handleUserClick = (username) => {
    closeModal();
    openProfile(username);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={title}>
      <div className="user-list-container">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={(user._id || user).toString()}
              className="user-list-item"
              onClick={() => handleUserClick(user.username)}
            >
              <div className="user-list-left">
                <Avatar className="user-list-avatar">
                  <AvatarImage src={getFileUrl(user.avatarUrl)} />
                  <AvatarFallback>{user.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="user-list-username">{user.username}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="user-list-empty">No users found.</div>
        )}
      </div>
    </Modal>
  );
}
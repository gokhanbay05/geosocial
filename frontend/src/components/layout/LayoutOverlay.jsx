import "../../css/layout/LayoutOverlay.css";
import LeftPanel from "../panels/LeftPanel";
import RightPanel from "../panels/RightPanel";
import PostDetail from "../feed/PostDetail";
import CreatePostModal from "../modals/CreatePostModal";
import EditProfileModal from "../modals/EditProfileModal";
import UserListModal from "../modals/UserListModal";
import DeletePostModal from "../modals/DeletePostModal";

export default function LayoutOverlay() {
  return (
    <div className="layout-overlay">
      <LeftPanel />
      <RightPanel />
      <PostDetail />

      <CreatePostModal />
      <EditProfileModal />
      <UserListModal />
      <DeletePostModal />
    </div>
  );
}

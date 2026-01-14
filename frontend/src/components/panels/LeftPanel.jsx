import React from "react";
import LeftPanelLayout from "../layout/LeftPanelLayout";
import ProfilePage from "../../pages/ProfilePage";
import SearchPage from "../../pages/SearchPage";
import "../../css/panels/LeftPanel.css";
import { useUIStore } from "../../store/useUIStore";
import { useProfileStore } from "../../store/useProfileStore";
import ChatView from "../chat/ChatView";
import SettingsPage from "../../pages/SettingsPage";

export default function LeftPanel() {
  const { leftPanelTab, setLeftPanelTab } = useUIStore();
  const { viewingProfile } = useProfileStore();

  const renderContent = () => {
    switch (leftPanelTab) {
      case "search":
        if (viewingProfile) {
          return <ProfilePage />;
        }
        return <SearchPage />;

      case "profile":
        return <ProfilePage />;

      case "chat":
        return <ChatView />;

      case "settings":
        return <SettingsPage />;

      default:
        return <ProfilePage />;
    }
  };

  return (
    <LeftPanelLayout activeTab={leftPanelTab} onTabChange={setLeftPanelTab}>
      {renderContent()}
    </LeftPanelLayout>
  );
}
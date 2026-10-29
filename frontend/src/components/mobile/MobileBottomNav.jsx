import { useRef } from "react";
import "../../css/mobile/MobileBottomNav.css";
import Button from "../core/Button";
import SheetDragHandle from "./SheetDragHandle";
import {
  Map,
  User,
  Search,
  Plus,
  MessageCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "../../store/useUIStore";
import { usePostStore } from "../../store/usePostStore";
import { useProfileStore } from "../../store/useProfileStore";

/**
 * Mobil ve tablet ekranlarda (< 1024px) web tasarımıyla birebir aynı 5'li alt navigasyon barı,
 * çekmece kapalıyken üstünde duran açma çentiği (notch) ve üst ortadaki yarı saydam GeoSocial logosu.
 */
export default function MobileBottomNav() {
  const {
    leftPanelTab,
    isMobilePanelOpen,
    isRightPanelOpen,
    setLeftPanelTab,
    openModal,
    showMapOnMobile,
  } = useUIStore();
  const { activePost, closePostDetail } = usePostStore();
  const { viewingProfile, clearViewedProfile } = useProfileStore();

  const notchStartYRef = useRef(null);

  const isAllClosed = !isMobilePanelOpen && !isRightPanelOpen && !activePost;

  const openDefaultProfileSheet = () => {
    if (activePost) {
      closePostDetail();
    }
    clearViewedProfile();
    setLeftPanelTab("profile");
  };

  const handleNotchPointerDown = (e) => {
    notchStartYRef.current = e.clientY;
  };

  const handleNotchPointerUp = (e) => {
    if (notchStartYRef.current !== null) {
      const deltaY = e.clientY - notchStartYRef.current;
      notchStartYRef.current = null;
      // Yukarı sürükleme veya tıklama ile varsayılan olarak Profil çekmecesini aç
      if (deltaY <= 10) {
        openDefaultProfileSheet();
      }
    } else {
      openDefaultProfileSheet();
    }
  };

  const handleTabSelect = (tabName) => {
    if (activePost) {
      closePostDetail();
    }

    if (tabName === "profile") {
      clearViewedProfile();
    }

    // Search sekmesinde başkasının profili açıksa ve Search ikonuna basıldıysa arama ekranına dön
    if (tabName === "search" && isMobilePanelOpen && leftPanelTab === "search" && viewingProfile) {
      clearViewedProfile();
      return;
    }

    // Açık olan sekmeye tekrar dokunulursa çekmeceyi kapat
    if (isMobilePanelOpen && leftPanelTab === tabName) {
      showMapOnMobile();
      return;
    }

    setLeftPanelTab(tabName);
  };

  const getNavClass = (tabName) =>
    cn(
      "nav-btn",
      isMobilePanelOpen && !activePost && leftPanelTab === tabName && "is-active"
    );

  return (
    <>
      <div className="mobile-floating-brand">
        <Map
          size={22}
          stroke="url(#panel-logo-grad)"
          strokeWidth={2.5}
          className="shrink-0"
        />
        <span className="mobile-brand-text text-gradient-animated">
          GeoSocial
        </span>
      </div>

      <div className="mobile-bottom-nav">
        {isAllClosed && (
          <SheetDragHandle
            direction="up"
            handleProps={{
              onPointerDown: handleNotchPointerDown,
              onPointerUp: handleNotchPointerUp,
            }}
          />
        )}

        <Button
          variant="ghost"
          size="icon"
          className={getNavClass("profile")}
          onClick={() => handleTabSelect("profile")}
        >
          <User size={24} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={getNavClass("search")}
          onClick={() => handleTabSelect("search")}
        >
          <Search size={24} />
        </Button>

        <Button
          variant="primary"
          size="icon"
          className="nav-btn-add"
          onClick={() => openModal("createPost")}
        >
          <Plus size={24} />
        </Button>

        <div className="nav-badge-container">
          <Button
            variant="ghost"
            size="icon"
            className={getNavClass("chat")}
            onClick={() => handleTabSelect("chat")}
          >
            <MessageCircle size={24} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={getNavClass("settings")}
          onClick={() => handleTabSelect("settings")}
        >
          <Settings size={24} />
        </Button>
      </div>
    </>
  );
}

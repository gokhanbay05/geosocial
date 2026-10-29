import "../../css/mobile/MobileBottomNav.css";
import Button from "../core/Button";
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
 * Mobil ve tablet ekranlarda (< 1024px) ekranın altında sabit duran navigasyon barı
 * ve harita üzerinde sol üstte yer alan kompakt GeoSocial rozeti.
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
  const { resetProfileView } = useProfileStore();

  const isMapActive = !isMobilePanelOpen && !isRightPanelOpen && !activePost;

  const handleTabSelect = (tabName) => {
    if (activePost) {
      closePostDetail();
    }

    if (tabName === "profile") {
      resetProfileView();
    }

    // Aynı sekmeye tekrar dokunulursa paneli kapatıp haritayı göster
    if (isMobilePanelOpen && leftPanelTab === tabName) {
      showMapOnMobile();
      return;
    }

    setLeftPanelTab(tabName);
  };

  const handleMapClick = () => {
    if (activePost) {
      closePostDetail();
    }
    showMapOnMobile();
  };

  const getTabClass = (tabName) =>
    cn(
      "mobile-nav-btn",
      isMobilePanelOpen && !activePost && leftPanelTab === tabName && "is-active"
    );

  return (
    <>
      <div
        className="mobile-floating-brand"
        onClick={handleMapClick}
        role="button"
        tabIndex={0}
        aria-label="Return to map"
      >
        <Map
          size={20}
          stroke="url(#panel-logo-grad)"
          strokeWidth={2.5}
          className="shrink-0"
        />
        <span className="mobile-brand-text text-gradient-animated">
          GeoSocial
        </span>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <Button
          variant="ghost"
          size="icon"
          className={cn("mobile-nav-btn", isMapActive && "is-active")}
          onClick={handleMapClick}
          aria-label="Map"
        >
          <Map size={22} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={getTabClass("profile")}
          onClick={() => handleTabSelect("profile")}
          aria-label="Profile"
        >
          <User size={22} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={getTabClass("search")}
          onClick={() => handleTabSelect("search")}
          aria-label="Search"
        >
          <Search size={22} />
        </Button>

        <Button
          variant="primary"
          size="icon"
          className="mobile-nav-btn-add"
          onClick={() => openModal("createPost")}
          aria-label="Create Post"
        >
          <Plus size={22} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={getTabClass("chat")}
          onClick={() => handleTabSelect("chat")}
          aria-label="Chat"
        >
          <MessageCircle size={22} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={getTabClass("settings")}
          onClick={() => handleTabSelect("settings")}
          aria-label="Settings"
        >
          <Settings size={22} />
        </Button>
      </nav>
    </>
  );
}

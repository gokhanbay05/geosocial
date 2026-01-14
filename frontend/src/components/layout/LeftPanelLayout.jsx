import "../../css/layout/LeftPanelLayout.css";
import Button from "../core/Button";
import { User, Search, Plus, MessageCircle, Settings, Map } from "lucide-react"; // Map eklendi
import { cn } from "@/lib/utils";
import { useUIStore } from "../../store/useUIStore";

export default function LeftPanelLayout({ children, activeTab, onTabChange }) {
  const { openModal } = useUIStore();

  const getNavClass = (tabName) =>
    cn("nav-btn", activeTab === tabName && "is-active");

  return (
    <aside className="left-panel">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="panel-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="left-panel-inner">
        <div className="panel-header-area">
          <div className="panel-logo-container">
            <Map
              size={26}
              stroke="url(#panel-logo-grad)"
              strokeWidth={2.5}
              className="shrink-0"
            />
            <h1 className="app-logo-text text-gradient-animated">GeoSocial</h1>
          </div>
        </div>

        <div className="panel-content-area">{children}</div>

        <div className="panel-nav-bar">
          <Button
            variant="ghost"
            size="icon"
            className={getNavClass("profile")}
            onClick={() => onTabChange("profile")}
          >
            <User size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={getNavClass("search")}
            onClick={() => onTabChange("search")}
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
              onClick={() => onTabChange("chat")}
            >
              <MessageCircle size={24} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={getNavClass("settings")}
            onClick={() => onTabChange("settings")}
          >
            <Settings size={24} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
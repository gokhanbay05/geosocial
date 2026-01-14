import { useState, useMemo } from "react";
import "../../css/panels/RightPanel.css";
import { useUIStore } from "../../store/useUIStore";
import { usePostStore } from "../../store/usePostStore";
import StoryGrid from "../feed/StoryGrid";
import Button from "../core/Button";
import { X } from "lucide-react";

export default function RightPanel() {
  const { isRightPanelOpen, closeRightPanel } = useUIStore();
  const { clusterPosts } = usePostStore();

  const [sortBy, setSortBy] = useState("newest");

  const panelClass = `right-panel ${isRightPanelOpen ? "is-open" : ""}`;

  const sortedPosts = useMemo(() => {
    if (!clusterPosts) return [];

    return [...clusterPosts].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "mostLiked") {
        const likeCountA = a.stats?.likeCount ?? a.likes?.length ?? 0;
        const likeCountB = b.stats?.likeCount ?? b.likes?.length ?? 0;
        return likeCountB - likeCountA;
      }
      return 0;
    });
  }, [clusterPosts, sortBy]);

  return (
    <aside className={panelClass}>
      <div className="right-panel-inner">
        <div className="right-panel-header">
          <div className="panel-header">Posts in this area</div>
          <Button variant="ghost" size="icon" onClick={closeRightPanel}>
            <X size={20} />
          </Button>
        </div>

        <div className="right-panel-content">
          {clusterPosts && clusterPosts.length > 0 ? (
            <StoryGrid
              posts={sortedPosts}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          ) : (
            <div className="panel-empty-state">
              {clusterPosts
                ? "No posts found here yet."
                : "Click on a cluster on the map..."}
            </div>
          )}
        </div>

        <div className="right-panel-footer">
        </div>
      </div>
    </aside>
  );
}
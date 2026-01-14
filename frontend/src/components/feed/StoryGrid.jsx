import { useState, useEffect, useRef, useCallback } from "react";
import "../../css/feed/StoryGrid.css";
import { Play } from "lucide-react";
import {
  StoryVideo,
  StoryImage,
  StoryAuthor,
  StoryAuthorImage,
  StoryAuthorName,
} from "../kibo-ui/stories";

import { usePostStore } from "../../store/usePostStore";
import { useProfileStore } from "../../store/useProfileStore";
import Spinner from "../core/Spinner";
import Divider from "../core/Divider";
import { getFileUrl } from "../../lib/utils";
import SortSelect from "../core/SortSelect";

const ITEMS_PER_PAGE = 15;

export default function StoryGrid({ posts, sortBy, onSortChange }) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [posts, sortBy]);

  const visiblePosts = posts ? posts.slice(0, displayCount) : [];
  const hasMore = posts ? displayCount < posts.length : false;

  const lastElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
          }, 300);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  if (!posts || posts.length === 0) {
    return (
      <div className="panel-empty-state">No posts yet in this area.</div>
    );
  }

  return (
    <div className="story-grid-container">
      <div className="story-grid-header">
        <SortSelect value={sortBy} onChange={onSortChange} />
      </div>

      <div className="story-grid-scroll-area">
        <div className="story-grid-layout">
          {visiblePosts.map((post, index) => {
            if (index === visiblePosts.length - 1) {
              return (
                <div
                  ref={lastElementRef}
                  key={post._id}
                  className="story-grid-item"
                >
                  <StoryCard data={post} />
                </div>
              );
            }
            return (
              <div key={post._id} className="story-grid-item">
                <StoryCard data={post} />
              </div>
            );
          })}
        </div>

        {isLoadingMore && (
          <div className="story-grid-loader">
            <Spinner size="md" color="primary" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="story-grid-end-message">
            <Divider text="end of the day" />
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCard({ data }) {
  const { openPostDetail } = usePostStore();
  const { openProfile } = useProfileStore();

  const displayData = {
    ...data,
    mediaUrl: getFileUrl(data.mediaUrl),
    type: data.mediaType,
    user: {
      username: data.author?.username,
      avatar: getFileUrl(data.author?.avatarUrl),
    },
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (displayData.user.username) {
      openProfile(displayData.user.username);
    }
  };

  return (
    <div className="story-card group" onClick={() => openPostDetail(data)}>
      {displayData.type === "video" ? (
        <StoryVideo src={displayData.mediaUrl} />
      ) : (
        <StoryImage
          src={displayData.mediaUrl}
          alt={displayData.user.username}
        />
      )}

      <p className="story-description">{data.description}</p>

      <StoryAuthor>
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleProfileClick}
        >
          <StoryAuthorImage
            src={displayData.user.avatar}
            name={displayData.user.username}
          />
          <StoryAuthorName className="story-author-name">
            {displayData.user.username}
          </StoryAuthorName>
        </div>

        {displayData.type === "video" && (
          <div className="story-video-icon">
            <Play className="story-play-svg" />
          </div>
        )}
      </StoryAuthor>
    </div>
  );
}
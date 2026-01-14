import { useState, useEffect } from "react";
import "../css/pages/ProfilePage.css";
import Button from "../components/core/Button";
import Spinner from "../components/core/Spinner";
import { Avatar, AvatarImage, AvatarFallback } from "../components/core/avatar";
import { Camera, ArrowLeft } from "lucide-react";
import { useUIStore } from "../store/useUIStore";
import { usePostStore } from "../store/usePostStore";
import { useProfileStore } from "../store/useProfileStore";
import { useAuthStore } from "../store/useAuthStore";
import { getFileUrl } from "../lib/utils";
import { getUserProfile, followUser } from "../services/user.service";
import { getUserPosts } from "../services/post.service";
import { handleError } from "../lib/errorHandler";
import { StoryVideo } from "../components/kibo-ui/stories";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

export default function ProfilePage() {
  const { leftPanelTab, openModal, refreshTrigger } = useUIStore();
  const { openPostDetail } = usePostStore();
  const {
    viewingProfile,
    viewedProfileData,
    setViewedProfileData,
    resetProfileView,
  } = useProfileStore();
  const { setLeftPanelTab } = useUIStore();
  const { setSelectedConversation, conversations, fetchConversations } = useChatStore();

  const { user: currentUser, updateFollowStatus } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [userPost, setUserPost] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchProfile = async () => {
      if (leftPanelTab === "profile") {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (!viewingProfile) return;

      if (viewedProfileData && viewedProfileData.username === viewingProfile) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (viewingProfile === currentUser?.username) {
        if (isMounted) {
          setViewedProfileData(currentUser);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) setIsLoading(true);
      try {
        const data = await getUserProfile(viewingProfile, {
          signal: abortController.signal,
        });
        if (isMounted) setViewedProfileData(data);
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          handleError(error, { context: "FetchProfile" });
          resetProfileView();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [viewingProfile, currentUser, resetProfileView, leftPanelTab]);

  const displayData =
    leftPanelTab === "profile" ? currentUser : viewedProfileData;

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchUserPost = async () => {
      if (displayData?._id) {
        try {
          const posts = await getUserPosts(displayData._id, {
            signal: abortController.signal,
          });

          if (isMounted) {
            setUserPost(posts && posts.length > 0 ? posts[0] : null);
          }
        } catch (error) {
          if (error.name !== "CanceledError" && error.name !== "AbortError") {
            handleError(error, { context: "FetchUserPosts", showToast: false });
          }
        }
      }
    };

    fetchUserPost();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [displayData?._id, refreshTrigger]);

  const handleFollow = async () => {
    if (!displayData || !currentUser) return;

    if (displayData._id === currentUser._id) return;

    const isFollowing = displayData.followers.some(
      (f) => (f._id || f).toString() === currentUser._id.toString()
    );

    const prevFollowers = [...displayData.followers];
    const prevStats = { ...displayData.stats };
    const newIsFollowing = !isFollowing;

    let updatedFollowers = [...prevFollowers];
    if (newIsFollowing) {
      updatedFollowers.push(currentUser);
    } else {
      updatedFollowers = updatedFollowers.filter(
        (f) => (f._id || f).toString() !== currentUser._id.toString()
      );
    }

    const updatedStats = {
      ...prevStats,
      followerCount: newIsFollowing
        ? (prevStats.followerCount || 0) + 1
        : Math.max((prevStats.followerCount || 0) - 1, 0)
    };

    if (leftPanelTab !== "profile") {
      setViewedProfileData({
        ...displayData,
        followers: updatedFollowers,
        stats: updatedStats
      });
    }

    try {
      updateFollowStatus(displayData._id, newIsFollowing);
      await followUser(displayData._id);
    } catch (error) {
      if (leftPanelTab !== "profile") {
        setViewedProfileData({
          ...displayData,
          followers: prevFollowers,
          stats: prevStats,
        });
      }
      handleError(error, { context: "FollowUser" });
    }
  };

  const handleMessageClick = async () => {
    await fetchConversations();

    const currentConversations = useChatStore.getState().conversations;

    const existingConv = currentConversations.find(
      (c) => c.otherUser._id === displayData._id
    );

    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      setSelectedConversation({
        otherUser: displayData,
        isNewConversation: true,
      });
    }
    setLeftPanelTab("chat");
  };

  if (isLoading || !displayData) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const isMe = currentUser?._id === displayData._id;
  const showBackButton = leftPanelTab === "search";
  const isFollowingUser = displayData.followers?.some(
    (f) => (f._id || f).toString() === currentUser?._id?.toString()
  );

  const stats = displayData.stats || {
    followerCount: 0,
    followingCount: 0,
    totalLikesReceived: 0,
  };

  return (
    <div className="profile-page-container relative">
      {showBackButton && (
        <div className="profile-back-btn-container">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetProfileView}
            className="profile-back-btn"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-identity">
          <h2 className="profile-fullname">{displayData.username}</h2>
        </div>

        <div className="profile-mid-section">
          <Avatar className="profile-avatar-container">
            <AvatarImage
              src={getFileUrl(displayData.avatarUrl)}
              alt={displayData.username}
            />
            <AvatarFallback>
              {displayData.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="profile-stats-group">
            <div
              className="stat-box"
              onClick={() => openModal("followers", { users: displayData.followers })}
            >
              <span className="stat-number">{stats.followerCount}</span>
              <span className="stat-label">Followers</span>
            </div>

            <div
              className="stat-box"
              onClick={() => openModal("following", { users: displayData.following })}
            >
              <span className="stat-number">{stats.followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-box-like">
              <span className="stat-number">{stats.totalLikesReceived}</span>
              <span className="stat-label">Likes</span>
            </div>
          </div>
        </div>

        <div className="profile-bio">
          {displayData.bio || (isMe ? "No bio added yet." : "")}
        </div>

        <div className="profile-actions">
          {isMe ? (
            <Button
              variant="outline"
              size="md"
              className="w-full font-semibold rounded-xl"
              onClick={() => openModal("editProfile")}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="profile-actions-row">
              <Button
                variant={isFollowingUser ? "outline" : "primary"}
                size="md"
                className="profile-btn-follow rounded-xl"
                onClick={handleFollow}
              >
                {isFollowingUser ? "Unfollow" : "Follow"}
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="profile-btn-message rounded-xl"
                onClick={handleMessageClick}
              >
                <MessageCircle size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        className="daily-post-container group"
        onClick={() => userPost && openPostDetail(userPost)}
      >
        {userPost ? (
          <>
            {userPost.mediaType === "video" ? (
              <StoryVideo
                src={getFileUrl(userPost.mediaUrl)}
                className="daily-post-image"
              />
            ) : (
              <img
                src={getFileUrl(userPost.mediaUrl)}
                alt="Daily Post"
                className="daily-post-image"
              />
            )}
          </>
        ) : (
          <div className="empty-post-state">
            <div className="empty-post-icon-wrapper">
              <Camera size={28} className="empty-post-icon" />
            </div>
            <span className="empty-post-text">
              {isMe ? "No posts today" : "User has not posted today"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
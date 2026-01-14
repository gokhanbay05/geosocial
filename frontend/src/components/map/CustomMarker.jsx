import "../../css/map/CustomMarker.css";
import { Play } from "lucide-react";

export default function CustomMarker({ type, data, mediaType, onClick }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  const isLargeCluster = type === "cluster" && data > 100;
  const containerClass = `custom-marker ${isLargeCluster ? "large" : ""}`;

  return (
    <div className={containerClass} onClick={handleClick}>
      <svg
        viewBox="0 0 64 88"
        className="marker-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32,0C14.327,0,0,14.327,0,32c0,11.02,4.267,23.307,13.653,35.2C20.747,76.48,28.693,84.267,32,88c3.307-3.733,11.253-11.52,18.347-20.8C59.733,55.307,64,43.02,64,32C64,14.327,49.673,0,32,0z"
          className="marker-body"
        />
        <circle cx="32" cy="32" r="28" className="marker-inner-bg" />
      </svg>

      <div className="marker-content">
        {type === "photo" ? (
          mediaType === "video" ? (
            <div className="marker-video-placeholder">
              <Play size={18} fill="var(--color-primary)" className="text-(--color-primary)" />
            </div>
          ) : (
            <img
              src={data}
              alt="Snap"
              className="marker-image"
              draggable="false"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=Snap";
              }}
            />
          )
        ) : (
          <span className="marker-count">{data}</span>
        )}
      </div>
    </div>
  );
}

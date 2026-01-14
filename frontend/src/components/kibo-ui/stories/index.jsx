import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { cn } from "@/lib/utils";

const tRegex = /t=(\d+(?:\.\d+)?)/;

export const StoryVideo = ({ className, ...props }) => {
  const videoRef = useRef(null);
  const initialTimeRef = useRef(0);

  useEffect(() => {
    const src = props.src ?? "";
    let initialTime = 0;
    if (typeof src === "string") {
      const hashIndex = src.indexOf("#");
      if (hashIndex !== -1) {
        const hash = src.slice(hashIndex + 1);
        const tMatch = hash.match(tRegex);
        if (tMatch) {
          initialTime = Number.parseFloat(tMatch[1]);
        }
      }
    }
    initialTimeRef.current = initialTime;
  }, [props.src]);

  const handleMouseOver = () => {
    videoRef.current?.play();
  };

  const handleMouseOut = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = initialTimeRef.current;
    }
  };

  const handleFocus = () => {
    videoRef.current?.play();
  };

  const handleBlur = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = initialTimeRef.current;
    }
  };

  return (
    <video
      className={cn(
        "absolute inset-0 size-full object-cover",
        "transition-opacity duration-200",
        "group-hover:opacity-90",
        className
      )}
      loop
      muted
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseOut={handleMouseOut}
      onMouseOver={handleMouseOver}
      preload="metadata"
      ref={videoRef}
      tabIndex={0}
      {...props}
    />
  );
};

export const StoryImage = ({ className, alt, ...props }) => (
  <img
    alt={alt}
    className={cn(
      "absolute inset-0 h-full w-full object-cover",
      "transition-opacity duration-200",
      "group-hover:opacity-90",
      className
    )}
    {...props}
  />
);

export const StoryAuthor = ({ className, children, ...props }) => (
  <div
    className={cn(
      "absolute right-0 bottom-0 left-0 z-20",
      "p-3 text-white",
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

export const StoryAuthorImage = ({
  src,
  fallback,
  name,
  className,
  ...props
}) => (
  <Avatar className={cn("size-6 border border-white/20", className)} {...props}>
    {src && <AvatarImage alt={name} src={src} />}
    <AvatarFallback className="bg-white/10 text-white text-xs">
      {fallback || name?.charAt(0)?.toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

export const StoryAuthorName = ({ className, ...props }) => (
  <span className={cn("truncate font-medium text-sm", className)} {...props} />
);

export const StoryTitle = ({ className, ...props }) => (
  <div
    className={cn(
      "absolute top-0 right-0 left-0 z-10",
      "p-3 text-white",
      className
    )}
    {...props}
  />
);

export const StoryOverlay = ({ className, side = "bottom", ...props }) => {
  const positionClasses =
    side === "top" ? "top-0 bg-gradient-to-b" : "bottom-0 bg-gradient-to-t";

  return (
    <div
      className={cn(
        "absolute right-0 left-0 h-10 from-black/20 to-transparent",
        positionClasses,
        className
      )}
      {...props}
    />
  );
};

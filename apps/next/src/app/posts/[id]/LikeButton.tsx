"use client"; // everything imported by this file is sent to the browser and HYDRATED (made interactive)

import { useState } from "react";

// The server renders this to HTML first (so the count is visible immediately, even before JavaScript loads).
// In the browser, React then "hydrates" it: it attaches the click handler to that existing HTML.
export default function LikeButton({
  postId,
  initialLikes,
}: {
  postId: string;
  initialLikes: number;
}) {
  const [liked, setLiked] = useState(false);
  const likes = initialLikes + (liked ? 1 : 0);

  return (
    <p>
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => setLiked((value) => !value)}
        data-post={postId}
      >
        {liked ? "Liked" : "Like"} · {likes}
      </button>
    </p>
  );
}

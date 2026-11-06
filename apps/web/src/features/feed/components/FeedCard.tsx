import { memo } from "react";
import type { FeedPost } from "@hub/core";
import { Button, Column, Image, Row } from "@/shared/components";
import { useRenderCount } from "@/shared/hooks/useRenderCount";
import { FEED_IMAGE_SIZES, IMAGE_HEIGHT, IMAGE_WIDTH } from "../constants";
import { FEED_MESSAGES } from "../messages";
import styles from "./FeedCard.module.css";

type FeedCardProps = {
  post: FeedPost;
  saved: boolean;
  onToggleSave: (id: string) => void;
  priority?: boolean; // true for the first cards on screen: load their image right away
};

function FeedCard({ post, saved, onToggleSave, priority = false }: FeedCardProps) {
  useRenderCount("FeedCard");

  return (
    <article className={styles.card}>
      <Image
        className={styles.image}
        src={post.imageUrl}
        alt="" // decorative here; give meaningful alt text when the image carries information
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        sizes={FEED_IMAGE_SIZES}
        priority={priority}
      />
      <Column gap={2}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <Row
          gap={3}
          justify="between"
          wrap
          className={styles.meta}
        >
          <span>{post.author}</span>
          <span>{post.likes} likes</span>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
        </Row>
        <Button
          variant="secondary"
          aria-pressed={saved}
          onClick={() => onToggleSave(post.id)}
        >
          {saved ? FEED_MESSAGES.saved : FEED_MESSAGES.save}
        </Button>
      </Column>
    </article>
  );
}

// memo: skip re-rendering this card when ALL of its props are shallow-equal to last time.
export default memo(FeedCard);

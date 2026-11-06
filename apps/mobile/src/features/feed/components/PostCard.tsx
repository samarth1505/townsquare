import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import type { FeedPost } from "@hub/core";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import { radius, space } from "@/shared/theme/tokens";
import { useTheme } from "@/shared/theme/useTheme";
import { IMAGE_ASPECT_RATIO, IMAGE_FADE_MS, IMAGE_WIDTH_BY_VIEW } from "../constants";
import { FEED_MESSAGES } from "../messages";
import type { FeedView } from "../types";

type PostCardProps = {
  post: FeedPost;
  view: FeedView;
  width: number; // chosen by the list: one column = the screen, two columns = half each
  saved: boolean;
  onToggleSave: (id: string) => void;
};

function PostCard({ post, view, width, saved, onToggleSave }: PostCardProps) {
  const colors = useTheme();
  const isList = view === "list";

  return (
    <View
      style={[styles.card, { width, backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* expo-image: decodes off the JS thread, caches in memory AND on disk, fades in, understands SVG. recyclingKey
          tells it "this view now shows a different post, drop the old picture", which avoids flashes of a wrong image
          when a row is reused while scrolling. */}
      <Image
        source={{ uri: `${post.imageUrl}?w=${IMAGE_WIDTH_BY_VIEW[view]}` }}
        style={styles.image}
        contentFit="cover"
        transition={IMAGE_FADE_MS}
        cachePolicy="memory-disk"
        recyclingKey={post.id}
      />
      <View style={styles.body}>
        <AppText
          variant="label"
          numberOfLines={2}
        >
          {post.title}
        </AppText>
        {isList ? (
          <AppText
            variant="muted"
            numberOfLines={2}
          >
            {post.excerpt}
          </AppText>
        ) : null}
        <AppText
          variant="muted"
          numberOfLines={1}
        >
          {post.author} · {FEED_MESSAGES.likes(post.likes)}
        </AppText>
        <Button
          label={saved ? FEED_MESSAGES.saved : FEED_MESSAGES.save}
          accessibilityLabel={
            saved ? FEED_MESSAGES.savedLabel(post.title) : FEED_MESSAGES.saveLabel(post.title)
          }
          variant="secondary"
          onPress={() => onToggleSave(post.id)}
        />
      </View>
    </View>
  );
}

// memo: skip re-rendering this card when ALL of its props are shallow-equal to last time (same idea as on the web).
export default memo(PostCard);

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius, overflow: "hidden" },
  // aspectRatio + a known width = a known height BEFORE the picture arrives, so rows do not jump (the mobile CLS).
  image: { width: "100%", aspectRatio: IMAGE_ASPECT_RATIO },
  body: { padding: space.md, gap: space.sm },
});

import { FlatList, StyleSheet, View, type ListRenderItem } from "react-native";
import type { FeedPost } from "@hub/core";
import AppText from "@/shared/components/AppText";
import Screen from "@/shared/components/Screen";
import SegmentedControl from "@/shared/components/SegmentedControl";
import TextField from "@/shared/components/TextField";
import { space } from "@/shared/theme/tokens";
import {
  CARD_GAP,
  END_REACHED_THRESHOLD,
  FEED_TABS,
  FEED_VIEWS,
  INITIAL_NUM_TO_RENDER,
  MAX_TO_RENDER_PER_BATCH,
  SCREEN_PADDING,
  WINDOW_SIZE,
} from "../constants";
import { useFeedScreen } from "../hooks/useFeedScreen";
import { FEED_MESSAGES } from "../messages";
import FeedFooter from "./FeedFooter";
import FeedMessage from "./FeedMessage";
import FeedSkeleton from "./FeedSkeleton";
import PostCard from "./PostCard";

const TAB_OPTIONS = [
  { value: FEED_TABS.forYou, label: FEED_MESSAGES.tabForYou },
  { value: FEED_TABS.trending, label: FEED_MESSAGES.tabTrending },
] as const;
const VIEW_OPTIONS = [
  { value: FEED_VIEWS.list, label: FEED_MESSAGES.viewList },
  { value: FEED_VIEWS.grid, label: FEED_MESSAGES.viewGrid },
] as const;

// Defined OUTSIDE the component so its identity never changes: the list can skip work when props are unchanged.
const getPostId = (post: FeedPost) => post.id;
const Separator = () => <View style={styles.separator} />;

export default function FeedScreen() {
  const feed = useFeedScreen();

  // Rows are cheap to describe: renderItem only returns the card; all the data work happened in the hook.
  const renderItem: ListRenderItem<FeedPost> = ({ item }) => (
    <PostCard
      post={item}
      view={feed.view}
      width={feed.cardWidth}
      saved={feed.savedIds.has(item.id)}
      onToggleSave={feed.toggleSave}
    />
  );

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <AppText variant="title">{FEED_MESSAGES.title}</AppText>
        <TextField
          label={FEED_MESSAGES.searchLabel}
          hideLabel
          value={feed.search}
          onChangeText={feed.setSearch}
          placeholder={FEED_MESSAGES.searchPlaceholder}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        <View style={styles.controls}>
          <View style={styles.control}>
            <SegmentedControl
              label={FEED_MESSAGES.tabsLabel}
              hideLabel
              options={TAB_OPTIONS}
              value={feed.tab}
              onChange={feed.setTab}
            />
          </View>
          <View style={styles.control}>
            <SegmentedControl
              label={FEED_MESSAGES.viewLabel}
              hideLabel
              options={VIEW_OPTIONS}
              value={feed.view}
              onChange={feed.setView}
            />
          </View>
        </View>
      </View>

      {feed.isLoading ? (
        <FeedSkeleton />
      ) : feed.isError ? (
        <FeedMessage
          text={FEED_MESSAGES.loadError}
          isError
          actionLabel={FEED_MESSAGES.retry}
          onAction={feed.retry}
        />
      ) : (
        <FlatList
          // numColumns cannot change while a list is mounted (React Native throws). A new `key` makes React throw the
          // old list away and build a fresh one, which is the documented way to switch between list and grid.
          key={feed.view}
          data={feed.posts}
          keyExtractor={getPostId}
          renderItem={renderItem}
          numColumns={feed.columns}
          columnWrapperStyle={feed.columns > 1 ? styles.row : undefined}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={[styles.content, feed.isSearching && styles.dimmed]}
          ListEmptyComponent={
            <FeedMessage
              text={
                feed.debouncedSearch
                  ? FEED_MESSAGES.noMatches(feed.debouncedSearch)
                  : FEED_MESSAGES.empty
              }
            />
          }
          ListFooterComponent={
            <FeedFooter
              isFetchingNextPage={feed.isFetchingNextPage}
              isLoadMoreError={feed.isLoadMoreError}
              hasNextPage={feed.hasNextPage}
              hasPosts={feed.posts.length > 0}
              onRetry={feed.retryLoadMore}
            />
          }
          onEndReached={feed.loadMore}
          onEndReachedThreshold={END_REACHED_THRESHOLD}
          refreshing={feed.pullRefreshing}
          onRefresh={() => void feed.pullToRefresh()}
          initialNumToRender={INITIAL_NUM_TO_RENDER}
          windowSize={WINDOW_SIZE}
          maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: SCREEN_PADDING, gap: space.md },
  controls: { flexDirection: "row", gap: space.md },
  control: { flex: 1 }, // two equal halves
  content: { paddingHorizontal: SCREEN_PADDING, paddingBottom: SCREEN_PADDING },
  row: { gap: CARD_GAP },
  separator: { height: CARD_GAP },
  dimmed: { opacity: 0.6 },
});

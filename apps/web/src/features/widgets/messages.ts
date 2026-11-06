export const WIDGET_MESSAGES = {
  rail: "Widgets",
  topicsTitle: "Trending topics",
  suggestionsTitle: "People to follow",
  topicsFailed: "Trending topics couldn't be loaded.",
  suggestionsFailed: "Suggestions couldn't be loaded.",
  posts: (count: number) => `${count} posts`,
} as const;

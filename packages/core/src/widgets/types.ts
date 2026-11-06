export interface TrendingTopic {
  name: string;
  posts: number;
}

export interface SuggestedMember {
  id: string;
  name: string;
  role: string;
}

export interface WidgetItems<T> {
  items: T[];
}

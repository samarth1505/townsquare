import type { HttpClient } from "../http";
import { WIDGET_ENDPOINTS } from "./constants";
import type { SuggestedMember, TrendingTopic, WidgetItems } from "./types";

export function createWidgetsApi(http: HttpClient) {
  return {
    topics: () => http.get<WidgetItems<TrendingTopic>>(WIDGET_ENDPOINTS.topics),
    suggestions: () => http.get<WidgetItems<SuggestedMember>>(WIDGET_ENDPOINTS.suggestions),
  };
}

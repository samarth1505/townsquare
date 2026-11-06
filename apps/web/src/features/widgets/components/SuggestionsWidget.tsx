import { useSuggestions } from "../hooks/useSuggestions";
import { WIDGET_MESSAGES } from "../messages";
import WidgetCard from "./WidgetCard";
import styles from "./Widgets.module.css";

export default function SuggestionsWidget() {
  const { data, isPending } = useSuggestions();

  return (
    <WidgetCard
      title={WIDGET_MESSAGES.suggestionsTitle}
      loading={isPending}
    >
      <ul className={styles.list}>
        {data?.items.map((member) => (
          <li key={member.id}>
            {member.name} <span className={styles.muted}>{member.role}</span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

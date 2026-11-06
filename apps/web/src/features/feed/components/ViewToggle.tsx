import { Button, Row } from "@/shared/components";
import { FEED_VIEWS } from "../constants";
import { FEED_MESSAGES } from "../messages";
import type { FeedView } from "../types";

type ViewToggleProps = {
  value: FeedView;
  onChange: (view: FeedView) => void;
};

// Two buttons, one pressed: `aria-pressed` tells screen readers which layout is active.
export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <Row
      gap={2}
      align="center"
      role="group"
      aria-label={FEED_MESSAGES.viewLabel}
    >
      <Button
        variant={value === FEED_VIEWS.grid ? "primary" : "secondary"}
        aria-pressed={value === FEED_VIEWS.grid}
        onClick={() => onChange(FEED_VIEWS.grid)}
      >
        {FEED_MESSAGES.viewGrid}
      </Button>
      <Button
        variant={value === FEED_VIEWS.list ? "primary" : "secondary"}
        aria-pressed={value === FEED_VIEWS.list}
        onClick={() => onChange(FEED_VIEWS.list)}
      >
        {FEED_MESSAGES.viewList}
      </Button>
    </Row>
  );
}

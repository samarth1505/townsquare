import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotificationBell from "./NotificationBell";

describe("<NotificationBell />", () => {
  it("has a plain name and no badge when nothing is unread", () => {
    render(<NotificationBell count={0} />);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("announces the unread count in its accessible name", () => {
    render(<NotificationBell count={3} />);
    expect(screen.getByRole("button", { name: "Notifications, 3 unread" })).toBeInTheDocument();
  });

  it("caps the visible badge at 99+ (the name still carries the real number)", () => {
    render(<NotificationBell count={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications, 150 unread" })).toBeInTheDocument();
  });

  it("hides the visual badge from screen readers (the name already says it)", () => {
    render(<NotificationBell count={5} />);
    expect(screen.getByText("5")).toHaveAttribute("aria-hidden", "true");
  });

  it("passes other button props through (so the menu can add onClick, aria-expanded...)", () => {
    render(
      <NotificationBell
        count={1}
        aria-expanded="true"
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });
});

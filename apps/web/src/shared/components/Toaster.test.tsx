import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearToasts, showToast, TOAST_DURATION_MS } from "@/shared/lib/toasts";
import Toaster from "./Toaster";

describe("<Toaster />", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => {
    act(() => clearToasts()); // the toast store is a module singleton: reset it between tests
    vi.useRealTimers();
  });

  it("is a polite live region that exists even when there are no toasts", () => {
    render(<Toaster />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toBeEmptyDOMElement();
  });

  it("shows a toast when one is pushed from outside React", () => {
    render(<Toaster />);
    act(() => showToast({ id: "t1", title: "New message", body: "Hello" }));
    expect(screen.getByText("New message")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("does not show the same toast twice", () => {
    render(<Toaster />);
    act(() => {
      showToast({ id: "t1", title: "Once" });
      showToast({ id: "t1", title: "Once" });
    });
    expect(screen.getAllByText("Once")).toHaveLength(1);
  });

  it("shows only the newest three", () => {
    render(<Toaster />);
    act(() => {
      for (const n of [1, 2, 3, 4]) showToast({ id: `t${n}`, title: `Toast ${n}` });
    });
    expect(screen.queryByText("Toast 1")).not.toBeInTheDocument();
    expect(screen.getByText("Toast 4")).toBeInTheDocument();
  });

  it("dismisses itself after the duration", () => {
    render(<Toaster />);
    act(() => showToast({ id: "t1", title: "Bye" }));
    act(() => void vi.advanceTimersByTime(TOAST_DURATION_MS - 1));
    expect(screen.getByText("Bye")).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.queryByText("Bye")).not.toBeInTheDocument();
  });

  it("pauses while hovered and resumes when the pointer leaves", () => {
    render(<Toaster />);
    act(() => showToast({ id: "t1", title: "Read me" }));
    const toast = screen.getByText("Read me");

    fireEvent.mouseEnter(toast);
    act(() => void vi.advanceTimersByTime(TOAST_DURATION_MS * 3));
    expect(screen.getByText("Read me")).toBeInTheDocument(); // still here: the countdown is paused

    fireEvent.mouseLeave(toast);
    act(() => void vi.advanceTimersByTime(TOAST_DURATION_MS));
    expect(screen.queryByText("Read me")).not.toBeInTheDocument();
  });

  it("can be dismissed with the close button, which has an accessible name", () => {
    render(<Toaster />);
    act(() => showToast({ id: "t1", title: "Close me" }));

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Close me")).not.toBeInTheDocument();
  });
});

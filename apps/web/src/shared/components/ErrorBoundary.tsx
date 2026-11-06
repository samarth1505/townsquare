import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/shared/lib/reportError";

type FallbackArgs = { error: Error; reset: () => void };

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: (args: FallbackArgs) => ReactNode; // what to show instead of the crashed subtree
  resetKeys?: readonly unknown[]; // when any of these change, the boundary tries again automatically
};

type ErrorBoundaryState = { error: Error | null };

// An error boundary MUST be a class: React has no hook for catching render errors.
// It catches errors thrown while RENDERING its children (and in their lifecycle/effects),
// NOT errors in event handlers, async code (promises, setTimeout), or server rendering.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  // 1) Called during rendering after a child threw: switch to the "failed" state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  // 2) Called after the fallback is committed: the place for side effects such as reporting.
  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { componentStack: info.componentStack });
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    const changed =
      prev.resetKeys?.length !== this.props.resetKeys?.length ||
      prev.resetKeys?.some((key, i) => !Object.is(key, this.props.resetKeys?.[i]));
    if (this.state.error && changed) this.reset();
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    return error ? this.props.fallback({ error, reset: this.reset }) : this.props.children;
  }
}

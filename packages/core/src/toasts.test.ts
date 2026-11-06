import { describe, expect, it } from "vitest";
import { createToastStore, toastReducer } from "./toasts";

const toast = (id: string) => ({ id, title: `Toast ${id}` });

describe("toastReducer", () => {
  it("adds a toast", () => {
    expect(toastReducer([], { type: "toast/shown", toast: toast("a") })).toEqual([toast("a")]);
  });

  it("ignores a toast that is already showing (the SAME state object, so nobody is notified)", () => {
    const before = [toast("a")];
    expect(toastReducer(before, { type: "toast/shown", toast: toast("a") })).toBe(before);
  });

  it("keeps only the newest three", () => {
    const state = ["a", "b", "c", "d"].reduce(
      (current, id) => toastReducer(current, { type: "toast/shown", toast: toast(id) }),
      [] as ReturnType<typeof toast>[],
    );
    expect(state.map((t) => t.id)).toEqual(["b", "c", "d"]);
  });

  it("dismissing an unknown id changes nothing", () => {
    const before = [toast("a")];
    expect(toastReducer(before, { type: "toast/dismissed", id: "zzz" })).toBe(before);
  });

  it("clearing an empty list changes nothing", () => {
    const before: ReturnType<typeof toast>[] = [];
    expect(toastReducer(before, { type: "toast/cleared" })).toBe(before);
  });
});

describe("createToastStore", () => {
  it("show / dismiss / clear drive the store, and each app gets its OWN store", () => {
    const first = createToastStore();
    const second = createToastStore();
    first.show(toast("a"));
    first.show(toast("b"));
    first.dismiss("a");
    expect(first.store.getState().map((t) => t.id)).toEqual(["b"]);
    expect(second.store.getState()).toEqual([]);
    first.clear();
    expect(first.store.getState()).toEqual([]);
  });
});

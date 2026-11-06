import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendJson } from "./transport";

describe("sendJson", () => {
  const sendBeacon = vi.fn();
  const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));

  beforeEach(() => {
    sendBeacon.mockReset();
    fetchMock.mockClear();
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => void vi.unstubAllGlobals());

  it("uses sendBeacon with a text/plain body (a simple request: no CORS preflight)", async () => {
    sendBeacon.mockReturnValue(true);
    sendJson("http://x/collect", { a: 1 });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0] as [string, Blob];
    expect(url).toBe("http://x/collect");
    expect(blob.type).toBe("text/plain");
    expect(await blob.text()).toBe('{"a":1}');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to fetch with keepalive when the browser refuses the beacon", () => {
    sendBeacon.mockReturnValue(false);
    sendJson("http://x/collect", { a: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://x/collect",
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
  });

  it("falls back to fetch when sendBeacon does not exist", () => {
    Object.defineProperty(navigator, "sendBeacon", { value: undefined, configurable: true });
    sendJson("http://x/collect", { a: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never throws, even if everything fails", () => {
    sendBeacon.mockImplementation(() => {
      throw new Error("nope");
    });
    expect(() => sendJson("http://x/collect", { a: 1 })).not.toThrow();
  });
});

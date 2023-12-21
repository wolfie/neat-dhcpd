import { describe, expect, it } from "vitest";
import getBroadcastAddr from "./getBroadcastAddr";

describe("getBroadcastAddr", () => {
  it("works", () => {
    const ip = "192.168.0.3";
    const netmask = "255.255.254.0";
    expect(getBroadcastAddr(netmask, ip)).toBe("192.168.1.255");
  });
});

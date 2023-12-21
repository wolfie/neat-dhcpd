import { describe, it, expect } from "vitest";
import { splitBootpMessage } from "./splitBootpMessage";

describe("splitBootpMessage", () => {
  it("splits our response", () => {
    expect(
      splitBootpMessage(
        Buffer.from(
          "AgEGAN2D4+IAAAAAAAAAAMCoAG3AqAADAAAAAPqNbA6IBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjglNjNQECAQT///4AAwTAqAH+BhABAQEBAQAAAQgICAgIBgYIMwF4NgTAqAAD/wA=",
          "base64"
        )
      )
    ).toMatchObject({
      chaddr: Buffer.of(
        ...[250, 141, 108, 14, 136, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ),
      ciaddr: Buffer.of(0, 0, 0, 0),
      file: Buffer.of(
        ...[
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      flags: Buffer.of(0, 0),
      giaddr: Buffer.of(0, 0, 0, 0),
      hlen: Buffer.of(6),
      hops: Buffer.of(0),
      htype: Buffer.of(1),
      op: Buffer.of(2),
      options: Buffer.of(
        ...[
          99, 130, 83, 99, 53, 1, 2, 1, 4, 255, 255, 254, 0, 3, 4, 192, 168, 1,
          254, 6, 16, 1, 1, 1, 1, 1, 0, 0, 1, 8, 8, 8, 8, 8, 6, 6, 8, 51, 1,
          120, 54, 4, 192, 168, 0, 3, 255, 0,
        ]
      ),
      secs: Buffer.of(0, 0),
      siaddr: Buffer.of(...[192, 168, 0, 3]),
      sname: Buffer.of(
        ...[
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      xid: Buffer.of(...[221, 131, 227, 226]),
      yiaddr: Buffer.of(...[192, 168, 0, 109]),
    });
  });

  it("splits iphone request", () => {
    expect(
      splitBootpMessage(
        Buffer.from(
          "AQEGAN2D4+IAGQAAAAAAAAAAAAAAAAAAAAAAAPqNbA6IBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjglNjNQEBNwkBeQMGD2xyd/w5AgXcPQcB+o1sDogFMwQAdqcA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          "base64"
        )
      )
    ).toMatchObject({
      chaddr: Buffer.of(
        ...[250, 141, 108, 14, 136, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ),
      ciaddr: Buffer.of(0, 0, 0, 0),
      file: Buffer.of(
        ...[
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      flags: Buffer.of(0, 0),
      giaddr: Buffer.of(0, 0, 0, 0),
      hlen: Buffer.of(6),
      hops: Buffer.of(0),
      htype: Buffer.of(1),
      op: Buffer.of(1),
      options: Buffer.of(
        ...[
          99, 130, 83, 99, 53, 1, 1, 55, 9, 1, 121, 3, 6, 15, 108, 114, 119,
          252, 57, 2, 5, 220, 61, 7, 1, 250, 141, 108, 14, 136, 5, 51, 4, 0,
          118, 167, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      secs: Buffer.of(0, 25),
      siaddr: Buffer.of(0, 0, 0, 0),
      sname: Buffer.of(
        ...[
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      xid: Buffer.of(221, 131, 227, 226),
      yiaddr: Buffer.of(0, 0, 0, 0),
    });
  });

  it("splits known good offer", () => {
    expect(
      splitBootpMessage(
        Buffer.from(
          "AgEGAKt4qPgAAAAAAAAAAMCoAAPAqAD+AAAAAADYYXqymAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjglNjNQECNgTAqAD+MwT/////AQT///4AHATAqAH/BgjAqAECAQEBAQMEwKgA/v8AAAAAAAAAAAAAAAAAAAAA",
          "base64"
        )
      )
    ).toMatchObject({
      chaddr: Buffer.of(
        ...[0, 216, 97, 122, 178, 152, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ),
      ciaddr: Buffer.of(0, 0, 0, 0),
      file: Buffer.of(
        ...[
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      flags: Buffer.of(0, 0),
      giaddr: Buffer.of(0, 0, 0, 0),
      hlen: Buffer.of(6),
      hops: Buffer.of(0),
      htype: Buffer.of(1),
      op: Buffer.of(2),
      options: Buffer.of(
        ...[
          99, 130, 83, 99, 53, 1, 2, 54, 4, 192, 168, 0, 254, 51, 4, 255, 255,
          255, 255, 1, 4, 255, 255, 254, 0, 28, 4, 192, 168, 1, 255, 6, 8, 192,
          168, 1, 2, 1, 1, 1, 1, 3, 4, 192, 168, 0, 254, 255, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      secs: Buffer.of(0, 0),
      siaddr: Buffer.of(192, 168, 0, 254),
      sname: Buffer.of(
        ...[
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
      ),
      xid: Buffer.of(171, 120, 168, 248),
      yiaddr: Buffer.of(192, 168, 0, 3),
    });
  });
});

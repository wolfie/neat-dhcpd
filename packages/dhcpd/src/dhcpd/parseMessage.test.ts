import { describe, it, expect } from "vitest";
import { parseMessage } from "./parseMessage";

describe("parseMessage", () => {
  it("parses our response message", () => {
    expect(
      parseMessage({
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
            99, 130, 83, 99, 53, 1, 2, 1, 4, 255, 255, 254, 0, 3, 4, 192, 168,
            1, 254, 6, 16, 1, 1, 1, 1, 1, 0, 0, 1, 8, 8, 8, 8, 8, 6, 6, 8, 51,
            1, 120, 54, 4, 192, 168, 0, 3, 255, 0,
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
      })
    ).toMatchObject({
      broadcastFlag: false,
      chaddr: "fa:8d:6c:0e:88:05",
      ciaddr: "0.0.0.0",
      file: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      giaddr: "0.0.0.0",
      hlen: 6,
      hops: 0,
      htype: "Ethernet (10 Mb)",
      op: "BOOTREPLY",
      options: {
        magicCookie: "0x63825363",
        options: [
          {
            content: Buffer.of(2),
            hex: "02",
            isParsed: false,
            optionCode: 53,
          },
          {
            content: Buffer.of(255, 255, 254, 0),
            hex: "fffffe00",
            isParsed: false,
            optionCode: 1,
          },
          {
            content: Buffer.of(192, 168, 1, 254),
            hex: "c0a801fe",
            isParsed: false,
            optionCode: 3,
          },
          {
            content: Buffer.of(
              ...[1, 1, 1, 1, 1, 0, 0, 1, 8, 8, 8, 8, 8, 6, 6, 8]
            ),
            hex: "01010101010000010808080808060608",
            isParsed: false,
            optionCode: 6,
          },
          {
            content: Buffer.of(120),
            hex: "78",
            isParsed: false,
            optionCode: 51,
          },
          {
            content: Buffer.of(192, 168, 0, 3),
            hex: "c0a80003",
            isParsed: false,
            optionCode: 54,
          },
        ],
      },
      secs: 0,
      siaddr: "192.168.0.3",
      sname:
        "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      xid: "0xdd83e3e2",
      yiaddr: "192.168.0.109",
    });
  });

  it("parses iphone's request message", () =>
    expect(
      parseMessage({
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
      })
    ).toMatchObject({
      broadcastFlag: false,
      chaddr: "fa:8d:6c:0e:88:05",
      ciaddr: "0.0.0.0",
      file: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      giaddr: "0.0.0.0",
      hlen: 6,
      hops: 0,
      htype: "Ethernet (10 Mb)",
      op: "BOOTREQUEST",
      options: {
        magicCookie: "0x63825363",
        options: [
          {
            content: Buffer.of(1),
            hex: "01",
            isParsed: false,
            optionCode: 53,
          },
          {
            content: Buffer.of(...[1, 121, 3, 6, 15, 108, 114, 119, 252]),
            hex: "017903060f6c7277fc",
            isParsed: false,
            optionCode: 55,
          },
          {
            content: Buffer.of(5, 220),
            hex: "05dc",
            isParsed: false,
            optionCode: 57,
          },
          {
            content: Buffer.of(...[1, 250, 141, 108, 14, 136, 5]),
            hex: "01fa8d6c0e8805",
            isParsed: false,
            optionCode: 61,
          },
          {
            content: Buffer.of(0, 118, 167, 0),
            hex: "0076a700",
            isParsed: false,
            optionCode: 51,
          },
        ],
      },
      secs: 25,
      siaddr: "0.0.0.0",
      sname:
        "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      xid: "0xdd83e3e2",
      yiaddr: "0.0.0.0",
    }));

  it("derps the dorps", () => {
    expect(
      parseMessage({
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
            255, 255, 1, 4, 255, 255, 254, 0, 28, 4, 192, 168, 1, 255, 6, 8,
            192, 168, 1, 2, 1, 1, 1, 1, 3, 4, 192, 168, 0, 254, 255, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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
      })
    ).toMatchObject({
      broadcastFlag: false,
      chaddr: "00:d8:61:7a:b2:98",
      ciaddr: "0.0.0.0",
      file: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      giaddr: "0.0.0.0",
      hlen: 6,
      hops: 0,
      htype: "Ethernet (10 Mb)",
      op: "BOOTREPLY",
      options: {
        magicCookie: "0x63825363",
        options: [
          {
            content: Buffer.of(2),
            hex: "02",
            isParsed: false,
            optionCode: 53,
          },
          {
            content: Buffer.of(192, 168, 0, 254),
            hex: "c0a800fe",
            isParsed: false,
            optionCode: 54,
          },
          {
            content: Buffer.of(255, 255, 255, 255),
            hex: "ffffffff",
            isParsed: false,
            optionCode: 51,
          },
          {
            content: Buffer.of(255, 255, 254, 0),
            hex: "fffffe00",
            isParsed: false,
            optionCode: 1,
          },
          {
            content: Buffer.of(192, 168, 1, 255),
            hex: "c0a801ff",
            isParsed: false,
            optionCode: 28,
          },
          {
            content: Buffer.of(192, 168, 1, 2, 1, 1, 1, 1),
            hex: "c0a8010201010101",
            isParsed: false,
            optionCode: 6,
          },
          {
            content: Buffer.of(192, 168, 0, 254),
            hex: "c0a800fe",
            isParsed: false,
            optionCode: 3,
          },
        ],
      },
      secs: 0,
      siaddr: "192.168.0.254",
      sname:
        "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      xid: "0xab78a8f8",
      yiaddr: "192.168.0.3",
    });
  });
});

import { NextRequest } from "next/server";
import { createMocks } from "node-mocks-http";
import { GET } from "./route";
import { Packet } from "dns2";

jest.mock("dns2", () => ({
  Packet: {
    udpQuery: jest.fn(),
    TYPES: {
      1: "A",
      28: "AAAA",
    },
  },
}));

describe("DNS Lookup API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if parameters are missing", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {},
    });

    await GET(req as unknown as NextRequest);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Missing required parameters",
    });
  });

  it("should return DNS lookup results", async () => {
    const mockAnswers = [
      { type: 1, data: "93.184.216.34" },
      { type: 28, data: "2606:2800:220:1:248:1893:25c8:1946" },
    ];

    (Packet.udpQuery as jest.Mock).mockResolvedValue({
      question: [{ name: "example.com", type: "A" }],
      answers: mockAnswers,
    });

    const { req, res } = createMocks({
      method: "GET",
      query: {
        domain: "example.com",
        recordType: "A",
        nameserver: "8.8.8.8",
      },
    });

    await GET(req as unknown as NextRequest);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      domain: "example.com",
      recordType: "A",
      nameserver: "8.8.8.8",
      results: [
        { type: "A", value: "93.184.216.34" },
        { type: "AAAA", value: "2606:2800:220:1:248:1893:25c8:1946" },
      ],
    });
  });

  it("should handle DNS lookup errors", async () => {
    (Packet.udpQuery as jest.Mock).mockRejectedValue(
      new Error("DNS query failed")
    );

    const { req, res } = createMocks({
      method: "GET",
      query: {
        domain: "example.com",
        recordType: "A",
        nameserver: "8.8.8.8",
      },
    });

    await GET(req as unknown as NextRequest);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "DNS lookup failed",
      details: "DNS query failed",
    });
  });
});

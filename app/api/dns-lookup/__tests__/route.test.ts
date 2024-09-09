import { NextRequest } from "next/server";
import { GET } from "../route";

describe("DNS Lookup API", () => {
  it("should return 400 if parameters are missing", async () => {
    const mockRequest = new NextRequest(
      new Request("http://localhost:3000/api/dns-lookup")
    );

    const response = await GET(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({
      error: "Missing required parameters",
    });
  });

  it("should perform a real DNS lookup and return results", async () => {
    const mockRequest = new NextRequest(
      new Request(
        "http://localhost:3000/api/dns-lookup?domain=example.com&type=A"
      )
    );
    const response = await GET(mockRequest);
    console.log('Full response:', JSON.stringify(await response.json(), null, 2));
    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("results");
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);

    const firstResult = data.results[0];
    expect(firstResult).toHaveProperty("type", "A");
    expect(firstResult).toHaveProperty("name", "example.com");
    expect(firstResult).toHaveProperty("address");
    expect(firstResult.address).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });
});

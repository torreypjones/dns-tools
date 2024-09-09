import { NextRequest, NextResponse } from "next/server";
import dns from "dns";
import { promisify } from "util";

const resolveDns = promisify(dns.resolve);

export async function GET(request: NextRequest) {
  console.log("DNS lookup API route called, getting params");
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const recordType = searchParams.get("recordType");
  const nameserver = searchParams.get("nameserver");

  console.log(
    `the route was called with domain: ${domain}, recordType: ${recordType}, nameserver: ${nameserver}`
  );
  if (!domain || !recordType || !nameserver) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }
  console.log(`GET we have the needed params`);

  try {
    dns.setServers([nameserver]);
    console.log(`GET we have set the nameserver to ${nameserver}`);
    const results = await resolveDns(domain, recordType as any);
    console.log(`GET we have the results ${results}`);

    return NextResponse.json({
      domain,
      recordType,
      nameserver,
      results: results.map((value) => ({ type: recordType, value })),
    });
  } catch (error) {
    console.error("DNS lookup error:", error);
    return NextResponse.json({ error: "DNS lookup failed" }, { status: 500 });
  }
}

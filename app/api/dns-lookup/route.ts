import { NextRequest, NextResponse } from "next/server";
import { TCPClient } from "dns2";

const DNS_TYPES: Record<number, string> = {
  1: "A",
  2: "NS",
  3: "MD",
  4: "MF",
  5: "CNAME",
  6: "SOA",
  7: "MB",
  8: "MG",
  9: "MR",
  10: "NULL",
  11: "WKS",
  12: "PTR",
  13: "HINFO",
  14: "MINFO",
  15: "MX",
  16: "TXT",
  17: "RP",
  18: "AFSDB",
  19: "X25",
  20: "ISDN",
  21: "RT",
  22: "NSAP",
  23: "NSAP-PTR",
  24: "SIG",
  25: "KEY",
  26: "PX",
  27: "GPOS",
  28: "AAAA",
  29: "LOC",
  30: "NXT",
  31: "EID",
  32: "NIMLOC",
  33: "SRV",
  34: "ATMA",
  35: "NAPTR",
  36: "KX",
  37: "CERT",
  38: "A6",
  39: "DNAME",
  40: "SINK",
  41: "OPT",
  42: "APL",
  43: "DS",
  44: "SSHFP",
  45: "IPSECKEY",
  46: "RRSIG",
  47: "NSEC",
  48: "DNSKEY",
  49: "DHCID",
  50: "NSEC3",
  51: "NSEC3PARAM",
  52: "TLSA",
  53: "SMIMEA",
  55: "HIP",
  56: "NINFO",
  57: "RKEY",
  58: "TALINK",
  59: "CDS",
  60: "CDNSKEY",
  61: "OPENPGPKEY",
  62: "CSYNC",
  63: "ZONEMD",
  64: "SVCB",
  65: "HTTPS",
  99: "SPF",
  100: "UINFO",
  101: "UID",
  102: "GID",
  103: "UNSPEC",
  104: "NID",
  105: "L32",
  106: "L64",
  107: "LP",
  108: "EUI48",
  109: "EUI64",
  249: "TKEY",
  250: "TSIG",
  251: "IXFR",
  252: "AXFR",
  253: "MAILB",
  254: "MAILA",
  255: "ANY",
  256: "URI",
  257: "CAA",
  258: "AVC",
  259: "DOA",
  260: "AMTRELAY",
};

const DNS_CLASSES: Record<number, string> = {
  1: "IN", // Internet
  2: "CS", // CSNET (obsolete)
  3: "CH", // CHAOS
  4: "HS", // Hesiod
  254: "NONE", // Used in dynamic update operations
  255: "ANY", // Wildcard match
};

interface DNSRecord {
  name: string;
  ttl: number;
  type: string;
  class: string;
  address?: string;
  target?: string;
  preference?: number;
  exchange?: string;
  text?: string;
  mname?: string;
  rname?: string;
  serial?: number;
  refresh?: number;
  retry?: number;
  expire?: number;
  minimum?: number;
  value?: string | any;
}

export async function GET(request: NextRequest) {
  console.log("DNS lookup API route called, getting params");
  let searchParams;
  try {
    searchParams = new URL(request.url).searchParams;
  } catch (error) {
    console.error("Invalid URL:", error);
    return NextResponse.json({ error: "Invalid request URL" }, { status: 400 });
  }

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
    console.log(
      `GET attempting DNS query to ${nameserver} for ${domain} with record type ${recordType}`
    );

    const resolve = TCPClient({ dns: nameserver });

    let results = [];
    const missingRecords: string[] = [];

    if (recordType.toUpperCase() === "ANY") {
      for (const [typeNum, typeName] of Object.entries(DNS_TYPES)) {
        try {
          const response = await resolve(domain, typeName);
          results.push(...response.answers);
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes("NXDOMAIN") ||
              error.message.includes("NOERROR") ||
              error.message.includes("SERVFAIL"))
          ) {
            missingRecords.push(typeName);
          } else {
            console.error(`Error querying ${typeName} record:`, error);
          }
        }
      }
      console.log(`Records not found for ${domain}:`, missingRecords);
    } else {
      const response = await resolve(domain, recordType);
      results = response.answers;
    }

    console.log(`GET we have ${results.length} results`, results);

    const formattedResults = results
      .map((answer: any) => ({
        name: answer.name,
        ttl: answer.ttl,
        type: DNS_TYPES[answer.type] || `TYPE${answer.type}`,
        class: DNS_CLASSES[answer.class] || `CLASS${answer.class}`,
        ...formatRecordData(answer),
      }))
      .filter(
        (formattedAnswer: any) =>
          recordType.toUpperCase() === "ANY" ||
          formattedAnswer.type === recordType.toUpperCase()
      );

    // Remove duplicates
    const uniqueResults = Array.from(
      new Set(
        formattedResults.map((r: DNSRecord) => JSON.stringify(r))
      ) as Set<string>
    ).map((r: string) => JSON.parse(r) as DNSRecord);

    return NextResponse.json({
      domain,
      recordType,
      nameserver,
      results: uniqueResults,
    });
  } catch (error) {
    console.error("DNS lookup error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "DNS lookup failed" }, { status: 500 });
  }
}

function formatRecordData(answer: any) {
  switch (answer.type) {
    case 1: // A
      return { address: answer.address };
    case 28: // AAAA
      return { address: answer.address };
    case 2: // NS
      return { target: answer.ns };
    case 5: // CNAME
      return { target: answer.domain };
    case 15: // MX
      return {
        preference: answer.priority,
        exchange: answer.exchange,
      };
    case 16: // TXT
      return {
        text: Array.isArray(answer.data)
          ? answer.data.map((d: any) => d.toString()).join("")
          : answer.data?.toString() || "",
      };
    case 6: // SOA
      return {
        mname: answer.primary,
        rname: answer.admin,
        serial: answer.serial,
        refresh: answer.refresh,
        retry: answer.retry,
        expire: answer.expire,
        minimum: answer.minimum,
      };
    default:
      return { value: answer.address || answer.data };
  }
}

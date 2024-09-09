import axios from "axios";
import { diffWords } from "diff";

export const dnsLookup = async (
  domain: string,
  recordType: string,
  nameserver: string
): Promise<{
  domain: string;
  recordType: string;
  nameserver: string;
  results: Array<{ type: string; value: string }>;
}> => {
  console.log(
    `Starting DNS lookup for domain: ${domain}, recordType: ${recordType}, nameserver: ${nameserver}`
  );
  try {
    const response = await axios.get("/api/dns-lookup", {
      params: { domain, recordType, nameserver },
    });
    console.log(`DNS lookup successful. Response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("DNS lookup failed:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    console.log(`Returning empty result for domain: ${domain}`);
    return {
      domain,
      recordType,
      nameserver,
      results: [],
    };
  }
};

// Function to generate diff highlighting
export const generateDiff = (
  str1: string | undefined | null,
  str2: string | undefined | null
): { left: string; right: string } => {
  //   console.log(`Generating diff for strings: "${str1}" and "${str2}"`);

  // Handle undefined or null values
  const safeStr1 = str1 ?? "";
  const safeStr2 = str2 ?? "";

  const differences = diffWords(safeStr1, safeStr2);

  let left = "";
  let right = "";

  differences.forEach((part) => {
    if (part.removed) {
      left += `<span class="bg-red-200">${part.value}</span>`;
      right += " ".repeat(part.value.length);
    } else if (part.added) {
      left += " ".repeat(part.value.length);
      right += `<span class="bg-green-200">${part.value}</span>`;
    } else {
      left += part.value;
      right += part.value;
    }
  });

  //   console.log(`Diff result: Left: "${left}", Right: "${right}"`);
  return { left, right };
};

// Function to generate DNS diff highlighting
const getCompareValue = (record: any, recordType: string) => {
  switch (recordType) {
    case "A":
    case "AAAA":
      return record.address;
    case "MX":
      return `${record.priority}${record.exchange}`;
    // case "TXT":
    //   return record.entries.join("");
    // case "NS":
    case "CNAME":
      return record.value;
    default:
      return JSON.stringify(record);
  }
};

export const sortDNSRecords = (records: any[], recordType: string) => {
  //   console.log(`Sorting records for type: ${recordType}`, records);
  return records.sort((a, b) => {
    const getCompareValue = (record: any) => {
      if (!record) {
        console.warn("Encountered undefined record while sorting");
        return "";
      }
      switch (recordType) {
        case "A":
        case "AAAA":
          return record.value || "";
        case "MX":
          return record.value || "";
        case "TXT":
          return record.value || "";
        case "NS":
        case "CNAME":
          return record.value || "";
        default:
          return JSON.stringify(record) || "";
      }
    };
    const valueA = getCompareValue(a);
    const valueB = getCompareValue(b);
    // console.log(`Comparing values: "${valueA}" and "${valueB}"`);
    return (valueA || "").localeCompare(valueB || "");
  });
};

export const generateDNSDiff = (
  records1: Record<string, any[]>,
  records2: Record<string, any[]>
): Record<string, { left: string; right: string }> => {
  const diff: Record<string, { left: string; right: string }> = {};

  for (const recordType in records1) {
    const sorted1 = sortDNSRecords(records1[recordType], recordType);
    const sorted2 = sortDNSRecords(records2[recordType], recordType);

    const str1 = sorted1.map((r) => JSON.stringify(r, null, 2)).join("\n");
    const str2 = sorted2.map((r) => JSON.stringify(r, null, 2)).join("\n");

    if (str1 !== str2) {
      diff[recordType] = generateDiff(str1, str2);
    }
  }

  return diff;
};

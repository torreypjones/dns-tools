export type DnsLookupFunction = (
  domain: string,
  recordType: string,
  nameserver: string
) => DnsLookupResult;

// Update any references to mockDnsLookup in type definitions

import { dnsLookup } from '../utils/dnsUtils';

// ... existing code ...

const performLookup = async () => {
  const results = dnsLookup(domain, recordType, nameserver);
  setResults(results);
};

// ... rest of the file ...
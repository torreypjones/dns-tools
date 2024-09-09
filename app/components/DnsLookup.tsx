import { dnsLookup } from '../utils/dnsUtils';

// ... existing code ...

const handleLookup = async () => {
  const results = dnsLookup(domain, recordType, nameserver);
  setLookupResults(results);
};

// ... rest of the file ...
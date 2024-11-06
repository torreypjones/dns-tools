import { dnsLookup } from '../utils/dnsUtils';
import { useState } from 'react';

const [domain, setDomain] = useState('');
const [recordType, setRecordType] = useState('A');
const [nameserver, setNameserver] = useState('');
const [results, setResults] = useState<any[]>([]);

const performLookup = async () => {
  if (!domain || !recordType || !nameserver) return;
  const lookupResults = await dnsLookup(domain, recordType, nameserver);
  setResults(lookupResults.results);
};

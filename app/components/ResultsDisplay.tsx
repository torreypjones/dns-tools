import React from 'react';
import { diffWords, Change } from 'diff';
import { sortDNSRecords } from '../utils/dnsUtils';

interface ResultsDisplayProps {
  results: {
    domain: string;
    results: {
      domain: string;
      recordType: string;
      nameserver: string;
      results: Array<{
        name: string;
        ttl: number;
        type: string;
        class: string;
        address?: string;
        preference?: number;
        exchange?: string;
        value?: string;
        entries?: string[];
        target?: string;
        mname?: string;
        rname?: string;
        serial?: number;
        refresh?: number;
        retry?: number;
        expire?: number;
        minimum?: number;
        [key: string]: any; // For any other fields
      }>;
    }[];
    diff?: Record<string, { left: string; right: string }>;
  }[];
  compareMode: boolean;
  selectedRecordType: string | null; // Add this line
}

export function ResultsDisplay({ results, compareMode, selectedRecordType }: ResultsDisplayProps) {
  if (results.length === 0) return null;

  // Reintroduce the filterRecordsByType function
  const filterRecordsByType = (records: any[]) => {
    return selectedRecordType ? records.filter(r => r.type === selectedRecordType) : records;
  };

  // Filter results at the top level
  const filteredResults = results.map(result => ({
    ...result,
    results: result.results.map(res => ({
      ...res,
      results: filterRecordsByType(res.results)
    }))
  }));

  const formatRecordValue = (record: any) => {
    if (!record) return '';
    
    switch (record.type) {
      case 'A':
      case 'AAAA':
        return record.address || '';
      case 'MX':
        return `${record.preference.toString().padStart(2)} ${record.exchange}`;
      case 'TXT':
        return record.text ? `"${record.text}"` : '';
      //   case 'NS':
      case 'CNAME':
        return record.target || '';
      case 'SOA':
        return `${record.mname} ${record.rname} ${record.serial} ${record.refresh} ${record.retry} ${record.expire} ${record.minimum}`;
      default:
        const { name, ttl, class: classField, ...rest } = record;
        return JSON.stringify(rest);
    }
  };

  const formatRecord = (record: any) => {
    const value = formatRecordValue(record);
    // Right-align the TTL value within its field
    const ttlField = record.ttl.toString().padStart(7);
    return `${record.name.padEnd(30)} ${ttlField} ${record.class.padEnd(5)} ${record.type.padEnd(10)} ${value}`.trim();
  };

  const generateDiff = (left: string, right: string) => {
    const changes = diffWords(left, right);
    return changes.map((change: Change, index: number) => (
      <span key={index} className={change.added ? 'bg-green-100' : change.removed ? 'bg-red-100' : ''}>
        {change.value}
      </span>
    ));
  };

  const compareRecords = (leftRecords: any[], rightRecords: any[]) => {
    // Remove the filtering here as it's already done
    const recordTypes = Array.from(new Set([...leftRecords, ...rightRecords].map(r => r.type)));
    
    return recordTypes.map(type => {
      const leftTypeRecords = leftRecords.filter(r => r.type === type);
      const rightTypeRecords = rightRecords.filter(r => r.type === type);
      
      // Custom sorting function
      const sortRecords = (records: any[]) => {
        return records.sort((a, b) => {
          // First, sort by name
          const nameCompare = a.name.localeCompare(b.name);
          if (nameCompare !== 0) return nameCompare;
          
          // If names are the same, sort by value
          const aValue = formatRecordValue(a);
          const bValue = formatRecordValue(b);
          return aValue.localeCompare(bValue);
        });
      };

      const sortedLeftRecords = sortRecords(leftTypeRecords);
      const sortedRightRecords = sortRecords(rightTypeRecords);
      
      const leftFormatted = sortedLeftRecords.map(formatRecord).join('\n');
      const rightFormatted = sortedRightRecords.map(formatRecord).join('\n');
      
    //   console.log(`Type: ${type}`);
    //   console.log('Left Formatted:\n', leftFormatted);
    //   console.log('Right Formatted:\n', rightFormatted);
      
      if (leftFormatted === rightFormatted) {
        console.log('No differences found');
        return null; // No differences for this record type
      }
      
      const diff = generateDiff(leftFormatted, rightFormatted);
      
      return (
        <div key={type} className="mb-6">
          <h4 className="text-lg font-semibold mb-2">{type} Records</h4>
          <div className="font-mono text-sm bg-gray-50 p-2 rounded overflow-x-auto">
            <pre className="whitespace-pre">{diff}</pre>
          </div>
        </div>
      );
    }).filter(Boolean); // Remove null entries (record types with no differences)
  };

  return (
    <div className="space-y-8">
      {filteredResults.map((result, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">{result.domain}</h3>
          {compareMode ? (
            <div>
              <div className="flex justify-between mb-4">
                <h5 className="font-medium">{result.results[0].nameserver}</h5>
                <h5 className="font-medium">{result.results[1].nameserver}</h5>
              </div>
              {compareRecords(result.results[0].results, result.results[1].results)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {result.results.map((res, resIndex) => (
                <div key={resIndex} className={`mb-6 ${resIndex > 0 ? 'md:border-l md:pl-4' : ''}`}>
                  <h5 className="font-medium mb-2">{res.nameserver}</h5>
                  <div className="font-mono overflow-x-auto">
                    <pre className="whitespace-pre">
                      {res.results.map((record, recordIndex) => (
                        <div key={recordIndex}>{formatRecord(record)}</div>
                      ))}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
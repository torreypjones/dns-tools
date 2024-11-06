'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardCopy, Download, Loader2 } from 'lucide-react'
import { sortDNSRecords, dnsLookup, generateDNSDiff } from './utils/dnsUtils'
import { DomainInput } from './components/DomainInput'
import { RecordTypeSelect } from './components/RecordTypeSelect'
import { NameserverSelect } from './components/NameserverSelect'
import { CompareSwitch } from './components/CompareSwitch'
import { ResultsDisplay } from './components/ResultsDisplay'
import pLimit from 'p-limit';

// Update the DNSRecord type to make required fields non-optional
type DNSRecord = {
  type: string;
  value: string;
  name: string;
  ttl: number;
  class: string;
  address?: string;
  preference?: number;
  exchange?: string;
  [key: string]: any;
}

type DNSResult = {
  domain: string;
  recordType: string;
  nameserver: string;
  results: DNSRecord[];
}

type DomainResult = {
  domain: string;
  results: DNSResult[];
  diff?: Record<string, any>;
}

// Add this new type for ResultsDisplay props
type ResultsDisplayProps = {
  results: DomainResult[];
  compareMode: boolean;
  selectedRecordType: string;
}

export default function DNSTools() {
  const [domains, setDomains] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [nameserver1, setNameserver1] = useState('8.8.8.8')
  // const [nameserver2, setNameserver2] = useState('Cloudflare')
  const [nameserver2, setNameserver2] = useState('162.159.8.185')
  const [compareMode, setCompareMode] = useState(false)
  const [results, setResults] = useState<DomainResult[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleLookup = async () => {
    setError('')
    setIsLoading(true)
    setResults([]) // Clear previous results
    const domainList = domains.split('\n').map(d => d.trim()).filter(d => d);
    
    if (domainList.length === 0) {
      setError('Please enter at least one domain');
      setIsLoading(false)
      return;
    }

    const totalLookups = compareMode ? domainList.length * 2 : domainList.length;
    setProgress({ current: 0, total: totalLookups })

    try {
      const limit = pLimit(8); // Limit to 4 concurrent requests

      const lookupPromises = domainList.flatMap(domain => [
        limit(() => dnsLookupWithProgress(domain, recordType, nameserver1)),
        ...(compareMode ? [limit(() => dnsLookupWithProgress(domain, recordType, nameserver2))] : [])
      ]);

      const lookupResults = await Promise.all(lookupPromises);

      const newResults = domainList.map((domain, index) => {
        const result1 = lookupResults[index * (compareMode ? 2 : 1)] as DNSResult;
        result1.results = sortDNSRecords(result1.results, recordType);

        if (compareMode) {
          const result2 = lookupResults[index * 2 + 1] as DNSResult;
          result2.results = sortDNSRecords(result2.results, recordType);
          const diff = generateDNSDiff(
            { [recordType]: result1.results },
            { [recordType]: result2.results }
          );
          return { domain, results: [result1, result2], diff } as DomainResult;
        }

        return { domain, results: [result1] } as DomainResult;
      });

      setResults(newResults);
    } catch (error) {
      setError('An error occurred during the DNS lookup')
    } finally {
      setIsLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  // Update progress after each individual lookup
  const dnsLookupWithProgress = async (domain: string, recordType: string, nameserver: string) => {
    const result = await dnsLookup(domain, recordType, nameserver);
    setProgress(prev => ({ ...prev, current: prev.current + 1 }));
    return result;
  }

  const copyResults = () => {
    const text = results.map(r => 
      r.results.map(res => `${res.domain} (${res.recordType}):\n${res.results.map(record => `  ${record.type}: ${record.value}`).join('\n')}`).join('\n\n')
    ).join('\n\n')
    navigator.clipboard.writeText(text)
  }

  const exportCSV = () => {
    const csv = [
      ['Domain', 'Record Type', 'Nameserver', 'Result Type', 'Result Value'],
      ...results.flatMap(r => 
        r.results.flatMap(res => 
          res.results.map(record => [res.domain, res.recordType, res.nameserver, record.type, record.value])
        )
      )
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'dns_results.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6 transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-800">DNS Tools</h1>
        
        <div className="space-y-4">
          <DomainInput domains={domains} setDomains={setDomains} />
          <div className="flex flex-wrap gap-4">
            <RecordTypeSelect recordType={recordType} setRecordType={setRecordType} />
            <NameserverSelect label="Nameserver 1" value={nameserver1} onChange={setNameserver1} />
            {compareMode && (
              <NameserverSelect label="Nameserver 2" value={nameserver2} onChange={setNameserver2} />
            )}
          </div>

          <CompareSwitch compareMode={compareMode} setCompareMode={setCompareMode} />

          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleLookup} 
              className="w-full sm:w-auto relative" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                'Perform DNS Lookup'
              )}
            </Button>
            {isLoading && (
              <div className="text-sm text-gray-500">
                Processing {progress.current} of {progress.total} domains
              </div>
            )}
          </div>

          {isLoading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          )}

          {error && <div className="text-red-500 font-semibold">{error}</div>}

          <ResultsDisplay 
            results={results} 
            compareMode={compareMode} 
            selectedRecordType={recordType}
          />

          {results.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyResults} className="flex items-center">
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copy Results
              </Button>
              <Button onClick={exportCSV} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
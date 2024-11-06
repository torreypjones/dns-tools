import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const nameservers = [
  { name: 'ns1.markmonitor.com', ip: 'ns1.markmonitor.com' },
  { name: 'ns47.domaincontrol.com', ip: 'ns47.domaincontrol.com' },
  { name: 'ns-cloud-c1.googledomains.com', ip: 'ns-cloud-c1.googledomains.com' },
  { name: 'ns-cloud-d1.googledomains.com', ip: 'ns-cloud-d1.googledomains.com' },
  { name: 'ns-cloud-e1.googledomains.com', ip: 'ns-cloud-e1.googledomains.com' },
  { name: 'ns48.domaincontrol.com', ip: 'ns48.domaincontrol.com' },
  { name: 'ns-cloud-c2.googledomains.com', ip: 'ns-cloud-c2.googledomains.com' },
  { name: 'ns-cloud-c3.googledomains.com', ip: 'ns-cloud-c3.googledomains.com' },
  { name: 'ns-cloud-c4.googledomains.com', ip: 'ns-cloud-c4.googledomains.com' },
  { name: 'ns-cloud-d2.googledomains.com', ip: 'ns-cloud-d2.googledomains.com' },
  { name: 'ns-cloud-d3.googledomains.com', ip: 'ns-cloud-d3.googledomains.com' },
  { name: 'ns-cloud-d4.googledomains.com', ip: 'ns-cloud-d4.googledomains.com' },
  { name: 'Google', ip: '8.8.8.8' },
  { name: 'Cloudflare', ip: '1.1.1.1' },
  { name: 'OpenDNS', ip: '208.67.222.222' },
  { name: 'Quad9', ip: '9.9.9.9' },
  { name: 'Verisign', ip: '64.6.64.6' },
  { name: 'Comodo Secure DNS', ip: '8.26.56.26' },
  { name: 'AdGuard DNS', ip: '94.140.14.14' },
  { name: 'CleanBrowsing', ip: '185.228.168.9' },
  { name: 'ns2.markmonitor.com', ip: '162.159.9.229' },
  { name: 'ns3.markmonitor.com', ip: '162.159.10.22' },
  { name: 'ns4.markmonitor.com', ip: '162.159.11.100' },
  { name: 'ns5.markmonitor.com', ip: '162.159.12.75' },
  { name: 'ns6.markmonitor.com', ip: '162.159.13.131' },
  { name: 'ns7.markmonitor.com', ip: '162.159.14.2' },
  { name: 'star-mini.c10r.facebook.com.', ip: 'star-mini.c10r.facebook.com.' },
  { name: 'z-p42-instagram.c10r.instagram.com.', ip: 'z-p42-instagram.c10r.instagram.com.' },
  { name: 'ns-440.awsdns-55.com.', ip: 'ns-440.awsdns-55.com.' },
  { name: 'ns-2048.awsdns-64.com', ip: 'ns-2048.awsdns-64.com' },
  { name: 'ns-2049.awsdns-65.net', ip: 'ns-2049.awsdns-65.net' },
]

export function NameserverSelect({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) {
  const [resolvedNameservers, setResolvedNameservers] = useState(nameservers)

  useEffect(() => {
    const resolveNameservers = async () => {
      const resolved = await Promise.all(
        nameservers.map(async (ns) => {
          if (/.+\.com/.test(ns.name)) {
            try {
              const response = await fetch(`/api/dns-lookup?domain=${ns.name}&recordType=A&nameserver=8.8.8.8`)
              if (!response.ok) throw new Error('DNS lookup failed')
              const data = await response.json()
              const ip = data.results[0]?.address
              return ip ? { ...ns, ip } : ns
            } catch (error) {
              console.error(`Failed to resolve ${ns.name}:`, error)
              return ns
            }
          }
          return ns
        })
      )
      setResolvedNameservers(resolved)
    }

    resolveNameservers()
  }, [])

  return (
    <div className="w-full sm:w-auto">
      <Label htmlFor={label} className="text-gray-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={label} className="w-full">
          <SelectValue placeholder="Select nameserver" />
        </SelectTrigger>
        <SelectContent>
          {resolvedNameservers.map(ns => (
            <SelectItem key={ns.ip} value={ns.ip}>{ns.name} ({ns.ip})</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function DomainInput({ domains, setDomains }) {
  return (
    <div>
      <Label htmlFor="domains" className="text-gray-700">Domain(s)</Label>
      <Textarea
        id="domains"
        placeholder="Enter domain(s), one per line"
        value={domains}
        onChange={(e) => setDomains(e.target.value)}
        className="mt-1 w-full"
      />
    </div>
  )
}
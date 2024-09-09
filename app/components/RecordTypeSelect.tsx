import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'ANY']

export function RecordTypeSelect({ recordType, setRecordType }) {
  return (
    <div className="w-full sm:w-auto">
      <Label htmlFor="recordType" className="text-gray-700">Record Type</Label>
      <Select value={recordType} onValueChange={setRecordType}>
        <SelectTrigger id="recordType" className="w-full">
          <SelectValue placeholder="Select record type" />
        </SelectTrigger>
        <SelectContent>
          {recordTypes.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
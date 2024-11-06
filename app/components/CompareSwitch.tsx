import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function CompareSwitch({ 
  compareMode, 
  setCompareMode 
}: { 
  compareMode: boolean;
  setCompareMode: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="compare-mode"
        checked={compareMode}
        onCheckedChange={setCompareMode}
      />
      <Label htmlFor="compare-mode" className="text-gray-700">Compare nameservers</Label>
    </div>
  )
}
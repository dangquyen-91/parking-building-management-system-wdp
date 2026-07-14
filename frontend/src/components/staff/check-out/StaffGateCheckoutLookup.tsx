import { Input } from '../../ui/input'
import { StaffGateField } from '../common/StaffGateField'
import { StaffGateCameraScanner } from '../scanner/StaffGateCameraScanner'

type StaffGateCheckoutLookupProps = {
  query: string
  onQueryChange: (value: string) => void
}

export function StaffGateCheckoutLookup({
  query,
  onQueryChange,
}: StaffGateCheckoutLookupProps) {
  return (
    <>
      <StaffGateCameraScanner gate="exit" onUsePlate={onQueryChange} />

      <StaffGateField label="Biển số xe">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="VD: 61K-424.94"
          className="h-14 rounded-xl border-2 bg-background text-lg font-bold uppercase tracking-[0.1em] focus-visible:border-emerald-500"
        />
      </StaffGateField>
    </>
  )
}

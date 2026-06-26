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

      <StaffGateField label="Biển số / mã phiên">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Nhập biển số hoặc mã phiên"
          className="auth-input h-14 rounded-xl border px-4 text-lg font-bold uppercase tracking-[0.08em] text-fg"
        />
      </StaffGateField>
    </>
  )
}

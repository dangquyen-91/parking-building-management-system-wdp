import { RefreshCw } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Card, CardContent } from '../../ui/card'

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: string
  min?: string
  max?: string
  onChange: (value: string) => void
}) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      <Input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
    </Label>
  )
}

export function AdminReportFilters({
  from,
  to,
  peakDays,
  loading,
  onFromChange,
  onToChange,
  onPeakDaysChange,
  onApply,
}: {
  from: string
  to: string
  peakDays: number
  loading: boolean
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onPeakDaysChange: (value: number) => void
  onApply: () => void
}) {
  return (
    <Card className="w-full xl:min-w-[52rem]">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <DateField
          label="Từ ngày"
          value={from}
          max={to}
          onChange={onFromChange}
        />
        <DateField
          label="Đến ngày"
          value={to}
          min={from}
          onChange={onToChange}
        />
        <Label className="grid gap-2">
          <span>Khoảng giờ cao điểm</span>
          <NativeSelect
            value={peakDays}
            onChange={(e) => onPeakDaysChange(Number(e.target.value))}
          >
            <NativeSelectOption value={7}>7 ngày gần nhất</NativeSelectOption>
            <NativeSelectOption value={14}>14 ngày gần nhất</NativeSelectOption>
            <NativeSelectOption value={30}>30 ngày gần nhất</NativeSelectOption>
          </NativeSelect>
        </Label>
        <Button
          type="button"
          disabled={loading || !from || !to || from > to}
          onClick={onApply}
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </Button>
      </CardContent>
    </Card>
  )
}

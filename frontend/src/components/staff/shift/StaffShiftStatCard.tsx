import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import type { ShiftStat } from './staffShiftUtils'

const SHIFT_TONE_CLASS: Record<ShiftStat['tone'], string> = {
  sky: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  violet: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
}

export function StaffShiftStatCard({ stat }: { stat: ShiftStat }) {
  return (
    <Card className={SHIFT_TONE_CLASS[stat.tone]}>
      <CardHeader>
        <CardDescription className="text-current/75">{stat.label}</CardDescription>
        <CardTitle className="text-2xl">{stat.value}</CardTitle>
        <p className="text-xs text-current/70">{stat.detail}</p>
      </CardHeader>
    </Card>
  )
}

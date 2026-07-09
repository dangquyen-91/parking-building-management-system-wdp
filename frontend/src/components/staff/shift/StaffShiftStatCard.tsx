import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import type { ShiftStat } from './staffShiftUtils'

export function StaffShiftStatCard({ stat }: { stat: ShiftStat }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{stat.label}</CardDescription>
        <CardTitle className="text-2xl">{stat.value}</CardTitle>
        <p className="text-xs text-muted-foreground">{stat.detail}</p>
      </CardHeader>
    </Card>
  )
}

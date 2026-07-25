import { Children, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Column = { label: string; className?: string }
type Props = {
  eyebrow: string
  title: string
  countLabel: string
  columns: Column[]
  children: ReactNode
  minWidth?: string
  defaultPageSize?: number
}

export function AdminTableShell({
  eyebrow,
  title,
  countLabel,
  columns,
  children,
  minWidth = '960px',
  defaultPageSize = 10,
}: Props) {
  const rows = useMemo(() => Children.toArray(children), [children])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const first = (page - 1) * pageSize
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => setPage((value) => Math.min(value, totalPages)), [totalPages])
  useEffect(() => setPage(1), [rows.length])
  /* eslint-enable react-hooks/set-state-in-effect */
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-4 md:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-base font-bold text-foreground">{title}</h2>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          {countLabel}
        </Badge>
      </div>
      <Table className="table-fixed" style={{ minWidth }}>
        <TableHeader className="bg-muted/55">
          <TableRow className="hover:bg-muted/55">
            {columns.map((column) => (
              <TableHead
                key={column.label}
                className={`h-12 px-4 text-xs font-semibold text-muted-foreground ${column.className ?? ''}`}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{rows.slice(first, first + pageSize)}</TableBody>
      </Table>
      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Hiển thị {rows.length ? first + 1 : 0}-
            {Math.min(first + pageSize, rows.length)} trong {rows.length}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger
              className="h-8 w-[92px] rounded-lg text-xs"
              aria-label="Số dòng mỗi trang"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 dòng</SelectItem>
              <SelectItem value="20">20 dòng</SelectItem>
              <SelectItem value="50">50 dòng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Trước
          </Button>
          <span className="min-w-20 text-center text-xs font-semibold">
            Trang {page}/{totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </section>
  )
}

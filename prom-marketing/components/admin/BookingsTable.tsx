"use client";
import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface BookingRow {
  id: string;
  cal_booking_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  created_at: string;
}

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "scheduled_at", desc: true }]);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.attendee_name.toLowerCase().includes(q) ||
      r.attendee_email.toLowerCase().includes(q) ||
      (r.attendee_phone ?? "").toLowerCase().includes(q)
    );
  }, [rows, filter]);

  const columns = useMemo<ColumnDef<BookingRow>[]>(() => [
    {
      accessorKey: "attendee_name",
      header: "Име",
      cell: (info) => (
        <div>
          <p className="font-medium">{info.getValue<string>()}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">{info.row.original.attendee_email}</p>
        </div>
      ),
    },
    { accessorKey: "attendee_phone", header: "Телефон", cell: (info) => info.getValue() ?? "—" },
    {
      accessorKey: "scheduled_at",
      header: "Час",
      cell: (info) => format(new Date(info.getValue<string>()), "d MMM yyyy, HH:mm", { locale: bg }),
    },
    { accessorKey: "duration_minutes", header: "Мин", cell: (info) => `${info.getValue()}m` },
    {
      accessorKey: "status",
      header: "Статус",
      cell: (info) => {
        const s = info.getValue<string>();
        const tone = s === "confirmed" ? "text-emerald-300" : s === "cancelled" ? "text-red-300" : "text-amber-300";
        return <span className={tone}>{s}</span>;
      },
    },
  ], []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const exportCSV = () => {
    const header = ["Име", "Имейл", "Телефон", "Час", "Минути", "Статус"];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [r.attendee_name, r.attendee_email, r.attendee_phone ?? "",
         r.scheduled_at, r.duration_minutes, r.status]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
    );
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Търси по име, имейл или телефон"
          className="flex-1 min-w-[240px] rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-cyan)]"
        />
        <Button variant="outline" onClick={exportCSV}>Експорт CSV</Button>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" ? " ↑" : h.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-[var(--color-text-tertiary)]">
                  Няма заявки
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
        <span>
          Страница {table.getState().pagination.pageIndex + 1} от {table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Предишна
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Следваща
          </Button>
        </div>
      </div>
    </div>
  );
}

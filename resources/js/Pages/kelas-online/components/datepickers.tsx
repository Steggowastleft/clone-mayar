import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// DateTimePicker
// ─────────────────────────────────────────────
export function DateTimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { date: Date | undefined; time: string };
  onChange: (v: { date: Date | undefined; time: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition text-gray-500">
              <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
              {value.date
                ? format(value.date, "dd MMMM yyyy", { locale: idLocale })
                : "Pilih tanggal..."}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[200]" align="start">
            <Calendar
              mode="single"
              selected={value.date}
              onSelect={(d) => { onChange({ ...value, date: d }); setOpen(false); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <input
          type="time"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          className="w-28 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm hover:border-gray-300 transition"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DatePickerField
// ─────────────────────────────────────────────
export function DatePickerField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
        {label}{" "}
        {optional && <span className="text-gray-400 font-normal">(Opsional)</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className={cn(
            "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition",
            value ? "text-gray-800" : "text-gray-400"
          )}>
            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
            {value ? format(value, "dd MMMM yyyy", { locale: idLocale }) : "Pilih tanggal..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[300]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); setOpen(false); }}
            initialFocus
          />
          {value && optional && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500"
                onClick={() => { onChange(undefined); setOpen(false); }}
              >
                Hapus tanggal
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

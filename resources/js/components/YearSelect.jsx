import React from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";

const ALL = 'semua'

/**
 * Registration year filter. `value` is a year or '' / 'semua' for every year;
 * onChange receives the year or 'semua'.
 */
const YearSelect = ({value, options, onChange, className})=>(
    <Select value={value || ALL} onValueChange={onChange}>
        <SelectTrigger className={cn("bg-background", className)} aria-label="Tahun pendaftaran"><SelectValue/></SelectTrigger>
        <SelectContent>
            <SelectItem value={ALL}>Semua tahun</SelectItem>
            {options.map(option => <SelectItem key={option.value} value={option.value}>Tahun {option.label}</SelectItem>)}
        </SelectContent>
    </Select>
)

export default YearSelect

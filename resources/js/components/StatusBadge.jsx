import React from "react";
import {Badge} from "@/components/ui/badge";

const styles = {
    pengisian_data: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    menunggu_verifikasi: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    perlu_perbaikan: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    terverifikasi: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    lulus: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    tidak_lulus: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

const StatusBadge = ({status, label})=>(
    <Badge className={styles[status] ?? styles.pengisian_data}>{label}</Badge>
)

export default StatusBadge

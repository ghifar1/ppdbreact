import React from "react";
import {Link} from "@inertiajs/react";
import AdminNav from "../../Layouts/AdminNav";
import {PageTitle} from "../../Layouts/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

const Dashboard = ({jenjang, status, total})=>{

    return (
        <>
            <PageTitle>Dashboard Admin</PageTitle>

            <div className="grid gap-6 mb-6 md:grid-cols-3">
                {jenjang.map(item => (
                    <Card key={item.value}>
                        <CardHeader>
                            <CardDescription>{item.label}</CardDescription>
                            <CardTitle className="text-3xl">{item.total}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            {item.menunggu > 0 ? (
                                <Link href={`/admin/siswa?jenjang=${item.value}&status=menunggu_verifikasi`}
                                      className="font-medium text-amber-700 hover:underline dark:text-amber-400">
                                    {item.menunggu} menunggu verifikasi →
                                </Link>
                            ) : (
                                <span className="text-muted-foreground">Tidak ada yang menunggu verifikasi</span>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Status pendaftaran</CardTitle>
                    <CardDescription>{total} siswa terdaftar di semua jenjang.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {status.map(item => (
                            <li key={item.value}>
                                <Link href={`/admin/siswa?status=${item.value}`}
                                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                                    <StatusBadge status={item.value} label={item.label}/>
                                    <span className="text-lg font-semibold">{item.total}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </>
    )
}

Dashboard.layout = page => <AdminNav>{page}</AdminNav>

export default Dashboard

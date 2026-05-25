import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function AdminIndex() {
  return (
    <div className="p-6">
      <Head title="Admin" />
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-2">
        <Link href="/admin/verifications/manage">
          <Button>Permintaan Verifikasi</Button>
        </Link>
      </div>
    </div>
  );
}

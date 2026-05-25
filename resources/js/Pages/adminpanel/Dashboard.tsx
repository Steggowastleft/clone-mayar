import React from 'react';
import { Head } from '@inertiajs/react';
import AdminDashboard from '@/components/adminpanel/AdminDashboard';
import DashboardLayout from '@/components/dashboard/dashboardlayout';

export default function Dashboard(props: any) {
  return (
    <DashboardLayout title="Admin Dashboard">
      <AdminDashboard {...props} />
    </DashboardLayout>
  );
}

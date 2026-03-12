'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleIcon, LayoutDashboard, Package, Users, Activity, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/services', icon: Package, label: 'Services' },
    { href: '/admin/clients', icon: Users, label: 'Clients' },
    { href: '/admin/activity', icon: Activity, label: 'Activity Log' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="flex items-center mb-8">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-lg font-semibold">Admin</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                  pathname === item.href ? 'bg-gray-800 text-white' : ''
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to portal
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}

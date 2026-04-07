import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CalendarDays,
    ListChecks,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { to: '/leaves', icon: ListChecks, label: 'Leaves' },
    { to: '/allocations', icon: Settings, label: 'Allocations' },
];

const adminItems = [
    { to: '/admin', icon: Shield, label: 'Admin Panel' },
];

export default function Layout() {
    const { user, profile, isAdmin, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const allItems = [...navItems, ...(isAdmin ? adminItems : [])];

    return (
        <div className="min-h-screen bg-bg flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-lighter/30 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-6 border-b border-surface-lighter/30">
                    <h1 className="text-xl font-bold text-text-bright flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-primary" />
                        LeaveTracker
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {allItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-text-muted hover:bg-surface-light hover:text-text'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-surface-lighter/30">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                                {profile?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        id="sign-out-btn"
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen flex flex-col">
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-surface-lighter/30">
                    <button
                        id="mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-text-bright flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        LeaveTracker
                    </h1>
                    <div className="w-9" />
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

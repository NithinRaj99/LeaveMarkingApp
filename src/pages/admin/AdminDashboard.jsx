import { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LEAVE_COLORS } from '../../lib/constants';
import { Users, Mail, Shield, ChevronRight, Loader2, Search } from 'lucide-react';

export default function AdminDashboard() {
    const { users, allLeaves, loading, getUserStats, sendPasswordReset } = useAdmin();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [resettingPassword, setResettingPassword] = useState(null);

    const filteredUsers = users.filter(
        (u) =>
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePasswordReset = async (email) => {
        setResettingPassword(email);
        const { error } = await sendPasswordReset(email);
        setResettingPassword(null);
        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            alert(`Password reset email sent to ${email}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-bright flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Admin Panel
                </h1>
                <p className="text-text-muted text-sm mt-1">
                    {users.length} users · {allLeaves.length} total leave entries
                </p>
            </div>

            {/* Org-wide stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-primary/15">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm text-text-muted">Total Users</span>
                    </div>
                    <p className="text-3xl font-bold text-text-bright">{users.length}</p>
                </div>
                <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-warning/15">
                            <Mail className="w-5 h-5 text-warning" />
                        </div>
                        <span className="text-sm text-text-muted">Total Leaves Taken</span>
                    </div>
                    <p className="text-3xl font-bold text-text-bright">{allLeaves.length}</p>
                </div>
                <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-success/15">
                            <Shield className="w-5 h-5 text-success" />
                        </div>
                        <span className="text-sm text-text-muted">Admins</span>
                    </div>
                    <p className="text-3xl font-bold text-text-bright">
                        {users.filter((u) => u.role === 'admin').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    id="admin-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-surface-lighter text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Search users by name or email..."
                />
            </div>

            {/* User list + detail panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User list */}
                <div className="lg:col-span-1 bg-surface rounded-2xl border border-surface-lighter/30 overflow-hidden">
                    <div className="p-4 border-b border-surface-lighter/30">
                        <h2 className="font-semibold text-text-bright">Users</h2>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-light transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-primary/10' : ''
                                    }`}
                            >
                                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                    {(user.full_name || user.email || '?')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text truncate">
                                        {user.full_name || 'No Name'}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                                </div>
                                {user.role === 'admin' && (
                                    <span className="px-2 py-0.5 bg-primary/15 text-primary text-[10px] font-medium rounded-full">
                                        ADMIN
                                    </span>
                                )}
                                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-2">
                    {selectedUser ? (
                        <UserDetailPanel
                            user={selectedUser}
                            stats={getUserStats(selectedUser.id)}
                            onResetPassword={() => handlePasswordReset(selectedUser.email)}
                            resetting={resettingPassword === selectedUser.email}
                        />
                    ) : (
                        <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-12 text-center text-text-muted">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Select a user to view their details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function UserDetailPanel({ user, stats, onResetPassword, resetting }) {
    return (
        <div className="space-y-4">
            {/* User info */}
            <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                            {(user.full_name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-bright">{user.full_name || 'No Name'}</h2>
                            <p className="text-sm text-text-muted">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onResetPassword}
                        disabled={resetting}
                        className="flex items-center gap-2 px-4 py-2 bg-warning/15 text-warning rounded-xl text-sm font-medium hover:bg-warning/25 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Reset Password
                    </button>
                </div>

                <div className="text-sm text-text-muted">
                    <span>Role: </span>
                    <span className={`font-medium ${user.role === 'admin' ? 'text-primary' : 'text-text'}`}>
                        {user.role}
                    </span>
                    <span className="mx-2">·</span>
                    <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Leave stats */}
            <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-6">
                <h3 className="font-semibold text-text-bright mb-4">Leave Balance</h3>
                {stats.stats.length === 0 ? (
                    <p className="text-text-muted text-sm">No allocations found</p>
                ) : (
                    <div className="space-y-3">
                        {stats.stats.map((s) => {
                            const pct = s.totalAllowed > 0 ? (s.taken / s.totalAllowed) * 100 : 0;
                            const isExceeded = s.remaining < 0;
                            return (
                                <div key={s.leaveType}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: LEAVE_COLORS[s.leaveType]?.bg }}
                                            />
                                            <span className="text-sm text-text">{s.leaveType}</span>
                                        </div>
                                        <span className={`text-sm font-medium ${isExceeded ? 'text-danger' : 'text-text-muted'}`}>
                                            {s.taken} / {s.totalAllowed}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-surface-lighter rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(pct, 100)}%`,
                                                backgroundColor: isExceeded ? '#ef4444' : LEAVE_COLORS[s.leaveType]?.bg,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent leaves */}
            <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-6">
                <h3 className="font-semibold text-text-bright mb-4">
                    Recent Leaves ({stats.leaves.length})
                </h3>
                {stats.leaves.length === 0 ? (
                    <p className="text-text-muted text-sm">No leaves recorded</p>
                ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {stats.leaves.slice(0, 20).map((leave) => (
                            <div
                                key={leave.id}
                                className="flex items-center gap-3 p-3 bg-surface-light/50 rounded-xl"
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: LEAVE_COLORS[leave.leave_type]?.bg }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text">{leave.leave_type}</p>
                                    <p className="text-xs text-text-muted">
                                        {new Date(leave.start_date).toLocaleDateString()}
                                        {leave.start_date !== leave.end_date &&
                                            ` - ${new Date(leave.end_date).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-lg ${leave.duration === 'half_day' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
                                        }`}
                                >
                                    {leave.duration === 'half_day' ? '½ Day' : 'Full'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

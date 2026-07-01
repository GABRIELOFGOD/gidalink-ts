'use client';
import { useState, useEffect } from 'react';
import { Avatar, Badge, Spinner } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Search } from 'lucide-react';
import type { IUser } from '@/types';
import toast from 'react-hot-toast';

const roleColors: Record<string, 'blue' | 'green' | 'orange' | 'red'> = { student: 'blue', hostel_owner: 'green', agent: 'orange', admin: 'red' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleSuspend = async (user: IUser) => {
    const reason = !user.isSuspended ? prompt('Reason for suspension:') : '';
    if (!user.isSuspended && reason === null) return;
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isSuspended: !user.isSuspended, suspensionReason: reason }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(user.isSuspended ? 'User reactivated' : 'User suspended');
      fetchUsers();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="hostel_owner">Hostel Owner</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <Button onClick={fetchUsers}>Filter</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">User</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={u.profilePhoto} name={u.name} size="sm" /><div><p className="font-medium text-gray-800">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td>
                  <td className="px-5 py-4"><Badge variant={roleColors[u.role]} className="capitalize">{u.role.replace('_', ' ')}</Badge></td>
                  <td className="px-5 py-4">{u.isSuspended ? <Badge variant="red">Suspended</Badge> : <Badge variant="green">Active</Badge>}</td>
                  <td className="px-5 py-4 text-right">{u.role !== 'admin' && <Button size="sm" variant={u.isSuspended ? 'secondary' : 'danger'} onClick={() => toggleSuspend(u)}>{u.isSuspended ? 'Reactivate' : 'Suspend'}</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Spinner } from '@/components/ui/index';
import AnonymousAvatar from '@/components/ui/AnonymousAvatar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import { getDeviceId } from '@/lib/deviceId';
import { formatCurrency, formatDate } from '@/lib/utils';
import { GraduationCap, MapPin, Wallet, MessageCircle, Phone, Droplets, Zap, Shield, Trash2, User as UserIcon } from 'lucide-react';
import type { IRoommateRequest } from '@/types';
import toast from 'react-hot-toast';

const genderColors: Record<string, 'blue' | 'orange' | 'gray'> = { Male: 'blue', Female: 'orange', Any: 'gray' };

export default function RoommateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<IRoommateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/roommates/${id}`).then(r => r.json()).then(d => { if (d.success) setRequest(d.request); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!request) return (
    <div className="min-h-screen bg-brand-bg"><Navbar />
      <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🤝</p><p className="font-semibold text-gray-600">Post not found</p><Link href="/roommates" className="text-primary font-semibold hover:underline text-sm mt-4 block">← Back to Roommates</Link></div>
      <Footer />
    </div>
  );

  const isOwner = !!(user && request.userId === user._id) || (typeof window !== 'undefined' && getDeviceId() === (request as unknown as { deviceId?: string }).deviceId);

  const handleMessage = async () => {
    if (!user) return router.push(`/login?redirect=/roommates/${id}`);
    if (!request.userId) return toast.error('This post is anonymous and has no linked account. Try the contact info shared below instead.');
    setMessaging(true);
    try {
      const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: request.userId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push(`/dashboard/messages/${data.conversation._id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setMessaging(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this roommate post?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/roommates/${id}?deviceId=${getDeviceId()}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Post deleted');
      router.push('/roommates');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setDeleting(false); }
  };

  const pl = request.partialListing;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-400 mb-4"><Link href="/roommates" className="hover:text-primary">Roommates</Link> / <span className="text-gray-600">{request.preferredArea}</span></div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            {request.isAnonymous ? <AnonymousAvatar seed={request._id} size="xl" /> : (
              <div className="w-20 h-20 rounded-full bg-accent-light text-accent-dark font-bold flex items-center justify-center flex-shrink-0"><UserIcon className="w-9 h-9" /></div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-gray-900">{request.isAnonymous ? 'Anonymous Student' : request.displayName ?? 'Student'}</h1>
                <Badge variant={genderColors[request.gender]}>{request.gender}</Badge>
              </div>
              <p className="text-sm text-gray-500">{request.level && `${request.level} · `}{request.course}</p>
              <p className="text-xs text-gray-400 mt-1">Posted {formatDate(request.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoBlock icon={GraduationCap} label="University" value={request.university} />
            <InfoBlock icon={Wallet} label="Budget" value={`${formatCurrency(request.budget)}/yr`} />
            <InfoBlock icon={MapPin} label="Preferred Area" value={`${request.preferredArea}, ${request.state}`} />
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{request.description}</p>
          </div>

          {request.hasListingDetails && pl && (
            <div className="mb-6 bg-primary-light rounded-2xl p-5">
              <h2 className="text-sm font-bold text-primary-dark mb-3">Already Has a Place</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {pl.roomType && <div><p className="text-xs text-gray-500">Room Type</p><p className="font-semibold text-gray-800">{pl.roomType}</p></div>}
                {pl.rent && <div><p className="text-xs text-gray-500">Rent Share</p><p className="font-semibold text-gray-800">{formatCurrency(pl.rent)}/yr</p></div>}
                {pl.address && <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="font-semibold text-gray-800">{pl.address}</p></div>}
                {pl.waterSupply && pl.waterSupply.length > 0 && <div><p className="text-xs text-gray-500 flex items-center gap-1"><Droplets className="w-3 h-3" /> Water</p><p className="font-semibold text-gray-800">{pl.waterSupply.join(', ')}</p></div>}
                {pl.powerSupply && pl.powerSupply.length > 0 && <div><p className="text-xs text-gray-500 flex items-center gap-1"><Zap className="w-3 h-3" /> Power</p><p className="font-semibold text-gray-800">{pl.powerSupply.join(', ')}</p></div>}
                {pl.securityType && pl.securityType.length > 0 && <div className="col-span-2"><p className="text-xs text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Security</p><p className="font-semibold text-gray-800">{pl.securityType.join(', ')}</p></div>}
              </div>
              {pl.photos && pl.photos.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {pl.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-4 border-t border-gray-100">
            {!isOwner && (
              <>
                <Button onClick={handleMessage} loading={messaging} disabled={!request.userId}><MessageCircle className="w-4 h-4" /> Message</Button>
                {request.contactInfo && <Button variant="outline"><Phone className="w-4 h-4" /> {request.contactInfo}</Button>}
              </>
            )}
            {isOwner && <Button variant="danger" onClick={handleDelete} loading={deleting}><Trash2 className="w-4 h-4" /> Delete Post</Button>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
      <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-800">{value}</p></div>
    </div>
  );
}

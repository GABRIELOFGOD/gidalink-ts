import { apiSuccess } from '@/lib/utils';

export async function POST() {
  const res = apiSuccess({ message: 'Logged out' });
  res.headers.set('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  return res;
}

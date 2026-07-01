import crypto from 'crypto';

const BASE = 'https://api.paystack.co';

async function req<T>(endpoint: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<T>;
}

interface PaystackInitPayload {
  email: string;
  amount: number;   // naira — we convert to kobo internally
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitResponse {
  status: boolean;
  data: { authorization_url: string; access_code: string; reference: string };
}

interface PaystackVerifyResponse {
  status: boolean;
  data: { status: string; reference: string; amount: number; [key: string]: unknown };
}

export async function initializeTransaction(payload: PaystackInitPayload): Promise<PaystackInitResponse> {
  return req<PaystackInitResponse>('/transaction/initialize', 'POST', {
    email:        payload.email,
    amount:       Math.round(payload.amount * 100), // to kobo
    reference:    payload.reference,
    callback_url: payload.callbackUrl,
    metadata:     payload.metadata,
  });
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  return req<PaystackVerifyResponse>(`/transaction/verify/${reference}`);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY ?? '')
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

export function generateReference(prefix = 'GL'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

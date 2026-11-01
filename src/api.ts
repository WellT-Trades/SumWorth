import { API_URL } from './config';
import { getToken } from './tokenStorage';
import { Account } from './types';

type ApiAccount = {
  id: number;
  name: string;
  account_number: string;
  balance_kobo: number;
};

// The backend stores kobo and snake_case names; the app uses naira and camelCase.
const toAccount = (a: ApiAccount): Account => ({
  id: a.id,
  name: a.name,
  accountNumber: a.account_number,
  balance: a.balance_kobo / 100,
});

export class UnauthorizedError extends Error {}

// One place that adds the token, the timeout and the 401 check.
async function request(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });
    if (response.status === 401) {
      throw new UnauthorizedError('Please log in.');
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await request('/accounts');
  if (!response.ok) {
    throw new Error(`Server replied ${response.status}`);
  }
  const data: ApiAccount[] = await response.json();
  return data.map(toAccount);
}

type AccountInput = { name: string; accountNumber: string; balance: number };

const toBody = (input: AccountInput) =>
  JSON.stringify({
    name: input.name,
    account_number: input.accountNumber,
    balance_kobo: Math.round(input.balance * 100),
  });

export async function createAccount(input: AccountInput): Promise<Account> {
  const response = await request('/accounts', {
    method: 'POST',
    body: toBody(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Server replied ${response.status}`);
  }
  return toAccount(data);
}

export async function updateAccount(
  id: number,
  input: AccountInput
): Promise<Account> {
  const response = await request(`/accounts/${id}`, {
    method: 'PUT',
    body: toBody(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Server replied ${response.status}`);
  }
  return toAccount(data);
}

export async function removeAccount(id: number): Promise<void> {
  const response = await request(`/accounts/${id}`, { method: 'DELETE' });
  // 404 means it's already gone, which is what we wanted anyway
  if (!response.ok && response.status !== 404) {
    throw new Error(`Server replied ${response.status}`);
  }
}
// Login and register don't use request(), because a 401 here means
// "wrong password", not "session expired".
async function authCall(path: string, email: string, password: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `Server replied ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function login(email: string, password: string): Promise<string> {
  const data = await authCall('/auth/login', email.trim(), password);
  return data.token;
}

export async function register(
  email: string,
  password: string
): Promise<string> {
  await authCall('/auth/register', email.trim(), password);
  return login(email, password);
}
async function postJson(path: string, body: object): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `Server replied ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await postJson('/auth/forgot-password', { email: email.trim() });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  await postJson('/auth/reset-password', {
    email: email.trim(),
    code: code.trim(),
    new_password: newPassword,
  });
}
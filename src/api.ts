import { API_URL } from './config';
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

export async function fetchAccounts(): Promise<Account[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}/accounts`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Server replied ${response.status}`);
    }
    const data: ApiAccount[] = await response.json();
    return data.map(toAccount);
  } finally {
    clearTimeout(timer);
  }
}

export async function createAccount(input: {
  name: string;
  accountNumber: string;
  balance: number;
}): Promise<Account> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        account_number: input.accountNumber,
        balance_kobo: Math.round(input.balance * 100),
      }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `Server replied ${response.status}`);
    }
    return toAccount(data);
  } finally {
    clearTimeout(timer);
  }
}
export async function removeAccount(id: number): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}/accounts/${id}`, {
      method: 'DELETE',
      signal: controller.signal,
    });
    // 404 means it's already gone, which is what we wanted anyway
    if (!response.ok && response.status !== 404) {
      throw new Error(`Server replied ${response.status}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
export async function updateAccount(
  id: number,
  input: { name: string; accountNumber: string; balance: number }
): Promise<Account> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        account_number: input.accountNumber,
        balance_kobo: Math.round(input.balance * 100),
      }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `Server replied ${response.status}`);
    }
    return toAccount(data);
  } finally {
    clearTimeout(timer);
  }
}
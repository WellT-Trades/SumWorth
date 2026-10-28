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

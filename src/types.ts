export type Account = {
  id: number;
  name: string;
  accountNumber: string; // last 4 digits, or '' if none
  balance: number;
};

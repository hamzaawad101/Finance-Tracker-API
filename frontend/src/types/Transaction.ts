export type Transaction = {
  id: string;
  type: 'Rent' | 'Groceries' | 'Entertainment';
  date: string;
  amount: number;
};

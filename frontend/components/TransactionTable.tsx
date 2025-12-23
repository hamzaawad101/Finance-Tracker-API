import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Transaction } from '../src/types/Transaction';

// MUI Table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import { PieChart } from '@mui/x-charts';

function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<Transaction['type']>('Rent');
  const [amount, setAmount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    api.get('/transactions').then((res) => {
      setTransactions(res.data);
    });
  }, []);

  const addTransaction = async () => {
    if (!amount) return;

    const res = await api.post('/transactions', {
      type,
      amount,
      date: new Date().toISOString(),
    });

    setTransactions((prev) => [...prev, res.data]);
    setAmount(0);
    setType('Rent');
  };

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(activeMonth));
  }, [transactions, activeMonth]);

  const filteredTransactions = useMemo(() => {
    return monthlyTransactions.filter((t) =>
      `${t.type} ${t.date}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [monthlyTransactions, search]);

  const total = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions.forEach((t) => {
      map[t.type] = (map[t.type] || 0) + t.amount;
    });

    return Object.entries(map).map(([label, value]) => ({
      label,
      value,
    }));
  }, [monthlyTransactions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-6 shadow-sm">
        {/* Month Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Month
          </label>
          <input
            type="month"
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="mt-1 rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by type or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {/* Add Transaction */}
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Transaction['type'])}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="Rent">Rent</option>
            <option value="Groceries">Groceries</option>
            <option value="Entertainment">Entertainment</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-28 rounded-md border px-3 py-2 text-sm"
          />

          <button
            onClick={addTransaction}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Total for {activeMonth}
        </p>
        <p className="mt-3 text-4xl font-bold text-gray-900">
          ${total.toFixed(2)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transactions Table */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border shadow-sm">
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.type}</TableCell>
                    <TableCell>${t.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(t.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    ${total.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>

        {/* Spending Analysis Chart */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-gray-600">
            Spending Breakdown
          </h3>

          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 40,
                outerRadius: 80,
                paddingAngle: 3,
              },
            ]}
            height={220}
          />
        </div>
      </div>
    </div>
  );
}

export default TransactionTable;

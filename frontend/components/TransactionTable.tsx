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
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md">
        {/* Month */}
        <input
          type="month"
          value={activeMonth}
          onChange={(e) => setActiveMonth(e.target.value)}
          className="rounded-md bg-white/90 px-3 py-2 text-sm text-gray-900"
        />

        {/* Search */}
        <input
          type="text"
          placeholder="Search type or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md bg-white/90 px-3 py-2 text-sm text-gray-900"
        />

        {/* Type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Transaction['type'])}
          className="rounded-md bg-white/90 px-3 py-2 text-sm text-gray-900"
        >
          <option value="Rent">Rent</option>
          <option value="Groceries">Groceries</option>
          <option value="Entertainment">Entertainment</option>
        </select>

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-28 rounded-md bg-white/90 px-3 py-2 text-sm text-gray-900"
        />

        {/* Add Button */}
        <button
          onClick={addTransaction}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          Add
        </button>

        {/* Total */}
        <div className="ml-auto text-right">
          <p className="text-xs uppercase tracking-wide opacity-80">
            Monthly Total
          </p>
          <p className="text-2xl font-bold">${total.toFixed(2)}</p>
        </div>
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

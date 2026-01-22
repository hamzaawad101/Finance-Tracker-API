import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Transaction } from '../src/types/Transaction';
import dayjs from 'dayjs';
import { Chip } from '@mui/material';

// MUI Components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Popover,
} from '@mui/material';
import { PieChart, LineChart } from '@mui/x-charts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Edit } from 'lucide-react';

export default function Dashboard() {
  // TRANSACTIONS STATE
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<Transaction['type']>('Rent');
  const [amount, setAmount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);
  const [editType, setEditType] = useState<Transaction['type']>('Rent');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState(dayjs().format('YYYY-MM-DD'));

  // MONTH SELECTION
  const [activeMonth, setActiveMonth] = useState(dayjs().format('YYYY-MM'));
  const [monthAnchorEl, setMonthAnchorEl] = useState<null | HTMLElement>(null);
  const monthOpen = Boolean(monthAnchorEl);

  // FETCH TRANSACTIONS
  useEffect(() => {
    api.get('/transactions').then((res) => setTransactions(res.data));
  }, []);

  // ADD TRANSACTION
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

  // EDIT TRANSACTION
  const handleEditClick = (t: Transaction) => {
    setCurrentTransaction(t);
    setEditType(t.type);
    setEditAmount(t.amount);
    setEditDate(t.date.substring(0, 10));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!currentTransaction) return;
    const res = await api.patch(`/transactions/${currentTransaction.id}`, {
      type: editType,
      amount: editAmount,
      date: editDate,
    });
    setTransactions((prev) =>
      prev.map((t) => (t.id === currentTransaction.id ? res.data : t)),
    );
    setEditOpen(false);
    setCurrentTransaction(null);
  };

  // FILTER & CALCULATIONS
  const monthlyTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(activeMonth)),
    [transactions, activeMonth],
  );

  const filteredTransactions = useMemo(
    () =>
      monthlyTransactions.filter((t) =>
        `${t.type} ${t.date}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [monthlyTransactions, search],
  );

  const total = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const largestExpense = monthlyTransactions.reduce(
    (max, t) => (t.amount > max.amount ? t : max),
    monthlyTransactions[0] || {
      id: '0',
      type: '',
      amount: 0,
      date: dayjs().toISOString(),
    },
  );

  const averageDaily = total / dayjs(activeMonth + '-01').daysInMonth();

  // PIE CHART DATA
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions.forEach((t) => {
      map[t.type] = (map[t.type] || 0) + t.amount;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [monthlyTransactions]);

  const lineData: (number | null)[] = useMemo(() => {
    const map: Record<number, number> = {};
    monthlyTransactions.forEach((t) => {
      const day = parseInt(t.date.substring(8, 10)); // get day of month
      map[day] = (map[day] || 0) + t.amount;
    });
    // fill days 1–31
    return Array.from({ length: 31 }, (_, i) => map[i + 1] ?? 0);
  }, [monthlyTransactions]);

  const typeColors: Record<string, string> = {
    Rent: '#3b82f6', // Blue
    Groceries: '#10b981', // Green
    Entertainment: '#f59e0b', // Orange
  };

  return (
    <div className="space-y-8">
      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Spending</p>
          <p className="text-2xl font-bold text-blue-600">
            ${total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Largest Expense</p>
          <p className="text-2xl font-bold text-orange-500">
            {largestExpense?.type}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Average Daily</p>
          <p className="text-2xl font-bold text-green-600">
            ${averageDaily.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Month</p>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setMonthAnchorEl(e.currentTarget)}
          >
            {dayjs(activeMonth + '-01').format('MMMM YYYY')}
          </Button>
          <Popover
            open={monthOpen}
            anchorEl={monthAnchorEl}
            onClose={() => setMonthAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                views={['year', 'month']}
                value={dayjs(activeMonth + '-01')}
                onChange={(newValue) => {
                  if (!newValue) return;
                  setActiveMonth(newValue.format('YYYY-MM'));
                  setMonthAnchorEl(null);
                }}
              />
            </LocalizationProvider>
          </Popover>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <Typography variant="subtitle1" className="mb-2 text-gray-600">
            Spending Breakdown
          </Typography>
          <PieChart
            series={[
              {
                data: pieData,
                innerRadius: 40,
                outerRadius: 80,
                paddingAngle: 3,
              },
            ]}
            height={220}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <Typography variant="subtitle1" className="mb-2 text-gray-600">
            Daily Spending Trend
          </Typography>
          <LineChart
            series={[{ data: lineData }]} // just y-values
            height={220}
          />
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              {/* Actions Row */}
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell colSpan={4}>
                  <div className="flex flex-wrap items-center gap-3">
                    <TextField
                      placeholder="Search type or date…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      size="small"
                      sx={{ flex: 1, minWidth: 180 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      className="ml-auto"
                      onClick={() => setOpenAddModal(true)}
                    >
                      + Add
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {/* Column Labels */}
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Edit</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#f0f4ff' },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={t.type}
                      sx={{
                        backgroundColor: `${typeColors[t.type]}33`,
                        color: typeColors[t.type],
                        fontWeight: 500,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${t.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditClick(t)}
                      color="primary"
                    >
                      <Edit size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* ADD MODAL */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 360,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Typography variant="h6">Add Transaction</Typography>
          <Select
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value as Transaction['type'])}
          >
            <MenuItem value="Rent">Rent</MenuItem>
            <MenuItem value="Groceries">Groceries</MenuItem>
            <MenuItem value="Entertainment">Entertainment</MenuItem>
          </Select>
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                addTransaction();
                setOpenAddModal(false);
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent className="space-y-3">
          <Select
            fullWidth
            value={editType}
            onChange={(e) => setEditType(e.target.value as Transaction['type'])}
          >
            <MenuItem value="Rent">Rent</MenuItem>
            <MenuItem value="Groceries">Groceries</MenuItem>
            <MenuItem value="Entertainment">Entertainment</MenuItem>
          </Select>
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={editAmount}
            onChange={(e) => setEditAmount(Number(e.target.value))}
          />
          <TextField
            fullWidth
            type="date"
            label="Date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

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
import Paper from '@mui/material/Paper';
import { PieChart } from '@mui/x-charts';
import {
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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Edit } from 'lucide-react';
import dayjs from 'dayjs';
import Popover from '@mui/material/Popover';

function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<Transaction['type']>('Rent');
  const [amount, setAmount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [monthAnchorEl, setMonthAnchorEl] = useState<null | HTMLElement>(null);
  const monthOpen = Boolean(monthAnchorEl);

  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);
  const [editType, setEditType] = useState<Transaction['type']>('Rent');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

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
  const handleEditClick = (t: Transaction) => {
    setCurrentTransaction(t);
    setEditType(t.type);
    setEditAmount(t.amount);
    setEditDate(t.date.substring(0, 10));
    setEditOpen(true);
  };
  const handleSave = async () => {
    if (!currentTransaction) return;
    const updatedTransaction = {
      type: editType,
      amount: editAmount,
      date: editDate,
    };
    const res = await api.patch(
      `/transactions/${currentTransaction.id}`,
      updatedTransaction
    );

    setTransactions((prev) =>
      prev.map((t) => (t.id === currentTransaction.id ? res.data : t))
    );
    setEditOpen(false);
    setCurrentTransaction(null);
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
      <div className="flex flex-col gap-6">
        <div className="w-64 rounded-2xl bg-white shadow-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total for this month</p>

          <div className="mt-2 text-3xl font-semibold text-blue-600">
            ${total.toLocaleString()}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border shadow-xl">
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                {/* ACTIONS ROW */}
                <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableCell colSpan={4}>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Month */}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                        >
                          <DateCalendar
                            views={['year', 'month']}
                            value={dayjs(activeMonth + '-01')}
                            onChange={(newValue) => {
                              if (!newValue) return;
                              setActiveMonth(newValue.format('YYYY-MM'));
                              setMonthAnchorEl(null); // 👈 close after selection
                            }}
                          />
                        </Popover>
                      </LocalizationProvider>

                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search type or date…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 min-w-[180px] rounded-md border px-3 py-1.5 text-sm"
                      />

                      {/* Add transaction button pushed to the right */}
                      <button
                        onClick={() => setOpenAddModal(true)}
                        className="ml-auto rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        + Add
                      </button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* COLUMN LABELS ROW */}
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Edit</TableCell>
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
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(t)}>
                        <Edit size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {/* ADD TRANSACTION MODAL */}
        <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 320,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              Add Transaction
            </Typography>

            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as Transaction['type'])}
              fullWidth
            >
              <MenuItem value="Rent">Rent</MenuItem>
              <MenuItem value="Groceries">Groceries</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
            </TextField>

            <TextField
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              fullWidth
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogContent className="space-y-3">
            <Select
              fullWidth
              value={editType}
              onChange={(e) =>
                setEditType(e.target.value as Transaction['type'])
              }
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

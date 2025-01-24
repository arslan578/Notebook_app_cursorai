import { useState, useEffect } from 'react';
import { 
    Container, Paper, Typography, Grid, Table, 
    TableBody, TableCell, TableContainer, TableHead, 
    TableRow, TablePagination, TextField, Box,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ACCESS_TOKEN } from '../constants';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';

const API_BASE_URL = 'http://localhost:8000/api';

const RANGE_OPTIONS = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 }
];

const Dashboard = () => {
    const [stats, setStats] = useState({ total_users: 0, total_notes: 0 });
    const [users, setUsers] = useState([]);
    const [dailyNotes, setDailyNotes] = useState([]);
    const [notesPerUser, setNotesPerUser] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState(30);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const fetchDailyNotes = async (days) => {
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(
                `${API_BASE_URL}/dashboard/notes-per-day/?days=${days}`,
                { headers }
            );
            const data = await response.json();
            
            // Fill in missing dates with zero counts
            const filledData = [];
            for (let i = days - 1; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                const existingData = data.find(d => d.date === date);
                filledData.push({
                    date,
                    count: existingData ? existingData.count : 0
                });
            }
            setDailyNotes(filledData);
        } catch (error) {
            console.error('Error fetching daily notes:', error);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [statsRes, usersRes, distRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/dashboard/stats/`, { headers }),
                    fetch(`${API_BASE_URL}/dashboard/users/`, { headers }),
                    fetch(`${API_BASE_URL}/dashboard/notes-per-user/`, { headers })
                ]);

                const [statsData, usersData, distData] = await Promise.all([
                    statsRes.json(),
                    usersRes.json(),
                    distRes.json()
                ]);

                setStats(statsData);
                setUsers(usersData);
                setNotesPerUser(distData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
        fetchDailyNotes(dateRange);
    }, [dateRange]);

    const handleRangeChange = (event) => {
        setDateRange(event.target.value);
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <DashboardHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <DashboardSidebar open={sidebarOpen} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${240}px)` },
                    ml: { sm: `${240}px` },
                    mt: '64px', // Height of the header
                }}
            >
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        {/* Summary Statistics */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Total Users: {stats.total_users}
                                </Typography>
                                <Typography variant="h6">
                                    Total Notes: {stats.total_notes}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Notes Created Chart */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        Notes Created Over Time
                                    </Typography>
                                    <FormControl sx={{ minWidth: 200 }}>
                                        <InputLabel>Time Range</InputLabel>
                                        <Select
                                            value={dateRange}
                                            label="Time Range"
                                            onChange={handleRangeChange}
                                        >
                                            {RANGE_OPTIONS.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={dailyNotes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            labelFormatter={(date) => format(new Date(date), 'MM/dd/yyyy')}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="count" 
                                            name="Notes Created"
                                            stroke="#8884d8" 
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Users Table */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        label="Search Users"
                                        variant="outlined"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Username</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell align="right">Total Notes</TableCell>
                                                <TableCell>Last Note Created</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredUsers
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>{user.username}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell align="right">{user.total_notes}</TableCell>
                                                        <TableCell>
                                                            {user.last_note_date ? 
                                                                format(new Date(user.last_note_date), 'MM/dd/yyyy HH:mm') : 
                                                                'No notes'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredUsers.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={(e, newPage) => setPage(newPage)}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPage(parseInt(e.target.value, 10));
                                        setPage(0);
                                    }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default Dashboard; 
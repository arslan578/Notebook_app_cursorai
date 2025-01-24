import { Container, Paper, Typography } from '@mui/material';

const DashboardNotes = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Notes Management
                </Typography>
                <Typography>
                    Notes management features coming soon...
                </Typography>
            </Paper>
        </Container>
    );
};

export default DashboardNotes; 
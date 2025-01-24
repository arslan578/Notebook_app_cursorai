import { Container, Paper, Typography } from '@mui/material';

const DashboardAnalytics = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Analytics Dashboard
                </Typography>
                <Typography>
                    Advanced analytics features coming soon...
                </Typography>
            </Paper>
        </Container>
    );
};

export default DashboardAnalytics; 
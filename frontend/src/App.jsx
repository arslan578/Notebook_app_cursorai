import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";  // Add this import
import Profile from "./pages/Profile";  // Add this import
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from './pages/Dashboard';
import DashboardUsers from './pages/DashboardUsers';
import DashboardNotes from './pages/DashboardNotes';
import DashboardAnalytics from './pages/DashboardAnalytics';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />  {/* Add this route */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route  // Add this route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/dashboard/*" element={
                    <ProtectedRoute>
                        <Routes>
                            <Route index element={<Dashboard />} />
                            <Route path="users" element={<DashboardUsers />} />
                            <Route path="notes" element={<DashboardNotes />} />
                            <Route path="analytics" element={<DashboardAnalytics />} />
                        </Routes>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
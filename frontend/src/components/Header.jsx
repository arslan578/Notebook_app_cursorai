import { useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Header.css";

function Header() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const refresh_token = localStorage.getItem(REFRESH_TOKEN);  // Use constant
            await authAPI.logout({ refresh_token });
            localStorage.removeItem(ACCESS_TOKEN);  // Use constant
            localStorage.removeItem(REFRESH_TOKEN);  // Use constant
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    };

    return (
        <header className="header">
            <h1>Notes App</h1>
            <button onClick={handleLogout} className="logout-btn">
                Logout
            </button>
        </header>
    );
}

export default Header;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ method }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        confirm_password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (method === "login") {
                const res = await authAPI.login({
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                // Validate passwords match
                if (formData.password !== formData.confirm_password) {
                    throw new Error("Passwords do not match");
                }
                await authAPI.register(formData);
                alert("Registration successful! Please login.");
                navigate("/login");
            }
        } catch (error) {
            console.error("Auth error:", error);
            setError(
                error.response?.data?.detail || 
                error.message || 
                "An error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="form-container">
                <h1>{method === "login" ? "Login" : "Sign Up"}</h1>
                
                <input
                    className="form-input"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                />

                {method === "register" && (
                    <>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="First Name"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Last Name"
                            required
                        />
                    </>
                )}

                <input
                    className="form-input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />

                {method === "register" && (
                    <input
                        className="form-input"
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        required
                    />
                )}

                {error && <div className="error-message">{error}</div>}

                <button 
                    className="form-button" 
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <LoadingIndicator />
                    ) : (
                        method === "login" ? "Login" : "Sign Up"
                    )}
                </button>

                <div className="auth-links">
                    {method === "login" ? (
                        <p>
                            Don't have an account?{" "}
                            <Link to="/signup">Sign Up</Link>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <Link to="/login">Login</Link>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Form;
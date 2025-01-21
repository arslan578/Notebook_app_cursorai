import { useState, useEffect } from "react";
import { userAPI } from "../api";
import Header from "../components/Header";
import LoadingIndicator from "../components/LoadingIndicator";
import "../styles/Profile.css";

function Profile() {
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState("profile"); // profile or password

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getProfile();
            setUserData(response.data);
        } catch (error) {
            setErrors({ general: "Failed to fetch profile data" });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        setErrors({
            ...errors,
            [e.target.name]: "",
        });
        setSuccess("");
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        setErrors({
            ...errors,
            [e.target.name]: "",
        });
        setSuccess("");
    };

    const validateProfileData = () => {
        const newErrors = {};
        if (!userData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!userData.first_name) newErrors.first_name = "First name is required";
        if (!userData.last_name) newErrors.last_name = "Last name is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordData = () => {
        const newErrors = {};
        if (!passwordData.current_password) {
            newErrors.current_password = "Current password is required";
        }
        if (!passwordData.new_password) {
            newErrors.new_password = "New password is required";
        } else if (passwordData.new_password.length < 8) {
            newErrors.new_password = "Password must be at least 8 characters long";
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            newErrors.confirm_password = "Passwords do not match";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!validateProfileData()) return;

        try {
            setLoading(true);
            await userAPI.updateProfile(userData);
            setSuccess("Profile updated successfully!");
            setErrors({});
        } catch (error) {
            const serverErrors = error.response?.data || {};
            setErrors(serverErrors);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!validatePasswordData()) return;

        try {
            setLoading(true);
            await userAPI.changePassword(passwordData);
            setSuccess("Password changed successfully!");
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
            setErrors({});
        } catch (error) {
            const serverErrors = error.response?.data || {};
            setErrors(serverErrors);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userData.username) {
        return <LoadingIndicator />;
    }

    return (
        <div>
            <Header />
            <div className="profile-container">
                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile Details
                    </button>
                    <button
                        className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        Change Password
                    </button>
                </div>

                {success && <div className="success-message">{success}</div>}

                {activeTab === "profile" ? (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={handleProfileChange}
                                placeholder="e.g., john_doe"
                                disabled
                            />
                            {errors.username && <span className="field-error">{errors.username}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleProfileChange}
                                placeholder="e.g., john.doe@example.com"
                                required
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={userData.first_name}
                                onChange={handleProfileChange}
                                placeholder="e.g., John"
                                required
                            />
                            {errors.first_name && <span className="field-error">{errors.first_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={userData.last_name}
                                onChange={handleProfileChange}
                                placeholder="e.g., Doe"
                                required
                            />
                            {errors.last_name && <span className="field-error">{errors.last_name}</span>}
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? <LoadingIndicator /> : "Update Profile"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                placeholder="Enter your current password (min. 8 characters)"
                                required
                                minLength={8}
                            />
                            {errors.current_password && <span className="field-error">{errors.current_password}</span>}
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                placeholder="New password (min. 8 characters, include numbers & symbols)"
                                required
                                minLength={8}
                            />
                            {errors.new_password && <span className="field-error">{errors.new_password}</span>}
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                placeholder="Re-enter your new password"
                                required
                                minLength={8}
                            />
                            {errors.confirm_password && <span className="field-error">{errors.confirm_password}</span>}
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? <LoadingIndicator /> : "Change Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile; 
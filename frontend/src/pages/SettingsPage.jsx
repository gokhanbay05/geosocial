import { useState, useRef, useEffect } from "react";
import Button from "../components/core/Button";
import Input from "../components/core/Input";
import Divider from "../components/core/Divider";
import { Moon, Sun, Lock, Mail, LogOut, ChevronRight, Check, AlertTriangle } from "lucide-react";
import "../css/pages/SettingsPage.css";
import { useAuthStore } from "../store/useAuthStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { updateAccount } from "../services/user.service";
import { handleError } from "../lib/errorHandler";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const { theme, setTheme, mapStyle, setMapStyle } = useSettingsStore();
    const { user, logout, updateUser } = useAuthStore();

    const [isConfirming, setIsConfirming] = useState(false);
    const timeoutRef = useRef(null);

    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.email) setEmail(user.email);
    }, [user]);

    const handleLogout = () => {
        if (isConfirming) {
            logout();
        } else {
            setIsConfirming(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsConfirming(false);
            }, 3000);
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleUpdateCredentials = async () => {
        if (!email) return toast.error("Email cannot be empty");
        if (newPassword && !currentPassword) return toast.error("Current password is required to set a new one");
        if (email === user.email && !newPassword) return;

        setIsLoading(true);
        try {
            const updatedUser = await updateAccount({
                email,
                currentPassword,
                newPassword
            });

            updateUser(updatedUser);
            toast.success("Account updated successfully");

            setCurrentPassword("");
            setNewPassword("");
        } catch (error) {
            handleError(error, { context: "UpdateAccount" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-scroll-area">
                <div className="settings-section">
                    <h3 className="settings-section-title">Appearance</h3>
                    <div className="theme-toggle-group">
                        <Button variant="outline" className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
                            <Sun size={24} strokeWidth={1.5} />
                            <span>Light</span>
                        </Button>
                        <Button variant="outline" className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
                            <Moon size={24} strokeWidth={1.5} />
                            <span>Dark</span>
                        </Button>
                    </div>
                </div>

                <Divider />

                <div className="settings-section">
                    <h3 className="settings-section-title">Map Style</h3>
                    <div className="map-style-grid">
                        <div className={`map-style-card style-basic ${mapStyle === "basic" ? "active" : ""}`} onClick={() => setMapStyle("basic")}>
                            <div className="map-preview basic"></div>
                            <span className="map-label">Standard</span>
                            {mapStyle === "basic" && <div className="check-badge"><Check size={10} strokeWidth={4} /></div>}
                        </div>
                        <div className={`map-style-card style-dark ${mapStyle === "dark" ? "active" : ""}`} onClick={() => setMapStyle("dark")}>
                            <div className="map-preview dark"></div>
                            <span className="map-label">Night</span>
                            {mapStyle === "dark" && <div className="check-badge"><Check size={10} strokeWidth={4} /></div>}
                        </div>
                        <div className={`map-style-card style-sat ${mapStyle === "satellite" ? "active" : ""}`} onClick={() => setMapStyle("satellite")}>
                            <div className="map-preview satellite"></div>
                            <span className="map-label">Satellite</span>
                            {mapStyle === "satellite" && <div className="check-badge"><Check size={10} strokeWidth={4} /></div>}
                        </div>
                    </div>
                </div>

                <Divider />

                <div className="settings-section">
                    <h3 className="settings-section-title">Account Security</h3>
                    <div className="settings-form-group">
                        <Input
                            label="Email Address"
                            icon={<Mail size={18} />}
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="password-change-area">
                            <Input
                                label="Change Password"
                                type="password"
                                icon={<Lock size={18} />}
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                icon={<Lock size={18} />}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            className="w-full mt-2"
                            onClick={handleUpdateCredentials}
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Update Credentials"}
                        </Button>
                    </div>
                </div>

                <Divider />

                <div className="settings-section">
                    <Button
                        variant="danger"
                        size="lg"
                        className={`w-full justify-between group transition-all duration-300 ${isConfirming ? "logout-confirm-active" : ""}`}
                        onClick={handleLogout}
                    >
                        <span className="flex items-center gap-2">
                            {isConfirming ? <AlertTriangle size={20} /> : <LogOut size={20} />}
                            <span className={isConfirming ? "font-bold" : "font-medium"}>
                                {isConfirming ? "Are you sure?" : "Log Out"}
                            </span>
                        </span>
                        {!isConfirming && (
                            <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                        )}
                    </Button>
                    <p className="version-text">GeoSocial v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Input from "../components/core/Input";
import Button from "../components/core/Button";
import Spinner from "../components/core/Spinner";
import { Mail, Lock, LogIn, Map } from "lucide-react";
import { handleError } from "../lib/errorHandler";
import "../css/pages/Auth.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, isLoggingIn } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const result = await login(formData);

    if (!result.success) {
      if (result.message.errors) {
        setFieldErrors(result.message.errors);
      }
      handleError(result.message, { context: "Login" });
    }
  };

  return (
    <div className="auth-page-container">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="auth-card-frame">
        <header className="auth-card-header">
          <div className="auth-logo-wrapper">
            <Map size={36} stroke="url(#icon-gradient)" strokeWidth={2.5} className="shrink-0" />
            <h1 className="auth-logo-text text-gradient-animated">GeoSocial</h1>
          </div>
        </header>

        <main className="auth-card-body">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail size={18} />}
                error={fieldErrors.email}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock size={18} />}
                error={fieldErrors.password}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-2xl shadow-md"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Continue</span>
                </>
              )}
            </Button>
          </form>
        </main>

        <footer className="auth-card-footer">
          <div className="auth-footer-content">
            <span className="auth-footer-text">Don't have an account?</span>
            <Link to="/signup" className="auth-footer-link">
              Sign Up
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
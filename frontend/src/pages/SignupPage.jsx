import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Input from "../components/core/Input";
import Button from "../components/core/Button";
import Spinner from "../components/core/Spinner";
import { Mail, Lock, User, UserPlus, Camera, X, Map } from "lucide-react";
import { handleError } from "../lib/errorHandler";
import "../css/pages/Auth.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { signup, isSigningUp } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        handleError(new Error("Image size must be less than 5MB"), { context: "SignupFile" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      avatar: selectedFile,
    });

    if (!result.success) {
      if (result.message.errors) {
        setFieldErrors(result.message.errors);
      }
      handleError(result.message, { context: "SignupSubmit" });
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
            <div className="flex justify-center mb-2">
              <div
                className="relative w-24 h-24 rounded-full border-2 border-dashed border-border-default hover:border-primary cursor-pointer flex items-center justify-center bg-bg-surface transition-colors overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Hover Overlay */}
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center
                 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button
                        type="button"
                        variant="danger"
                        size="icon"
                        onClick={clearFile}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-text-muted group-hover:text-primary">
                    <Camera size={24} />
                    <span className="text-[10px] font-medium">Add Photo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <Input
                label="Username"
                type="text"
                name="username"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                icon={<User size={18} />}
                error={fieldErrors.username}
              />

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
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Signing up...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Sign Up</span>
                </>
              )}
            </Button>
          </form>
        </main>

        <footer className="auth-card-footer">
          <div className="auth-footer-content">
            <span className="auth-footer-text">Already have an account?</span>
            <Link to="/login" className="auth-footer-link">
              Login
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
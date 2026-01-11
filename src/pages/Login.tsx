import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/vulnerax.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store the new account credentials in localStorage
      const registeredAccounts = JSON.parse(
        localStorage.getItem("registeredAccounts") || "[]"
      );
      registeredAccounts.push({ email, password, role: userRole });
      localStorage.setItem(
        "registeredAccounts",
        JSON.stringify(registeredAccounts)
      );

      // Show success message
      alert(
        `Account created successfully for ${email}! Please sign in with your credentials.`
      );

      // Clear form and switch to sign-in
      setPassword("");
      setConfirmPassword("");
      setEmail("");
      setError("");
      setIsSignUp(false);
    } catch {
      setError("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check against registered accounts in localStorage
      const registeredAccounts = JSON.parse(
        localStorage.getItem("registeredAccounts") || "[]"
      );
      const userAccount = registeredAccounts.find(
        (account: { email: string; password: string; role: string }) =>
          account.email === email &&
          account.password === password &&
          account.role === userRole
      );

      if (userAccount) {
        // Store login state
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", userRole);

        // Dispatch custom event to notify App component
        window.dispatchEvent(
          new CustomEvent("loginSuccess", {
            detail: { email, role: userRole },
          })
        );

        // Redirect to sector selection page
        navigate("/sector-selection");
      } else {
        setError(
          "Invalid email, password, or role. Please sign up first or check your credentials."
        );
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(50px)",
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div
        className={`relative w-full max-w-md transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="bg-linear-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-teal-500/50 to-transparent"></div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="VulneraX Logo"
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Create Account" : "Sign in to VulneraX"}
            </h1>
            <p className="text-zinc-400 text-sm tracking-wide">
              {isSignUp
                ? "Join our security platform"
                : "Security Intelligence Platform"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isSignUp ? handleSignUp : handleLogin}
            className="space-y-5"
          >
            {/* Profile Selection */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-3 block">
                Select Profile
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserRole("user")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    userRole === "user"
                      ? "bg-teal-500/10 border-teal-500/50 text-teal-400"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      userRole === "user"
                        ? "border-teal-400"
                        : "border-zinc-600"
                    }`}
                  >
                    {userRole === "user" && (
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">User</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserRole("admin")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    userRole === "admin"
                      ? "bg-teal-500/10 border-teal-500/50 text-teal-400"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      userRole === "admin"
                        ? "border-teal-400"
                        : "border-zinc-600"
                    }`}
                  >
                    {userRole === "admin" && (
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Admin</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2 block">
                Work Email
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 4a1 1 0 0 0-.894.553L12 13.077l10.894-8.524A1 1 0 0 0 22 4H2z" />
                  <path d="M2 6.154v10.846a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V6.154l-10.894 8.524L2 6.154z" />
                </svg>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-10 pr-4 py-2.5 rounded-lg h-11 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-500 tracking-widest uppercase">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" />
                  <path d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-10 pr-10 py-2.5 rounded-lg h-11 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm7.31-7.31l.58.58.77.77c1.36.59 2.58 1.49 3.56 2.62.74-.99 1.35-2.12 1.8-3.38-1.73-4.39-6-7.5-11-7.5-1.9 0-3.72.38-5.38 1.06l.77.77c1.02-.56 2.17-.89 3.39-.89 4.41 0 8 3.59 8 8 0 1.22-.33 2.37-.89 3.39z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password - Only for Sign Up */}
            {isSignUp && (
              <div className="mb-6">
                <label className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" />
                    <path d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z" />
                  </svg>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-10 pr-10 py-2.5 rounded-lg h-11 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleClickShowConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm7.31-7.31l.58.58.77.77c1.36.59 2.58 1.49 3.56 2.62.74-.99 1.35-2.12 1.8-3.38-1.73-4.39-6-7.5-11-7.5-1.9 0-3.72.38-5.38 1.06l.77.77c1.02-.56 2.17-.89 3.39-.89 4.41 0 8 3.59 8 8 0 1.22-.33 2.37-.89 3.39z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-black font-semibold rounded-lg transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing in..."
                : isSignUp
                ? "Create Account"
                : "Continue to dashboard"}
              {!isLoading && !isSignUp && (
                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-zinc-500">
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-25px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}

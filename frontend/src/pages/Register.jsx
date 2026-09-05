import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await register(name, email, password);
      navigate("/account");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell section-pad pt-24 max-w-md mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--ink-muted)]">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--accent)] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;

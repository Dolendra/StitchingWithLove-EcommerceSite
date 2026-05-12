import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem("auth_user");
		return raw ? JSON.parse(raw) : null;
	});
	const isAuthenticated = !!token;

	useEffect(() => {
		if (token) localStorage.setItem("auth_token", token); else localStorage.removeItem("auth_token");
		if (user) localStorage.setItem("auth_user", JSON.stringify(user)); else localStorage.removeItem("auth_user");
	}, [token, user]);

	const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Login failed"
    );
  }
};

const register = async (name, email, password) => {
  try {
    const response = await authAPI.register({ name, email, password });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Register failed"
    );
  }
};

const logout = () => {
  setToken("");
  setUser(null);
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};


	const value = useMemo(() => ({ token, user, isAuthenticated, login, register, logout }), [token, user, isAuthenticated]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

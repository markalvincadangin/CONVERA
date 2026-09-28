"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser, UserWorkspace } from "./types";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  workspaces: UserWorkspace[];
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    activeProjectId?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res && res.authenticated && res.user) {
        setUser(res.user);
        setWorkspaces(res.workspaces || []);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setWorkspaces([]);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setWorkspaces([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    activeProjectId?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await authService.register(email, password, displayName, activeProjectId);
      setUser(res.user);
      setIsAuthenticated(true);
      await refreshProfile();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setWorkspaces([]);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        isAuthenticated,
        isLoading,
        loading: isLoading,
        login,
        register,
        logout,
        refreshProfile,
        refreshUser: refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

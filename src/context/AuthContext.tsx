import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  is2FaPending: boolean;
  error: string | null;
  clearError: () => void;
  setError: (err: string | null) => void;
  login: (username: string, password?: string, role?: UserRole) => Promise<{ success: boolean; requires2Fa?: boolean; message?: string }>;
  verify2FaCode: (code: string) => boolean;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [is2FaPending, setIs2FaPending] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [error, setErrorState] = useState<string | null>(null);

  const clearError = () => setErrorState(null);
  const setError = (err: string | null) => setErrorState(err);

  useEffect(() => {
    StorageService.initialize();
    const saved = localStorage.getItem('KSP_SESSION_USER');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('KSP_SESSION_USER');
      }
    } else {
      // Default to Super Admin for immediate seamless preview
      const users = StorageService.getUsers();
      const admin = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
      if (admin) {
        setCurrentUser(admin);
        localStorage.setItem('KSP_SESSION_USER', JSON.stringify(admin));
      }
    }
  }, []);

  const login = async (username: string, password?: string, role?: UserRole): Promise<{ success: boolean; requires2Fa?: boolean; message?: string }> => {
    const users = StorageService.getUsers();
    const cleanIdentifier = username.trim().replace(/[^a-zA-Z0-9@._-]/g, '');

    // 1. Check staff users first
    let target = users.find(
      (u) =>
        u.username.toLowerCase() === cleanIdentifier.toLowerCase() ||
        u.email.toLowerCase() === cleanIdentifier.toLowerCase()
    );

    // 2. If not found in staff, check KSP_ANGGOTA by NIK, No Identitas Koperasi, or PartyId
    if (!target) {
      const members = StorageService.getMembers();
      const matchedMember = members.find(
        (m) =>
          m.nik.replace(/[^0-9]/g, '') === cleanIdentifier ||
          m.partyId.toLowerCase() === cleanIdentifier.toLowerCase() ||
          m.nomorIdentitasKoperasi.toLowerCase() === cleanIdentifier.toLowerCase() ||
          m.noHp.replace(/[^0-9]/g, '') === cleanIdentifier
      );

      if (matchedMember) {
        target = {
          userId: matchedMember.partyId,
          username: matchedMember.nik,
          name: matchedMember.nama,
          email: matchedMember.email || `${matchedMember.partyId.toLowerCase()}@kspkaryamandiri.co.id`,
          role: 'ANGGOTA',
          partyId: matchedMember.partyId,
          nik: matchedMember.nik,
          active: matchedMember.status === 'AKTIF',
          twoFactorEnabled: false,
          createdAt: matchedMember.createdAt,
        };
      }
    }

    if (!target && role) {
      target = users.find((u) => u.role === role);
    }

    if (!target) {
      const msg = 'NIK, Nomor Anggota, atau Username tidak ditemukan dalam database KSP.';
      setErrorState(msg);
      return { success: false, message: msg };
    }

    if (target.twoFactorEnabled) {
      setIs2FaPending(true);
      setPendingUser(target);
      setErrorState(null);
      return { success: true, requires2Fa: true, message: 'Kode 2FA diperlukan.' };
    }

    setErrorState(null);
    setCurrentUser(target);
    localStorage.setItem('KSP_SESSION_USER', JSON.stringify(target));
    StorageService.addAuditLog({
      userId: target.userId,
      userName: target.name,
      role: target.role,
      module: 'AUTH',
      action: 'LOGIN',
      recordId: target.userId,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: `Login berhasil untuk ${target.name} (${target.role} - ${target.nik ? `NIK: ${target.nik}` : target.username})`,
    });

    return { success: true };
  };

  const verify2FaCode = (code: string): boolean => {
    // For demo/production verification simulation, accept 6-digit '123456' or any 6-digit code
    if (code.length === 6 && pendingUser) {
      setCurrentUser(pendingUser);
      localStorage.setItem('KSP_SESSION_USER', JSON.stringify(pendingUser));
      setIs2FaPending(false);
      setPendingUser(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      StorageService.addAuditLog({
        userId: currentUser.userId,
        userName: currentUser.name,
        role: currentUser.role,
        module: 'AUTH',
        action: 'LOGOUT',
        recordId: currentUser.userId,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        message: `Pengguna ${currentUser.name} keluar dari sistem`,
      });
    }
    setCurrentUser(null);
    setIs2FaPending(false);
    setPendingUser(null);
    localStorage.removeItem('KSP_SESSION_USER');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return roles.includes(currentUser.role);
  };

  const switchRole = (role: UserRole) => {
    if (role === 'ANGGOTA') {
      const members = StorageService.getMembers();
      const firstMember = members[0];
      if (firstMember) {
        const memberUser: User = {
          userId: firstMember.partyId,
          username: firstMember.nik,
          name: firstMember.nama,
          email: firstMember.email,
          role: 'ANGGOTA',
          partyId: firstMember.partyId,
          nik: firstMember.nik,
          active: true,
          createdAt: firstMember.createdAt,
        };
        setCurrentUser(memberUser);
        localStorage.setItem('KSP_SESSION_USER', JSON.stringify(memberUser));
        return;
      }
    }

    const users = StorageService.getUsers();
    const userForRole = users.find((u) => u.role === role) || {
      userId: `USR-${role}`,
      username: role.toLowerCase(),
      name: `${(role || '').replace(/_/g, ' ')} Demo`,
      email: `${role.toLowerCase()}@kspkaryamandiri.co.id`,
      role,
      active: true,
      createdAt: '2026-01-01',
    };

    setCurrentUser(userForRole);
    localStorage.setItem('KSP_SESSION_USER', JSON.stringify(userForRole));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        is2FaPending,
        error,
        clearError,
        setError,
        login,
        verify2FaCode,
        logout,
        hasRole,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

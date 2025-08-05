import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { Agency } from '../types/agency';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateAgencySettings: (settings: Agency) => Promise<void>;
  agencySettings: Agency;
  users: User[];
  updateUsers: (users: User[]) => void;
  markNotificationsAsRead: (contactId: string, commentIds: string[]) => void;
  toggleCommentRead: (contactId: string, commentId: string) => void;
  loginFromApi: (user: User) => void; //
}

const defaultAgencySettings: Agency = {
  id: 'default',
  name: 'Smile Assurances',
  address: '123 Avenue des Assurances, 75001 Paris',
  siren: '123456789',
  logo: '/images/Smile-removebg-preview.png',
  squareLogo: '/images/Smile-removebg-preview.png',
  createdAt: new Date().toISOString(),
  createdBy: 'system',
  status: 'active'
};

const defaultUsers: User[] = [
  {
    id: 'superadmin',
    email: 'superadmin@smile-assurance.fr',
    name: 'Super Admin',
    role: 'superadmin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    readNotifications: {}
  },
  {
    id: '1',
    email: 'manager@smile-assurance.fr',
    name: 'Jean Martin',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    readNotifications: {},
    agencyId: 'default'
  },
  {
    id: '2',
    email: 'employee@smile-assurance.fr',
    name: 'Marie Dubois',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    readNotifications: {},
    agencyId: 'default'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : {
      user: null,
      isAuthenticated: false
    };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  });

  const [agencySettings, setAgencySettings] = useState<Agency>(() => {
    const savedSettings = localStorage.getItem('agency');
    const savedMainLogo = localStorage.getItem('agencyMainLogo');
    const savedSquareLogo = localStorage.getItem('agencySquareLogo');
    
    const settings = savedSettings ? JSON.parse(savedSettings) : defaultAgencySettings;
    
    if (savedMainLogo) {
      settings.logo = savedMainLogo;
    }
    if (savedSquareLogo) {
      settings.squareLogo = savedSquareLogo;
    }
    
    return settings;
  });

  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authState]);

  useEffect(() => {
    try {
      const { logo, squareLogo, ...settingsWithoutLogos } = agencySettings;
      localStorage.setItem('agency', JSON.stringify(settingsWithoutLogos));
      
      if (logo && logo !== '/logo.svg') {
        localStorage.setItem('agencyMainLogo', logo);
      }
      if (squareLogo && squareLogo !== '/logo-square.svg') {
        localStorage.setItem('agencySquareLogo', squareLogo);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  }, [agencySettings]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const login = async (email: string, password: string) => {
    const user = users.find(u => u.email === email);
    
    if (user && password === 'password123') {
      const userWithNotifications = {
        ...user,
        readNotifications: user.readNotifications || {}
      };

      setAuthState({
        user: userWithNotifications,
        isAuthenticated: true
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
  };

  const updateUser = (updatedUser: User) => {
    const userWithNotifications = {
      ...updatedUser,
      readNotifications: updatedUser.readNotifications || {}
    };

    setAuthState(prev => ({
      ...prev,
      user: userWithNotifications
    }));
    
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userWithNotifications.id ? userWithNotifications : u)
    );
  };

  const updateUsers = (newUsers: User[]) => {
    const usersWithNotifications = newUsers.map(user => ({
      ...user,
      readNotifications: user.readNotifications || {}
    }));

    setUsers(usersWithNotifications);
    
    if (authState.user) {
      const updatedCurrentUser = usersWithNotifications.find(u => u.id === authState.user?.id);
      if (updatedCurrentUser) {
        setAuthState(prev => ({
          ...prev,
          user: updatedCurrentUser
        }));
      }
    }
  };

  const markNotificationsAsRead = (contactId: string, commentIds: string[]) => {
    if (!authState.user) return;

    const updatedUser = {
      ...authState.user,
      readNotifications: {
        ...authState.user.readNotifications,
        [contactId]: Array.from(new Set([
          ...(authState.user.readNotifications[contactId] || []),
          ...commentIds
        ]))
      }
    };

    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));

    setUsers(prevUsers =>
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  const toggleCommentRead = (contactId: string, commentId: string) => {
    if (!authState.user) return;

    const updatedUser = {
      ...authState.user,
      readNotifications: {
        ...authState.user.readNotifications,
        [contactId]: authState.user.readNotifications[contactId]?.includes(commentId)
          ? authState.user.readNotifications[contactId].filter(id => id !== commentId)
          : [...(authState.user.readNotifications[contactId] || []), commentId]
      }
    };

    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));

    setUsers(prevUsers =>
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  const updateAgencySettings = async (settings: Agency): Promise<void> => {
    try {
      setAgencySettings(settings);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw new Error('Impossible de mettre à jour les paramètres de l\'agence');
    }
  };

  const loginFromApi = (user: User) => {
    const userWithNotifications = {
      ...user,
      readNotifications: user.readNotifications || {}
    };

    setAuthState({
      user: userWithNotifications,
      isAuthenticated: true
    });

    setUsers(prevUsers => {
      const alreadyExists = prevUsers.find(u => u.id === user.id);
      return alreadyExists ? prevUsers : [...prevUsers, userWithNotifications];
    });
  };


  const value = {
    ...authState,
    login,
    loginFromApi,
    logout,
    updateUser,
    agencySettings,
    updateAgencySettings,
    users,
    updateUsers,
    markNotificationsAsRead,
    toggleCommentRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Handshake,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  UserCheck,
  UserCog,
  Building2,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, agencySettings, toggleCommentRead } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { contacts } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close menus on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Navigation items based on user role
  const navigation = React.useMemo(() => {
    if (user?.role === 'superadmin') {
      return [
        { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
        { name: 'Agences', href: '/agencies', icon: Building2 },
        { name: 'Utilisateurs', href: '/users', icon: Users },
      ];
    }

    return [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Clients', href: '/clients', icon: UserCheck },
      { name: 'Prospects', href: '/prospects', icon: UserCog },
      { name: 'Contrats', href: '/contracts', icon: FileText },
      { name: 'Partenaires', href: '/partners', icon: Handshake },
    ];
  }, [user?.role]);

  // Calculate total unread notifications
  const unreadNotifications = React.useMemo(() => {
    return contacts.reduce((total, contact) => {
      const commentaires = contact.commentaires ?? [];
      const userNotifs = user.readNotifications || {};

      if (!userNotifs[contact.id]) {
        return total + commentaires.length;
      }
      const unreadComments = commentaires.filter(
        comment => !userNotifs[contact.id]?.includes(comment.id)
      );
      return total + unreadComments.length;
    }, 0);
  }, [contacts, user]);


  // Get unread notifications details
  const getUnreadNotifications = React.useCallback(() => {
    if (!user) return [];
    
    return contacts
      .filter(contact => {
        const commentaires = contact.commentaires ?? [];
        if (!user.readNotifications?.[contact.id]) {
          return commentaires.length > 0;
        }
        return commentaires.some(
          comment => !user.readNotifications[contact.id]?.includes(comment.id)
        );
      })

      .map(contact => {
        const unreadComments = contact.commentaires.filter(comment => 
          !user.readNotifications[contact.id]?.includes(comment.id)
        );
        return {
          contactId: contact.id,
          contactName: `${contact.prenom} ${contact.nom}`,
          comments: unreadComments
        };
      });
  }, [contacts, user]);

  const handleMarkAllAsRead = () => {
    if (!user) return;
    
    contacts.forEach(contact => {
      const commentIds = contact.commentaires.map(comment => comment.id);
      if (commentIds.length > 0) {
        toggleCommentRead(contact.id, commentIds);
      }
    });
    setShowNotifications(false);
  };

  const handleNotificationClick = (contactId: string, commentId: string) => {
    navigate(`/contacts?id=${contactId}&commentId=${commentId}`);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setProfileOpen(false);
  };

  const renderLogo = () => {
    const showSquareLogo = isCollapsed && !isHovering && agencySettings?.squareLogo;
    const defaultLogo = agencySettings?.logo !== '/logo.svg';
    const logoClasses = `transition-all duration-300 ease-spring ${isCollapsed && !isHovering ? 'h-8 w-8' : 'h-8'} object-contain`;

    return (
      <div className={`flex-shrink-0 flex items-center px-4 transition-all duration-300 ease-spring ${isCollapsed && !isHovering ? 'justify-center' : 'justify-start'}`}>
        {defaultLogo ? (
          <img 
            src={showSquareLogo ? agencySettings?.squareLogo : agencySettings?.logo}
            alt="Logo" 
            className={logoClasses}
            style={{ maxWidth: isCollapsed && !isHovering ? '32px' : '200px' }}
          />
        ) : (
          <Shield className="text-indigo-600 dark:text-indigo-400 h-8 w-8" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-spring z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-spring z-50 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {renderLogo()}
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                } group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-spring hover:scale-105`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div 
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-spring ${isCollapsed && !isHovering ? 'lg:w-20' : 'lg:w-72'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between px-4 mb-4">
              {renderLogo()}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-spring"
              >
                {isCollapsed && !isHovering ? (
                  <ChevronRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronLeft className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-spring hover:scale-105`}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  <span className={`ml-3 transition-all duration-300 ease-spring ${isCollapsed && !isHovering ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ease-spring ${
          isCollapsed && !isHovering ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Top navigation bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="lg:hidden px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200 ease-spring hover:scale-110"
              >
                {theme === 'dark' ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>

              {user && !user.role?.includes('superadmin') && (
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200 ease-spring hover:scale-110"
                  >
                    <div className="relative">
                      <Bell className="h-6 w-6" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </div>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Notifications
                          </h3>
                          {unreadNotifications > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                            >
                              Tout marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {getUnreadNotifications().length > 0 ? (
                          getUnreadNotifications().map(({ contactId, contactName, comments }) => (
                            <div key={contactId}>
                              {comments.map(comment => (
                                <div
                                  key={comment.id}
                                  onClick={() => handleNotificationClick(contactId, comment.id)}
                                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex items-center space-x-3">
                                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {contactName}
                                      </p>
                                      <p className="text-sm text-gray-500 line-clamp-2">
                                        {comment.contenu}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(comment.date).toLocaleDateString('fr-FR', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p>Aucune notification non lue</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {user && (
                <div className="relative">
                  <button
                    className="flex items-center space-x-3 focus:outline-none transition-transform duration-200 ease-spring hover:scale-105"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div className="hidden md:flex md:items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.nom}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-spring">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                          <p className="font-medium">{user.nom}</p>
                          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        {user.role === 'manager' && (
                          <button
                            onClick={handleSettingsClick}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200 ease-spring"
                          >
                            <Settings className="mr-3 h-4 w-4" /> Paramètres
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center transition-colors duration-200 ease-spring"
                        >
                          <LogOut className="mr-3 h-4 w-4" /> Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
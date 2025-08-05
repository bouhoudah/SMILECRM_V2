import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AgencyProvider } from './context/AgencyContext';
import AppRoutes from './routes';
import DocumentUploaderConnected from './components/DocumentUploaderConnected';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AgencyProvider>
          <DataProvider>
            <Router>
              <AppRoutes />
            </Router>
          </DataProvider>
        </AgencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
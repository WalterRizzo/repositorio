import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "@/react-app/hooks/useAuth";
import { ThemeProvider } from "@/react-app/hooks/useTheme";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import ExpensesPage from "@/react-app/pages/Expenses";
import ReportsPage from "@/react-app/pages/Reports";
import SettingsPage from "@/react-app/pages/Settings";
import AdminPage from "@/react-app/pages/Admin";
import CierreViajesPage from "@/react-app/pages/CierreViajes";
import UserManagementPage from "@/react-app/pages/UserManagement";
import DocumentationPage from "@/react-app/pages/Documentation";
import ChequesPage from "@/react-app/pages/Cheques";
import PendingExpensesNotifier from "@/react-app/components/PendingExpensesNotifier";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Cargando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <PendingExpensesNotifier />
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
            <Route path="/cierre-viajes" element={<ProtectedRoute><CierreViajesPage /></ProtectedRoute>} />
            <Route path="/documentation" element={<ProtectedRoute><DocumentationPage /></ProtectedRoute>} />
            <Route path="/cheques" element={<ProtectedRoute><ChequesPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

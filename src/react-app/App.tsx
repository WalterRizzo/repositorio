import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/hooks/useAuth";
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
import PendingExpensesNotifier from "@/react-app/components/PendingExpensesNotifier";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <PendingExpensesNotifier />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/categories" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/cierre-viajes" element={<CierreViajesPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

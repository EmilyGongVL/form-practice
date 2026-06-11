import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import FormList from './pages/FormList';
import BuilderPage from './pages/BuilderPage';
import PublicForm from './pages/PublicForm';
import HelpPage from './pages/HelpPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
        <Route path="/builder/:identifier" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
        <Route path="/form/:identifier" element={<PublicForm />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

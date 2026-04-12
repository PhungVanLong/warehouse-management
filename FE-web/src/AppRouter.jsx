import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import UpdatePasswordForm from "./components/UpdatePasswordForm";
import SuppliesPage from "./pages/SuppliesPage";
import SuppliesDetailPage from "./pages/SuppliesDetailPage";
import SuppliesCreatePage from "./pages/SuppliesCreatePage";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/update-password" element={<UpdatePasswordForm />} />
                <Route path="/supplies" element={<SuppliesPage />} />
                <Route path="/supplies/create" element={<SuppliesCreatePage />} />
                <Route path="/supplies/:id" element={<SuppliesDetailPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

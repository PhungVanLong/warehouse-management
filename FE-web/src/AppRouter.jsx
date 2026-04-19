import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import UpdatePasswordForm from "./components/UpdatePasswordForm";
import SuppliesPage from "./pages/supplies/SuppliesPage";
import SuppliesDetailPage from "./pages/supplies/SuppliesDetailPage";
import SuppliesCreatePage from "./pages/supplies/SuppliesCreatePage";
import PartnersPage from "./pages/partners/PartnersPage";
import PartnersDetailPage from "./pages/partners/PartnersDetailPage";
import PartnersCreatePage from "./pages/partners/PartnersCreatePage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeesDetailPage from "./pages/employees/EmployeesDetailPage";
import EmployeesCreatePage from "./pages/employees/EmployeesCreatePage";
import AccountPage from "./pages/account/AccountPage";
import LocationsPage from "./pages/locations/LocationsPage";
import LocationsDetailPage from "./pages/locations/LocationsDetailPage";
import LocationsCreatePage from "./pages/locations/LocationsCreatePage";
import ReceiptsPage from "./pages/receipts/ReceiptsPage";
import ReceiptCreatePage from "./pages/receipts/ReceiptCreatePage";
import ReceiptDetailPage from "./pages/receipts/ReceiptDetailPage";
import IssuesPage from "./pages/issues/IssuesPage";
import IssueCreatePage from "./pages/issues/IssueCreatePage";
import IssueDetailPage from "./pages/issues/IssueDetailPage";
import SidebarLayout from "./components/SidebarLayout";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                {/* Auth routes - không có sidebar */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/update-password" element={<UpdatePasswordForm />} />

                {/* Các route còn lại đều bọc SidebarLayout */}
                <Route element={<SidebarLayout />}>
                    <Route path="/supplies" element={<SuppliesPage />} />
                    <Route path="/supplies/create" element={<SuppliesCreatePage />} />
                    <Route path="/supplies/:id" element={<SuppliesDetailPage />} />
                    <Route path="/partners" element={<PartnersPage />} />
                    <Route path="/partners/create" element={<PartnersCreatePage />} />
                    <Route path="/partners/:id" element={<PartnersDetailPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/employees/create" element={<EmployeesCreatePage />} />
                    <Route path="/employees/:id" element={<EmployeesDetailPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/locations" element={<LocationsPage />} />
                    <Route path="/locations/create" element={<LocationsCreatePage />} />
                    <Route path="/locations/:id" element={<LocationsDetailPage />} />
                    <Route path="/receipts" element={<ReceiptsPage />} />
                    <Route path="/receipts/create" element={<ReceiptCreatePage />} />
                    <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
                    <Route path="/issues" element={<IssuesPage />} />
                    <Route path="/issues/create" element={<IssueCreatePage />} />
                    <Route path="/issues/:id" element={<IssueDetailPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

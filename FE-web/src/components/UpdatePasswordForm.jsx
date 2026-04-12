
import React from "react";
import { Link } from "react-router-dom";
import "./LoginForm.css";

export default function UpdatePasswordForm() {
    return (
        <div className="center-page">
            <div className="login-panel">
                <Link to="/login" className="back-arrow" style={{ position: 'absolute', left: 24, top: 24, textDecoration: 'none' }} title="Quay lại đăng nhập">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#277d4b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </Link>
                <img className="login-logo" src="/src/assets/logo.png" alt="Logo" />
                <div className="login-copy">
                    <h1>Cập nhật mật khẩu mới</h1>
                    <p className="supporting-text">
                        Nhập mật khẩu mới cho tài khoản của bạn.
                    </p>
                </div>
                <form className="login-form">
                    <label className="input-field">
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24"><path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 7.73V17a1 1 0 0 0 2 0v-1.27a2 2 0 1 0-2 0ZM10 8V6a2 2 0 1 1 4 0v2Z" /></svg>
                        </span>
                        <input type="password" placeholder="Mật khẩu mới" />
                    </label>
                    <label className="input-field">
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24"><path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 7.73V17a1 1 0 0 0 2 0v-1.27a2 2 0 1 0-2 0ZM10 8V6a2 2 0 1 1 4 0v2Z" /></svg>
                        </span>
                        <input type="password" placeholder="Nhập lại mật khẩu mới" />
                    </label>
                    <button className="login-button" type="submit">Cập nhật mật khẩu</button>
                </form>
            </div>
        </div>
    );
}


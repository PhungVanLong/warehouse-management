import React from "react";
import "./LoginForm.css";

export default function RegisterForm() {
    return (
        <div className="center-page">
            <div className="login-panel">
                <img className="login-logo" src="/src/assets/logo.png" alt="Logo" />
                <div className="login-copy">
                    <h1>Đăng ký tài khoản</h1>
                    <p className="supporting-text">
                        Tạo tài khoản mới để sử dụng hệ thống quản lý kho.
                    </p>
                </div>
                <form className="login-form">
                    <label className="input-field">
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.79-6 4v1h12v-1c0-2.21-2.67-4-6-4Z" /></svg>
                        </span>
                        <input type="text" placeholder="Tài khoản" />
                    </label>
                    <label className="input-field">
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24"><path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 7.73V17a1 1 0 0 0 2 0v-1.27a2 2 0 1 0-2 0ZM10 8V6a2 2 0 1 1 4 0v2Z" /></svg>
                        </span>
                        <input type="password" placeholder="Mật khẩu" />
                    </label>
                    <label className="input-field">
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.79-6 4v1h12v-1c0-2.21-2.67-4-6-4Z" /></svg>
                        </span>
                        <input type="text" placeholder="Họ và tên" />
                    </label>
                    <label className="input-field">
                        <span className="input-icon">
                            <svg viewBox="0 0 24 24"><path d="M21 8V7a5 5 0 0 0-10 0v1a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-5-3a3 3 0 0 1 3 3v1h-6V8a3 3 0 0 1 3-3Zm4 12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1Z" /></svg>
                        </span>
                        <input type="email" placeholder="Email" />
                    </label>
                    <button className="login-button" type="submit">Đăng ký</button>
                </form>
            </div>
        </div>
    );
}
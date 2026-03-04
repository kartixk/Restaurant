// src/pages/ManagerSettings.jsx
import React, { useRef, useState } from "react";
import ManagerLayout from "../components/ManagerLayout";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function ManagerSettings() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <ManagerLayout>
            <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Account Settings</h1>
                        <p className="text-base text-slate-500 font-medium">Manage your profile and session settings.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-[800px] mx-auto flex flex-col gap-8 shadow-sm">
                    <div>
                        <h2 className="text-[1.1rem] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Personal Profile</h2>
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[2rem] flex items-center justify-center font-bold flex-shrink-0">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="grid grid-cols-[120px,1fr] items-center">
                                    <span className="text-slate-500 text-sm font-medium">Full Name</span>
                                    <span className="font-semibold text-slate-900">{user?.name || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-[120px,1fr] items-center">
                                    <span className="text-slate-500 text-sm font-medium">Email Address</span>
                                    <span className="font-semibold text-slate-900">{user?.email || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-[120px,1fr] items-center">
                                    <span className="text-slate-500 text-sm font-medium">Account Role</span>
                                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[0.65rem] font-bold rounded uppercase tracking-wider w-fit">{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-[1.1rem] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Session</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            You are currently signed in as <span className="font-bold text-slate-900">{user?.name}</span>. Signing out will end your current session.
                        </p>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full p-3 px-4 border border-red-200 bg-white text-red-500 text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50 rounded-xl"
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}

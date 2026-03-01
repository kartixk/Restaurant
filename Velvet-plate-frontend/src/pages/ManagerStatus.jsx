import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { Clock, LogOut } from "lucide-react";

export default function ManagerStatus() {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                if (res.data) {
                    if (res.data.storeStatus?.toLowerCase() === "verified") navigate("/manager/dashboard");
                    // If still under_review, stay here
                } else {
                    navigate("/manager/onboarding");
                }
            } catch (err) {
                if (err.response?.status === 404) navigate("/manager/onboarding");
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [navigate]);

    if (loading) return null;

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const S = {
        container: { minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Inter', sans-serif" },
        card: { background: "#fff", maxWidth: "500px", width: "100%", padding: "4rem 2rem", textAlign: "center", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1.5rem" },
        iconBox: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#fffbeb", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "2.5rem" },
        btnOutlined: { padding: "0.75rem 1.5rem", borderRadius: "10px", backgroundColor: "transparent", color: "#ef4444", border: "1px solid #fca5a5", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", margin: "1rem auto 0 auto" }
    };

    return (
        <div style={S.container}>
            <div style={S.card}>
                <div style={S.iconBox}>
                    <Clock size={40} />
                </div>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.75rem 0", color: "#0f172a" }}>Application Under Review</h1>
                    <p style={{ color: "#475569", margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>
                        Your store profile has been successfully submitted and is currently being verified by our team.
                        We will review your FSSAI license and bank details shortly. Once approved, your Partner Dashboard will be fully activated.
                    </p>
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <button onClick={handleLogout} style={S.btnOutlined}>Logout Securely</button>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1.5rem' }}>Need help? Contact support at partner@foodflow.com</p>
                </div>
            </div>
        </div>
    );
}

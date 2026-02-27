import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateBranch } from "../../../hooks/useBranches";
import { toast } from "react-toastify";

// --- Icons ---
const Icons = {
    Store: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Location: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Phone: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Legal: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Visibility: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    X: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function BranchSettingsModal({ isOpen, onClose, branch }) {
    const updateBranchMutation = useUpdateBranch();
    const [formData, setFormData] = useState({
        name: "",
        branchName: "",
        location: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        gstNumber: "",
        fssaiLicense: "",
        isVisible: false,
        storeStatus: "pending"
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || "",
                branchName: branch.branchName || "",
                location: branch.location || "",
                address: branch.address || "",
                city: branch.city || "",
                state: branch.state || "",
                pincode: branch.pincode || "",
                phone: branch.phone || "",
                gstNumber: branch.gstNumber || "",
                fssaiLicense: branch.fssaiLicense || "",
                isVisible: branch.isVisible || false,
                storeStatus: branch.storeStatus || "pending"
            });
        }
    }, [branch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateBranchMutation.mutate(
            { id: branch.id, data: formData },
            {
                onSuccess: () => {
                    toast.success("Branch settings updated successfully!");
                    onClose();
                },
                onError: (err) => {
                    toast.error(err?.response?.data?.message || "Failed to update branch settings");
                }
            }
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={overlayStyle} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    style={modalStyle}
                    className="hide-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <style>{`
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    {/* Header */}
                    <div style={headerStyle}>
                        <div>
                            <h2 style={titleStyle}>Branch Master Settings</h2>
                            <p style={subtitleStyle}>Configure operational and legal details for this location.</p>
                        </div>
                        <button onClick={onClose} style={closeBtnStyle}><Icons.X /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={formStyle}>
                        {/* Section: Basic Information */}
                        <div style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <div style={iconBoxStyle}><Icons.Store /></div>
                                <h3 style={sectionTitleStyle}>Basic Information</h3>
                            </div>
                            <div style={gridStyle}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Display Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="e.g. FoodFlow Downtown" required />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Official Entity Name</label>
                                    <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} style={inputStyle} placeholder="Registered company name" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Location & Contact */}
                        <div style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <div style={{ ...iconBoxStyle, backgroundColor: '#EFF6FF', color: '#3B82F6' }}><Icons.Location /></div>
                                <h3 style={sectionTitleStyle}>Location & Contact</h3>
                            </div>
                            <div style={gridStyle}>
                                <div style={{ ...inputGroupStyle, gridColumn: "span 2" }}>
                                    <label style={labelStyle}>Full Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px" }} placeholder="Complete street address" />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Pincode</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Operational Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Compliance & Status */}
                        <div style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <div style={{ ...iconBoxStyle, backgroundColor: '#F0FDF4', color: '#22C55E' }}><Icons.Legal /></div>
                                <h3 style={sectionTitleStyle}>Compliance & Status</h3>
                            </div>
                            <div style={gridStyle}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>GST Number</label>
                                    <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>FSSAI License</label>
                                    <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Branch Status</label>
                                    <select name="storeStatus" value={formData.storeStatus} onChange={handleChange} style={selectStyle}>
                                        <option value="pending">Pending Onboarding</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="verified">Verified (Active)</option>
                                    </select>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Public Presence</label>
                                    <label style={toggleContainerStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Icons.Visibility />
                                            <span style={{ fontWeight: 600 }}>Visible to Customers</span>
                                        </div>
                                        <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} style={checkStyle} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={footerStyle}>
                            <button type="button" onClick={onClose} style={cancelBtnStyle}>Discard Changes</button>
                            <button type="submit" style={saveBtnStyle} disabled={updateBranchMutation.isLoading}>
                                {updateBranchMutation.isLoading ? "Saving..." : "Update Branch Profile"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// --- Premium Styles ---
const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px"
};

const modalStyle = {
    backgroundColor: "#FFFFFF", borderRadius: "1.25rem",
    width: "100%", maxWidth: "760px", maxHeight: "90vh",
    overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex", flexDirection: "column", border: "1px solid #E2E8F0"
};

const headerStyle = {
    padding: "24px 32px", borderBottom: "1px solid #F1F5F9",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    backgroundColor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10
};

const titleStyle = { margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" };
const subtitleStyle = { margin: "4px 0 0 0", fontSize: "0.875rem", color: "#64748B", fontWeight: 500 };

const closeBtnStyle = {
    border: "none", background: "#F1F5F9", borderRadius: "10px",
    color: "#64748B", cursor: "pointer", padding: "8px", display: "flex",
    alignItems: "center", justifyContent: "center", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": { backgroundColor: "#E2E8F0", color: "#0F172A", transform: "scale(1.05)" }
};

const formStyle = { padding: "32px" };

const sectionStyle = { marginBottom: "32px" };

const sectionHeaderStyle = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" };

const iconBoxStyle = {
    width: "36px", height: "36px", borderRadius: "10px",
    backgroundColor: "#FFF7ED", color: "#FF5A00",
    display: "flex", alignItems: "center", justifyContent: "center"
};

const sectionTitleStyle = { margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1E293B", letterSpacing: "-0.01em" };

const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" };

const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "8px" };

const labelStyle = { fontSize: "0.80rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em" };

const inputStyle = {
    padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E2E8F0",
    fontSize: "0.95rem", color: "#0F172A", fontWeight: 500, outline: "none",
    transition: "all 0.2s", width: "100%", backgroundColor: "#F8FAFC",
    boxSizing: "border-box"
};

const selectStyle = { ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" };

const toggleContainerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F8FAFC',
    border: '1.5px solid #E2E8F0', cursor: 'pointer', color: '#475569', transition: 'all 0.2s',
    height: '47px', boxSizing: 'border-box'
};

const checkStyle = { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FF5A00' };

const footerStyle = {
    marginTop: "16px", paddingTop: "24px", borderTop: "1px solid #F1F5F9",
    display: "flex", justifyContent: "flex-end", gap: "16px"
};

const cancelBtnStyle = {
    padding: "12px 24px", borderRadius: "10px", fontSize: "0.95rem",
    fontWeight: 600, cursor: "pointer", border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF", color: "#64748B", transition: "all 0.2s"
};

const saveBtnStyle = {
    padding: "12px 32px", borderRadius: "10px", fontSize: "0.95rem",
    fontWeight: 700, cursor: "pointer", border: "none",
    backgroundColor: "#FF5A00", color: "#FFFFFF",
    boxShadow: "0 10px 15px -3px rgba(255, 90, 0, 0.25)", transition: "all 0.2s",
    display: "flex", alignItems: "center", justifyContent: "center"
};

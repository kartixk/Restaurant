import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, MapPin, RefreshCw, FileText, Store, Upload, Image as ImageIcon, CheckCircle, FileUp, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function ManagerOnboarding({ onComplete }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", branchName: "", phone: "",
        address: "", city: "", state: "", pincode: "",
        gstNumber: "", fssaiLicense: "",
        bankAccountName: "", bankAccountNumber: "", bankIfscCode: "",
        openTime: "10:00", closeTime: "22:00",
        fssaiPdfUrl: "", gstPdfUrl: "", bankPassbookPdfUrl: "", managerPhotoUrl: ""
    });

    const [uploading, setUploading] = useState({
        fssaiDoc: false, gstDoc: false, bankPassbook: false, managerPhoto: false
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Self-redirect if already onboarded
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                if (res.data) {
                    const status = res.data.storeStatus?.toLowerCase();
                    if (status === "verified") navigate("/manager/dashboard");
                    else if (status === "under_review") navigate("/manager/status");
                }
            } catch (err) {
                // 404 is expected for new managers
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [navigate]);

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large! Maximum size is 5MB.");
            return;
        }

        const uploadData = new FormData();
        uploadData.append(field, file);

        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const res = await api.post("/branches/upload", uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fieldToUrlMap = {
                fssaiDoc: 'fssaiPdfUrl',
                gstDoc: 'gstPdfUrl',
                bankPassbook: 'bankPassbookPdfUrl',
                managerPhoto: 'managerPhotoUrl'
            };

            const urlField = fieldToUrlMap[field];
            setFormData(prev => ({ ...prev, [urlField]: res.data.urls[field] }));
            toast.success("Document uploaded successfully!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Upload failed");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Required documents
        if (!formData.fssaiPdfUrl) return toast.warning("Please upload FSSAI License PDF");
        if (!formData.gstPdfUrl) return toast.warning("Please upload GST Certificate PDF");
        if (!formData.bankPassbookPdfUrl) return toast.warning("Please upload Bank Passbook first page PDF");
        if (!formData.managerPhotoUrl) return toast.warning("Please upload your profile photo");

        setSubmitting(true);
        try {
            await api.post("/branches/onboard", formData);
            toast.success("Store details submitted for review! 🚀");
            setTimeout(() => {
                if (onComplete) onComplete();
                else navigate("/manager/dashboard");
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit store details");
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Component for File Inputs
    const FileInput = ({ field, label, icon: Icon, type = "pdf", currentUrl }) => (
        <div style={S.inputGroup}>
            <label style={S.label}>{label} *</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="file"
                    accept={type === 'pdf' ? 'application/pdf' : 'image/*'}
                    onChange={(e) => handleFileUpload(e, field)}
                    style={{ display: 'none' }}
                    id={field}
                />
                <label
                    htmlFor={field}
                    style={{
                        ...S.fileLabel,
                        borderColor: uploading[field] ? '#FF5A00' : currentUrl ? '#16A34A' : '#E2E8F0',
                        background: currentUrl ? '#F0FDF4' : '#F8FAFC'
                    }}
                >
                    {uploading[field] ? (
                        <RefreshCw size={18} color="#FF5A00" className="spin-slow" />
                    ) : currentUrl ? (
                        <CheckCircle size={18} color="#16A34A" />
                    ) : (
                        <FileUp size={18} color="#64748B" />
                    )}
                    <span style={{ color: currentUrl ? '#16A34A' : '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
                        {uploading[field] ? 'Uploading...' : currentUrl ? 'Document Attached' : 'Choose File'}
                    </span>
                </label>
            </div>
        </div>
    );

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#FF5A00' }}><RefreshCw className="spin" /></div>;

    return (
        <div style={S.container}>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div style={S.animatedBackground}></div>
            <motion.div style={S.blob1} animate={{ y: [0, -20, 0], x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} />
            <motion.div style={S.blob2} animate={{ y: [0, 30, 0], x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} />

            <motion.div
                style={S.card}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div style={S.header}>
                    {/* Profile Photo Upload Section */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="managerPhoto"
                            style={{
                                ...S.logo,
                                width: '100px', height: '100px',
                                background: formData.managerPhotoUrl ? `url(http://localhost:4000${formData.managerPhotoUrl}) center/cover` : '#FFF7F5',
                                border: formData.managerPhotoUrl ? '2px solid #FF5A00' : '2px dashed #FFD8CC',
                                margin: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <input type="file" accept="image/*" id="managerPhoto" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'managerPhoto')} />
                            {uploading.managerPhoto ? (
                                <div style={{ background: 'rgba(255,255,255,0.7)', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw size={24} color="#FF5A00" className="spin" />
                                </div>
                            ) : !formData.managerPhotoUrl && (
                                <div style={{ textAlign: 'center' }}>
                                    <ImageIcon size={32} color="#FF5A00" style={{ opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.65rem', color: '#FF5A00', margin: '4px 0 0', fontWeight: 700 }}>PHOTO *</p>
                                </div>
                            )}
                        </label>
                    </div>

                    <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em" }}>Partner Onboarding</h1>
                    <p style={{ color: "#64748B", margin: "0.5rem 0 0 0", fontWeight: 500 }}>Submit your legal and business profile for verification.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "2.5rem 3rem" }}>

                    {/* Basic Info */}
                    <motion.div variants={itemVariants}>
                        <h3 style={{ ...S.sectionTitle, marginTop: 0 }}><Building size={20} color="#FF5A00" /> Basic Information</h3>
                        <div style={S.grid2}>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Restaurant Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={S.input} placeholder="e.g. KFC" />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Branch Area *</label>
                                <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} required style={S.input} placeholder="e.g. Downtown" />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Contact Phone *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={S.input} placeholder="+91 XXXXX XXXXX" />
                            </div>
                        </div>
                    </motion.div>

                    <div style={S.divider}></div>

                    {/* Location */}
                    <motion.div variants={itemVariants}>
                        <h3 style={S.sectionTitle}><MapPin size={20} color="#FF5A00" /> Location Details</h3>
                        <div style={{ ...S.inputGroup, marginBottom: '1.5rem' }}>
                            <label style={S.label}>Full Address *</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} required style={S.input} placeholder="Street, Building, Landmark..." />
                        </div>
                        <div style={{ ...S.grid2, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                            <div style={S.inputGroup}>
                                <label style={S.label}>City *</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required style={S.input} placeholder="City Name" />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>State *</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} required style={S.input} placeholder="State" />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Pincode *</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required style={S.input} placeholder="XXXXXX" />
                            </div>
                        </div>
                    </motion.div>

                    <div style={S.divider}></div>

                    {/* Operations */}
                    <motion.div variants={itemVariants}>
                        <h3 style={S.sectionTitle}><RefreshCw size={20} color="#FF5A00" /> Operations</h3>
                        <div style={S.grid2}>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Opening Time *</label>
                                <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} required style={S.input} />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Closing Time *</label>
                                <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} required style={S.input} />
                            </div>
                        </div>
                    </motion.div>

                    <div style={S.divider}></div>

                    {/* Legal & Bank */}
                    <motion.div variants={itemVariants}>
                        <h3 style={S.sectionTitle}><FileText size={20} color="#FF5A00" /> Legal & Banking Documents</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ ...S.inputGroup }}>
                                <label style={S.label}>FSSAI License Number *</label>
                                <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} required style={S.input} placeholder="14-digit FSSAI Number" />
                            </div>
                            <FileInput field="fssaiDoc" label="FSSAI License Document (PDF)" currentUrl={formData.fssaiPdfUrl} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div style={{ ...S.inputGroup }}>
                                <label style={S.label}>GST Number *</label>
                                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required style={S.input} placeholder="15-digit GST Number" />
                            </div>
                            <FileInput field="gstDoc" label="GST Certificate (PDF)" currentUrl={formData.gstPdfUrl} />
                        </div>

                        <div style={S.subDivider}></div>

                        <div style={{ ...S.grid2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Account Holder Name *</label>
                                <input type="text" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} required style={S.input} placeholder="Name on Bank Account" />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>Account Number *</label>
                                <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} required style={S.input} placeholder="Account Number" />
                            </div>
                            <div style={S.inputGroup}>
                                <label style={S.label}>IFSC Code *</label>
                                <input type="text" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} required style={S.input} placeholder="IFSC Code" />
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <FileInput field="bankPassbook" label="Bank Passbook / Statement (PDF)" currentUrl={formData.bankPassbookPdfUrl} />
                        </div>
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={submitting}
                        style={{ ...S.btnSubmit, opacity: submitting ? 0.7 : 1 }}
                        whileHover={!submitting ? { scale: 1.02, boxShadow: "0 10px 20px -5px rgba(255, 90, 0, 0.4)" } : {}}
                        whileTap={!submitting ? { scale: 0.98 } : {}}
                    >
                        {submitting ? <RefreshCw className="spin" size={24} /> : "Submit Profile for Review"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

// Daylight & Flame Styles
const S = {
    container: {
        minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "4rem 1rem",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden"
    },
    animatedBackground: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #FFF7F5 100%)', zIndex: 0
    },
    blob1: {
        position: 'fixed', top: '5%', left: '10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255, 90, 0, 0.05) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%', filter: 'blur(40px)', zIndex: 1
    },
    blob2: {
        position: 'fixed', bottom: '5%', right: '10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%', filter: 'blur(60px)', zIndex: 1
    },
    card: {
        background: "#FFFFFF", width: "100%", maxWidth: "850px", borderRadius: "24px",
        border: "1px solid #E2E8F0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
        overflow: "hidden", position: "relative", zIndex: 10
    },
    header: {
        padding: "2.5rem 2rem", borderBottom: "1px solid #F1F5F9", textAlign: "center", background: "#FFFFFF"
    },
    logo: {
        width: "64px", height: "64px", borderRadius: "16px", background: "#FFF7F5", border: "1px solid #FFD8CC",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto",
        backgroundSize: 'cover', backgroundPosition: 'center'
    },
    sectionTitle: {
        fontSize: "1.25rem", fontWeight: 800, margin: "0 0 1.5rem 0", color: "#0F172A",
        display: "flex", alignItems: "center", gap: "0.5rem", letterSpacing: "-0.01em"
    },
    subDivider: {
        height: "1px", width: "100%", backgroundColor: "#F1F5F9", margin: "1.5rem 0", borderStyle: "dashed"
    },
    fileLabel: {
        display: "flex", alignItems: "center", gap: "0.75rem", padding: "12px 16px",
        borderRadius: "10px", border: "2px dashed #E2E8F0", backgroundColor: "#F8FAFC",
        cursor: "pointer", transition: "all 0.2s ease", width: "100%"
    },
    photoBadge: {
        position: 'absolute', bottom: '0', right: '0', background: '#FF5A00',
        width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
    },
    divider: {
        height: "1px", width: "100%", backgroundColor: "#F1F5F9", margin: "2.5rem 0"
    },
    grid2: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem"
    },
    inputGroup: {
        display: "flex", flexDirection: "column", gap: "0.5rem"
    },
    label: {
        fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em"
    },
    input: {
        padding: "12px 16px", borderRadius: "10px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC",
        color: "#0F172A", fontWeight: 500, outline: "none", fontSize: "0.95rem", transition: "all 0.2s"
    },
    btnSubmit: {
        width: "100%", padding: "16px", background: "#FF5A00", color: "#FFFFFF", border: "none",
        borderRadius: "12px", fontSize: "1.05rem", fontWeight: 800, cursor: "pointer",
        margin: "3rem auto 0 auto", display: "flex", justifyContent: "center", alignItems: "center", transition: "all 0.2s"
    },
    loader: {
        width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)',
        borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite'
    }
};
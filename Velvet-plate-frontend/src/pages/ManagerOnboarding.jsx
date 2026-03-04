// src/pages/ManagerOnboarding.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, MapPin, RefreshCw, FileText, CheckCircle, FileUp, Image as ImageIcon, ShieldCheck, Landmark, Globe, Smartphone, User, History } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

export default function ManagerOnboarding({ onComplete }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", branchName: "", phone: "",
        managerName: "", managerPhone: "", managerAddress: "",
        managerCity: "", managerState: "", managerPincode: "",
        panNumber: "", aadharNumber: "",
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
                // Expected for new managers
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [navigate]);

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Protocol Error: Payload exceeds 5MB limit.");
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
            toast.success("Asset Uploaded: Digital twin synchronized.");
        } catch (err) {
            toast.error(err.response?.data?.error || "Binary upload failure.");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fssaiPdfUrl) return toast.warning("Compliance Missing: Upload FSSAI License.");
        if (!formData.gstPdfUrl) return toast.warning("Compliance Missing: Upload GST Certificate.");
        if (!formData.bankPassbookPdfUrl) return toast.warning("Financials Missing: Upload Bank Verification.");
        if (!formData.managerPhotoUrl) return toast.warning("Identity Missing: Upload Verification Portrait.");

        setSubmitting(true);
        try {
            await api.post("/branches/onboard", formData);
            toast.success("Packet Sent: Application is now under audit. 🚀");
            setTimeout(() => {
                if (onComplete) onComplete();
                else navigate("/manager/status");
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Protocol failure: Application submission rejected.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "phone" || name === "managerPhone") value = value.replace(/\D/g, '').slice(0, 10);
        else if (name === "pincode" || name === "managerPincode") value = value.replace(/\D/g, '').slice(0, 6);
        else if (name === "aadharNumber") value = value.replace(/\D/g, '').slice(0, 12);
        else if (name === "panNumber") value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
        else if (name === "gstNumber") value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
        else if (name === "fssaiLicense") value = value.replace(/\D/g, '').slice(0, 14);

        setFormData({ ...formData, [name]: value });
    };

    const FileInput = ({ field, label, type = "pdf", currentUrl }) => (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label} *</label>
            <div className="relative group">
                <input
                    type="file"
                    accept={type === 'pdf' ? 'application/pdf' : 'image/*'}
                    onChange={(e) => handleFileUpload(e, field)}
                    className="hidden"
                    id={field}
                />
                <label
                    htmlFor={field}
                    className={`flex items-center gap-5 p-6 rounded-[32px] border-2 border-dashed cursor-pointer transition-all duration-500 ${uploading[field] ? "border-orange-500 bg-orange-50/20" :
                        currentUrl ? "border-emerald-500 bg-emerald-50/20" :
                            "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
                        }`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${currentUrl ? "bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10" : "bg-white text-slate-300 shadow-sm border border-slate-50"
                        }`}>
                        {uploading[field] ? <RefreshCw size={24} className="animate-spin text-orange-500" /> :
                            currentUrl ? <CheckCircle size={24} /> : <FileUp size={24} />}
                    </div>
                    <div>
                        <p className={`text-[13px] font-black tracking-tight uppercase ${currentUrl ? "text-emerald-700" : "text-slate-900"}`}>
                            {uploading[field] ? 'Uploading Binary...' : currentUrl ? 'Asset Locked' : 'Select Payload'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {type === 'pdf' ? 'PDF (MAX 5MB)' : 'IMAGE (MAX 5MB)'}
                        </p>
                    </div>
                </label>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 gap-6">
            <RefreshCw className="animate-spin text-orange-500" size={48} />
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-40">Compiling Onboarding Environment...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white relative overflow-hidden py-24 px-8 font-sans">
            {/* Dynamic Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden grayscale-[0.2]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100/50 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-100/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 bg-white w-full max-w-6xl mx-auto rounded-[60px] border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
            >
                {/* Header Branding */}
                <div className="p-16 border-b border-slate-50 text-center bg-slate-50/50 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-slate-900 rounded-[28px] shadow-2xl flex items-center justify-center mx-auto mb-8 border-4 border-white rotate-3 group hover:rotate-0 transition-transform duration-500">
                            <Building size={36} className="text-orange-500" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-950 tracking-tighter mb-4">Partner Application</h1>
                        <p className="text-slate-400 font-medium italic text-sm max-w-xl mx-auto">
                            Initiate your digital presence on the Velvet Plate Global Network. Please provide precise entity coordinates and compliance credentials.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-12 lg:p-24 space-y-24">
                    {/* Basic Info */}
                    <section>
                        <div className="flex items-center gap-6 mb-12 overflow-hidden">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] shrink-0 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/20"><Building size={18} /></div>
                                Entity Foundation
                            </h3>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Restaurant Identity *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-[15px] font-black text-slate-950 placeholder:text-slate-300 focus:bg-white focus:border-orange-500 focus:ring-[12px] focus:ring-orange-500/5 transition-all outline-none shadow-inner" placeholder="Velvet Plate Elite" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Primary Deployment Zone *</label>
                                <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} required className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-[15px] font-black text-slate-950 focus:bg-white focus:border-orange-500 focus:ring-[12px] focus:ring-orange-500/5 transition-all outline-none shadow-inner" placeholder="Cyber City Hub" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Business Comms Hub *</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-20 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-[15px] font-black text-slate-950 focus:bg-white focus:border-orange-500 focus:ring-[12px] focus:ring-orange-500/5 transition-all outline-none shadow-inner" placeholder="10-digit number" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Manager Details */}
                    <section>
                        <div className="flex items-center gap-6 mb-12 overflow-hidden">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] shrink-0 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><User size={18} /></div>
                                Governance & Identity
                            </h3>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>
                        <div className="flex flex-col xl:flex-row gap-16 items-start">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                                {[
                                    { label: "Designated Manager Name", name: "managerName", type: "text", ph: "Full Legal Name" },
                                    { label: "Personal Mobile Uplink", name: "managerPhone", type: "tel", ph: "Mobile Number" },
                                    { label: "PAN Identificator", name: "panNumber", type: "text", ph: "ABCDE1234F" },
                                    { label: "Aadhar Bio-Ref", name: "aadharNumber", type: "text", ph: "12-digit UID" },
                                ].map((field) => (
                                    <div key={field.name} className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{field.label} *</label>
                                        <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} required className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[24px] text-sm font-black text-slate-950 focus:border-slate-900 transition-all outline-none shadow-sm uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-300" placeholder={field.ph} />
                                    </div>
                                ))}
                            </div>

                            {/* Manager Profile Photo */}
                            <div className="flex flex-col items-center shrink-0">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Identity Capture *</label>
                                <label
                                    htmlFor="managerPhoto"
                                    className={`w-56 h-56 rounded-[48px] border-4 border-dashed flex items-center justify-center overflow-hidden relative group cursor-pointer transition-all duration-700 hover:rotate-2 shadow-2xl ${formData.managerPhotoUrl ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-slate-50"}`}
                                >
                                    <input type="file" accept="image/*" id="managerPhoto" className="hidden" onChange={(e) => handleFileUpload(e, 'managerPhoto')} />
                                    {uploading.managerPhoto ? (
                                        <RefreshCw size={40} className="animate-spin text-orange-500" />
                                    ) : formData.managerPhotoUrl ? (
                                        <>
                                            <img src={formData.managerPhotoUrl} alt="Manager" className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
                                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><CheckCircle size={48} className="text-white" /></div>
                                        </>
                                    ) : (
                                        <div className="text-center p-8">
                                            <ImageIcon size={40} className="text-slate-200 mx-auto mb-4 group-hover:text-orange-500 transition-all duration-500 group-hover:scale-110" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Upload <br /> PORTRAIT</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Geography */}
                    <section className="bg-slate-900 rounded-[56px] p-16 text-white shadow-3xl shadow-slate-950/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.05] pointer-events-none">
                            <Globe size={300} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white"><MapPin size={18} /></div>
                                GEO-Spatial Location
                            </h3>
                            <div className="space-y-12">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Headquarters Address *</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-10 py-7 bg-white/5 border border-white/10 rounded-[32px] text-[15px] font-black text-white focus:bg-white/10 focus:border-orange-500 transition-all outline-none" placeholder="Suite, Building, Floor..." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {[
                                        { label: "City Zone", name: "city" },
                                        { label: "State Protocol", name: "state" },
                                        { label: "Pincode Ref", name: "pincode" },
                                    ].map((field) => (
                                        <div key={field.name} className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{field.label} *</label>
                                            <input type="text" name={field.name} value={formData[field.name]} onChange={handleChange} required className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[24px] text-sm font-black text-white focus:border-orange-500 transition-all outline-none" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Legal & Finance */}
                    <section className="space-y-24">
                        <div>
                            <div className="flex items-center gap-6 mb-12 overflow-hidden">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] shrink-0 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm"><ShieldCheck size={18} /></div>
                                    Compliance Protocol
                                </h3>
                                <div className="h-px bg-slate-100 w-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">FSSAI MASTER LICENSE *</label>
                                        <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} required className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] text-[15px] font-black text-slate-950 focus:border-orange-600 transition-all outline-none" placeholder="14-digit number" />
                                    </div>
                                    <FileInput field="fssaiDoc" label="FSSAI Digital Twin (PDF)" currentUrl={formData.fssaiPdfUrl} />
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">GSTIN TAX DESIGNATOR *</label>
                                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] text-[15px] font-black text-slate-950 focus:border-orange-600 transition-all outline-none uppercase" placeholder="15-digit code" />
                                    </div>
                                    <FileInput field="gstDoc" label="GSTN Certificate (PDF)" currentUrl={formData.gstPdfUrl} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-16 rounded-[60px] border border-slate-100 space-y-16">
                            <h4 className="text-xl font-black tracking-tighter flex items-center gap-4 text-slate-950">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-xl flex items-center justify-center text-orange-600 font-extrabold italic">₹</div>
                                Bank Settlement Architecture
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {[
                                    { label: "Vault Beneficiary Name", name: "bankAccountName", ph: "Bank Account Holder Name" },
                                    { label: "Vault Serial Number", name: "bankAccountNumber", ph: "Full Bank Account Number" },
                                    { label: "IFSC Regional Protocol", name: "bankIfscCode", ph: "Bank IFSC Code" },
                                ].map((field) => (
                                    <div key={field.name} className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{field.label} *</label>
                                        <input type="text" name={field.name} value={formData[field.name]} onChange={handleChange} required className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[28px] text-sm font-black text-slate-950 focus:border-slate-900 transition-all outline-none" placeholder={field.ph} />
                                    </div>
                                ))}
                                <FileInput field="bankPassbook" label="Settlement Verification (PDF)" currentUrl={formData.bankPassbookPdfUrl} />
                            </div>
                        </div>
                    </section>

                    <div className="pt-12 text-center space-y-8">
                        <div className="flex items-center justify-center gap-6 opacity-40">
                            <History size={16} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Estimated Audit Duration: 24-48 Production Hours</p>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={submitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full group relative p-10 rounded-[40px] text-sm font-black uppercase tracking-[0.4em] shadow-3xl overflow-hidden transition-all flex items-center justify-center gap-6 ${submitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white shadow-slate-900/40 hover:bg-orange-600 hover:shadow-orange-500/30"}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                            {submitting ? <RefreshCw className="animate-spin" size={28} /> : (
                                <>
                                    <Landmark size={24} className="group-hover:scale-125 transition-transform" />
                                    FINALIZE & BROADCAST APPLICATION
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}

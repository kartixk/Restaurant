// src/pages/ManagerSettings.jsx
import React from 'react';
import useAuthStore from '../store/useAuthStore';
import ManagerLayout from '../components/ManagerLayout';
import { User, Mail, ShieldCheck } from 'lucide-react';

export default function ManagerSettings() {
    const { user } = useAuthStore();
    const role = user?.role?.toUpperCase() || 'MANAGER';

    const S = {
        card: {
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '2.5rem',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        },
        sectionTitle: {
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '2rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f1f5f9'
        },
        profileHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '3rem'
        },
        avatarLarge: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF5A00 0%, #ea580c 100%)',
            color: '#ffffff',
            fontSize: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3)'
        },
        infoGrid: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        },
        infoRow: {
            display: 'grid',
            gridTemplateColumns: '40px 140px 1fr',
            alignItems: 'center'
        },
        infoIcon: {
            color: '#64748b',
            display: 'flex',
            alignItems: 'center'
        },
        infoLabel: {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#64748b'
        },
        infoValue: {
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a'
        },
        badge: {
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }
    };

    return (
        <ManagerLayout
            title="Account Settings"
            subtitle="Manage your profile, preferences, and account security."
        >
            <div style={S.card}>
                <h2 style={S.sectionTitle}>Personal Profile</h2>

                <div style={S.profileHeader}>
                    <div style={S.avatarLarge}>
                        {user?.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{user?.name}</div>
                        <div style={{ color: '#64748b', fontWeight: 500 }}>{role} Profile</div>
                    </div>
                </div>

                <div style={S.infoGrid}>
                    <div style={S.infoRow}>
                        <div style={S.infoIcon}><User size={20} /></div>
                        <span style={S.infoLabel}>Full Name</span>
                        <span style={S.infoValue}>{user?.name || 'N/A'}</span>
                    </div>

                    <div style={S.infoRow}>
                        <div style={S.infoIcon}><Mail size={20} /></div>
                        <span style={S.infoLabel}>Email Address</span>
                        <span style={S.infoValue}>{user?.email || 'N/A'}</span>
                    </div>

                    <div style={S.infoRow}>
                        <div style={S.infoIcon}><ShieldCheck size={20} /></div>
                        <span style={S.infoLabel}>Account Role</span>
                        <div>
                            <span style={S.badge}>{role}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                        Need to update your login credentials or branch details? Please contact the administrator.
                    </p>
                </div>
            </div>
        </ManagerLayout>
    );
}

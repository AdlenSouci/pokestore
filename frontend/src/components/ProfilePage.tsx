import { useState } from 'react';
import { User, Phone, Lock, Save, X } from 'lucide-react';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';

interface ProfilePageProps {
    onClose: () => void;
    onUpdate: () => void;
}

export function ProfilePage({ onClose, onUpdate }: ProfilePageProps) {
    const user = authService.getUser();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await profileService.updateProfile({
                name: formData.name,
                phone: formData.phone,
            });
            setSuccess('✅ Profil mis à jour avec succès !');
            onUpdate();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            await profileService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setSuccess('✅ Mot de passe modifié avec succès !');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-[#a8b5c8] to-[#8b9db5] rounded-2xl shadow-2xl border-4 border-[#2d3561] max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-[#2d3561] bg-gradient-to-r from-[#5a4f99] to-[#2d3561] sticky top-0 z-10">
                    <h2 className="text-white text-2xl pixel-font">MON PROFIL</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Fermer le profil"
                      className="text-white hover:bg-[#7b6eb8] p-2 rounded-xl transition"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                {/* Messages */}
                {error && <div className="bg-red-500 text-white p-3 text-center font-bold border-b-4 border-red-700">{error}</div>}
                {success && <div className="bg-green-500 text-white p-3 text-center font-bold border-b-4 border-green-700">{success}</div>}

                <div className="p-6 space-y-6">

                    {/* Informations du compte */}
                    <div className="bg-white/20 p-4 rounded-xl border-2 border-[#2d3561]">
                        <h3 className="text-[#2d3561] font-bold text-lg mb-2">📧 Email</h3>
                        <p className="text-[#2d3561]">{user?.email}</p>
                        <p className="text-xs text-[#5a4f99] mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    {/* Formulaire de mise à jour du profil */}
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <h3 className="text-[#2d3561] font-bold text-xl pixel-font">🎮 Informations personnelles</h3>

                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
                            <input
                                type="text"
                                placeholder="Nom de dresseur"
                                className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
                            <input
                                type="tel"
                                placeholder="Numéro de téléphone (optionnel)"
                                className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#2d3561] text-white font-bold rounded-xl hover:bg-[#3d4571] disabled:opacity-50 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </form>

                    {/* Formulaire de changement de mot de passe - Uniquement pour comptes classiques */}
                    {user?.hasPassword && (
                        <form onSubmit={handleChangePassword} className="space-y-4 pt-6 border-t-2 border-[#2d3561]">
                            <h3 className="text-[#2d3561] font-bold text-xl pixel-font">🔒 Changer le mot de passe</h3>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
                                <input
                                    type="password"
                                    placeholder="Mot de passe actuel"
                                    className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
                                <input
                                    type="password"
                                    placeholder="Nouveau mot de passe"
                                    className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
                                <input
                                    type="password"
                                    placeholder="Confirmer le nouveau mot de passe"
                                    className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                                className="w-full py-3 bg-[#5a4f99] text-white font-bold rounded-xl hover:bg-[#7b6eb8] disabled:opacity-50 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
                            >
                                <Lock className="w-5 h-5" />
                                {loading ? 'Modification...' : 'Changer le mot de passe'}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}

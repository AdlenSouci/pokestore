import { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ type, onClose, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'signup') {
        // 1. Inscription Supabase
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name } },
        });
        if (authError) throw authError;

        // 2. Sauvegarde dans ta Base de données (Backend)
        await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            name: formData.name 
          }),
        });

        // 3. CONFIRMATION VISUELLE (Je l'ai remise ici)
        alert("✅ Compte créé avec succès ! Bienvenue " + formData.name);

        // 4. On force la connexion visuelle
        onSuccess();
        onClose();

      } else {
        // Connexion normale
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  // ... (Le reste du code pour Google Login ne change pas) ...
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-[#a8b5c8] to-[#8b9db5] rounded-2xl shadow-2xl border-4 border-[#2d3561]">
        <div className="flex items-center justify-between p-6 border-b-4 border-[#2d3561] bg-gradient-to-r from-[#5a4f99] to-[#2d3561]">
          <h2 className="text-white text-xl pixel-font">{type === 'login' ? 'CONNEXION' : 'INSCRIPTION'}</h2>
          <button onClick={onClose} className="text-white hover:bg-[#7b6eb8] p-2 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="bg-red-500 text-white p-3 text-center font-bold border-b-4 border-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
              <input type="text" placeholder="Nom de dresseur" className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
            <input type="email" placeholder="Email" className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" />
            <input type="password" placeholder="Mot de passe" className="w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a4f99]" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#2d3561] text-white font-bold rounded-xl hover:bg-[#3d4571] disabled:opacity-50 transition-transform active:scale-95 shadow-lg">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (type === 'login' ? 'SE CONNECTER' : "S'INSCRIRE")}
          </button>
           <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-[#2d3561] opacity-20"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#a8b5c8] px-2 text-[#2d3561] font-bold rounded">Ou continuer avec</span></div>
          </div>
          <button type="button" onClick={handleGoogleLogin} className="w-full py-3 border-4 border-[#2d3561] rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-md">
            <span className="text-[#2d3561] font-bold">Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}
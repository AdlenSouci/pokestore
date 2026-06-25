import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { ModalShell, useDialogTitleId } from './ModalShell';

interface AuthModalProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
  onSuccess: () => void;
  googleError?: string | null;
}

const inputClass =
  'w-full pl-10 p-3 rounded-xl border-2 border-[#2d3561] bg-white text-[#2d3561] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7ec8a3]';

function AuthModalContent({
  type,
  onClose,
  onSuccess,
  googleError,
}: Omit<AuthModalProps, 'type'> & { type: 'login' | 'signup' }) {
  const titleId = useDialogTitleId();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (googleError) setError(googleError);
  }, [googleError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'signup') {
        await authService.register(formData.email, formData.password, formData.name);
        toast.success(`Compte créé ! Bienvenue ${formData.name}`);
        onSuccess();
        onClose();
      } else {
        await authService.login(formData.email, formData.password);
        toast.success('Connexion réussie !');
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-[#a8b5c8] to-[#8b9db5] rounded-2xl shadow-2xl border-4 border-[#2d3561]">
      <div className="flex items-center justify-between p-6 border-b-4 border-[#2d3561] bg-gradient-to-r from-[#5a4f99] to-[#2d3561]">
        <h2 id={titleId} className="text-white text-xl pixel-font">
          {type === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={type === 'login' ? 'Fermer la fenêtre de connexion' : "Fermer la fenêtre d'inscription"}
          className="text-white hover:bg-[#7b6eb8] p-2 rounded-xl focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-red-500 text-white p-3 text-center font-bold border-b-4 border-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-4" aria-busy={loading}>
        {type === 'signup' && (
          <div>
            <label htmlFor="auth-name" className="block text-sm font-bold text-[#2d3561] mb-1">
              Nom de dresseur
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" aria-hidden="true" />
              <input
                id="auth-name"
                name="name"
                type="text"
                autoComplete="name"
                className={inputClass}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-sm font-bold text-[#2d3561] mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" aria-hidden="true" />
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-sm font-bold text-[#2d3561] mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-[#5a4f99] z-10" aria-hidden="true" />
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={type === 'login' ? 'current-password' : 'new-password'}
              className={inputClass}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full py-3 bg-[#2d3561] text-white font-bold rounded-xl hover:bg-[#3d4571] disabled:opacity-50 transition-transform active:scale-95 shadow-lg focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mx-auto" aria-hidden="true" />
              <span className="sr-only">Connexion en cours</span>
            </>
          ) : type === 'login' ? (
            'SE CONNECTER'
          ) : (
            "S'INSCRIRE"
          )}
        </button>

        <div className="relative my-4" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#2d3561] opacity-20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#a8b5c8] px-2 text-[#2d3561] font-bold rounded">Ou continuer avec</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => authService.loginWithGoogle()}
          className="w-full py-3 border-4 border-[#2d3561] rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-md focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
        >
          <span className="text-[#2d3561] font-bold">Google</span>
        </button>
      </form>
    </div>
  );
}

export function AuthModal({ type, onClose, onSuccess, googleError }: AuthModalProps) {
  if (!type) return null;

  return (
    <ModalShell onClose={onClose}>
      <AuthModalContent type={type} onClose={onClose} onSuccess={onSuccess} googleError={googleError} />
    </ModalShell>
  );
}

import { useEffect, useState } from 'react';
import { Mail, Send, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEO } from '../components/SEO';
import { contactService } from '../services/contact.service';

const inputClass =
  'w-full rounded-xl border-2 border-[#2d3561] bg-white/95 px-4 py-3 text-[#2d3561] font-sans focus-visible:ring-2 focus-visible:ring-[#7ec8a3]';

export function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    captchaAnswer: '',
    website: '',
  });
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(true);

  const loadCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const data = await contactService.getCaptcha();
      setCaptcha(data);
      setForm((f) => ({ ...f, captchaAnswer: '' }));
    } catch {
      toast.error('Impossible de charger le captcha');
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) return;

    setLoading(true);
    try {
      await contactService.sendMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        captchaAnswer: Number(form.captchaAnswer),
        captchaToken: captcha.token,
        website: form.website,
      });
      toast.success('Message envoyé ! Nous te répondrons rapidement.');
      setForm({ name: '', email: '', subject: '', message: '', captchaAnswer: '', website: '' });
      await loadCaptcha();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur d'envoi");
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 pb-24 max-w-2xl">
      <SEO
        title="Contact – PokéStore"
        description="Contacte l'équipe PokéStore pour toute question sur les cartes Pokémon."
        url="https://pokestore-hazel.vercel.app/contact"
      />

      <div className="text-center mb-8">
        <Mail className="w-12 h-12 text-[#7ec8a3] mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-3xl md:text-4xl font-bold pixel-font text-white mb-2">Contact</h1>
        <p className="text-[#a5b4fc] font-sans">
          Une question sur une commande, une carte ou le site ? Écris-nous.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border-4 border-[#2d3561] bg-gradient-to-br from-[#5a4f99]/30 to-[#2d3561]/40 p-6 md:p-8 space-y-5"
        aria-busy={loading}
      >
        {/* Honeypot anti-spam — caché */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="contact-website">Site web</label>
          <input
            id="contact-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="contact-name" className="block text-sm font-bold text-[#a5b4fc] mb-1">
            Nom
          </label>
          <input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-bold text-[#a5b4fc] mb-1">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="block text-sm font-bold text-[#a5b4fc] mb-1">
            Sujet
          </label>
          <input
            id="contact-subject"
            type="text"
            required
            className={inputClass}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-bold text-[#a5b4fc] mb-1">
            Message
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            minLength={10}
            className={`${inputClass} resize-y`}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="contact-captcha" className="text-sm font-bold text-[#a5b4fc]">
              Vérification anti-robot
            </label>
            <button
              type="button"
              onClick={loadCaptcha}
              disabled={captchaLoading}
              className="text-[#7ec8a3] text-xs flex items-center gap-1 hover:underline focus-visible:ring-2 focus-visible:ring-[#7ec8a3] rounded"
              aria-label="Nouveau captcha"
            >
              <RefreshCw className={`w-3 h-3 ${captchaLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Autre question
            </button>
          </div>
          <p className="text-white font-bold mb-2 font-sans" id="captcha-question">
            {captchaLoading ? 'Chargement…' : captcha?.question}
          </p>
          <input
            id="contact-captcha"
            type="number"
            required
            inputMode="numeric"
            aria-labelledby="captcha-question"
            className={inputClass}
            value={form.captchaAnswer}
            onChange={(e) => setForm({ ...form, captchaAnswer: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || captchaLoading || !captcha}
          aria-busy={loading}
          className="w-full py-4 bg-gradient-to-r from-[#7ec8a3] to-[#5a4f99] text-white font-bold text-lg rounded-xl hover:from-[#8ed3b3] hover:to-[#6a5fa9] disabled:opacity-50 transition flex items-center justify-center gap-3 focus-visible:ring-2 focus-visible:ring-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Send className="w-5 h-5" aria-hidden="true" />
              Envoyer le message
            </>
          )}
        </button>
      </form>
    </div>
  );
}

import { ExternalLink, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EXPO_APP_LABEL, EXPO_APP_URL } from '../lib/appLinks';

const STEPS = [
  'Sur votre téléphone Android, scannez le QR code ou appuyez sur le bouton ci-dessous (le lien ne sert pas sur ordinateur).',
  'Une page d’installation s’ouvre dans Chrome ou votre navigateur.',
  'Appuyez sur le bouton de téléchargement / installation proposé sur cette page.',
  'Si Android affiche « application non autorisée » ou « source inconnue », allez dans Paramètres → autorisez l’installation pour Chrome, puis recommencez.',
  'Une fois le fichier installé, ouvrez PokéStore et connectez-vous avec le même email et mot de passe que sur le site.',
];

export function MobileAppPromo() {
  return (
    <section
      id="app-mobile"
      className="relative z-10 border-y-4 border-[#5a4f99] bg-gradient-to-r from-[#1a1f3a] via-[#252b52] to-[#1a1f3a]"
      aria-labelledby="mobile-app-title"
    >
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-white shadow-lg border-4 border-[#2d3561]">
              <QRCodeSVG
                value={EXPO_APP_URL}
                size={168}
                level="M"
                bgColor="#ffffff"
                fgColor="#1a1f3a"
                aria-label="QR code pour installer PokéStore sur Android"
              />
            </div>
            <p className="text-[#a5b4fc] text-xs font-sans text-center max-w-[220px] leading-relaxed">
              À scanner avec l’appareil photo ou Chrome, sur votre téléphone Android
            </p>
          </div>

          <div className="flex items-start gap-4 text-left max-w-xl">
            <div
              className="hidden sm:flex flex-shrink-0 p-4 rounded-2xl bg-[#7ec8a3]/15 border-2 border-[#7ec8a3]/40"
              aria-hidden="true"
            >
              <Smartphone className="w-10 h-10 text-[#7ec8a3]" />
            </div>
            <div className="min-w-0">
              <p className="text-[#7ec8a3] text-xs font-bold uppercase tracking-widest mb-2 font-sans">
                Application mobile
              </p>
              <h2
                id="mobile-app-title"
                className="text-white text-xl md:text-2xl font-bold font-sans mb-2"
              >
                PokéStore sur Android
              </h2>
              <p className="text-[#c4b5fd] text-sm md:text-base font-sans leading-relaxed mb-4">
                Achetez et suivez votre collection depuis votre téléphone, avec le même compte que
                sur le site.
              </p>

              <div className="rounded-xl border-2 border-[#5a4f99]/60 bg-white/5 p-4 mb-5">
                <p className="text-[#7ec8a3] text-xs font-bold uppercase tracking-wide mb-3 font-sans">
                  Comment installer
                </p>
                <ol className="space-y-3 list-none m-0 p-0">
                  {STEPS.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm font-sans text-[#e0e7ff] leading-relaxed">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7ec8a3] text-[#1a1f3a] text-xs font-bold flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <a
                href={EXPO_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7ec8a3] text-[#1a1f3a] rounded-xl border-4 border-[#2d3561] font-bold text-sm hover:bg-[#6eb893] transition"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                {EXPO_APP_LABEL}
              </a>
              <p className="text-[#a5b4fc] text-xs font-sans mt-3">
                Ouvrez ce bouton depuis votre téléphone Android uniquement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ExternalLink, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EXPO_APP_LABEL, getExpoAppUrl } from '../lib/appLinks';

export function MobileAppPromo() {
  const expoUrl = getExpoAppUrl();

  return (
    <section
      id="app-mobile"
      className="relative z-10 border-y-4 border-[#5a4f99] bg-gradient-to-r from-[#1a1f3a] via-[#252b52] to-[#1a1f3a]"
      aria-labelledby="mobile-app-title"
    >
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-white shadow-lg border-4 border-[#2d3561]">
              <QRCodeSVG
                value={expoUrl}
                size={168}
                level="M"
                bgColor="#ffffff"
                fgColor="#1a1f3a"
                aria-label="QR code — ouvrir l’app PokéStore sur Expo"
              />
            </div>
            <p className="text-[#a5b4fc] text-xs font-sans text-center max-w-[200px]">
              Scanne avec ton téléphone Android
            </p>
          </div>

          <div className="flex items-start gap-4 text-left max-w-xl">
            <div
              className="hidden sm:flex flex-shrink-0 p-4 rounded-2xl bg-[#7ec8a3]/15 border-2 border-[#7ec8a3]/40"
              aria-hidden="true"
            >
              <Smartphone className="w-10 h-10 text-[#7ec8a3]" />
            </div>
            <div>
              <p className="text-[#7ec8a3] text-xs font-bold uppercase tracking-widest mb-2 font-sans">
                Application mobile
              </p>
              <h2
                id="mobile-app-title"
                className="text-white text-xl md:text-2xl font-bold font-sans mb-2"
              >
                Disponible sur téléphone
              </h2>
              <p className="text-[#c4b5fd] text-sm md:text-base font-sans leading-relaxed mb-4">
                Scanne le QR code ou ouvre le lien Expo : page d’installation officielle (comme sur
                expo.dev), puis installe <strong className="text-white font-semibold">PokéStore</strong>{' '}
                sur Android. Même compte que sur le site.
              </p>
              <ol className="text-[#a5b4fc] text-sm font-sans space-y-1 mb-5 list-decimal list-inside">
                <li>Scanne le QR ou clique le lien ci-dessous</li>
                <li>Sur la page Expo → télécharger / installer l’app</li>
                <li>Autorise l’installation si Android le demande</li>
              </ol>
              <a
                href={expoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7ec8a3] text-[#1a1f3a] rounded-xl border-4 border-[#2d3561] font-bold text-sm hover:bg-[#6eb893] transition"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                {EXPO_APP_LABEL}
              </a>
              <p className="text-[#7ec8a3]/80 text-xs font-mono mt-3 break-all">{expoUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

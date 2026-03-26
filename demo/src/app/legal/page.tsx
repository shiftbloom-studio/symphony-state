import { Navigation } from "@/components/shared/Navigation";

export default function LegalPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Rechtliches</h1>

        <nav className="mb-10 flex gap-3">
          <a href="#impressum" className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent">
            Impressum
          </a>
          <a href="#datenschutz" className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent">
            Datenschutz
          </a>
        </nav>

        {/* ── Impressum ── */}
        <section id="impressum" className="mb-16 scroll-mt-20">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Impressum</h2>
          <p className="text-xs text-text-muted mb-4">Angaben gem. § 5 DDG, § 18 Abs. 2 MStV</p>

          <div className="rounded-xl border border-border bg-white p-6 space-y-6 text-sm leading-relaxed text-text-secondary">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Betreiber
              </h3>
              <p>
                Fabian Zimber<br />
                shiftbloom studio<br />
                Up de Worth 6a<br />
                22927 Grosshansdorf<br />
                Deutschland
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Kontakt
              </h3>
              <p>
                E-Mail: <a href="mailto:fabian@shiftbloom.studio" className="text-accent hover:underline">fabian@shiftbloom.studio</a>
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Verantwortlich f&uuml;r den Inhalt
              </h3>
              <p>
                Fabian Zimber (Anschrift wie oben)<br />
                gem. § 18 Abs. 2 MStV
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Haftungshinweis
              </h3>
              <p>
                Die Inhalte dieser Website werden mit gr&ouml;&szlig;tm&ouml;glicher Sorgfalt erstellt.
                Der Betreiber &uuml;bernimmt jedoch keine Gew&auml;hr f&uuml;r die Richtigkeit, Vollst&auml;ndigkeit
                und Aktualit&auml;t der bereitgestellten Inhalte. Die Nutzung der abrufbaren Inhalte
                erfolgt auf eigene Gefahr des Nutzers.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Externe Links
              </h3>
              <p>
                Diese Website enth&auml;lt Verkn&uuml;pfungen zu Websites Dritter. F&uuml;r die Inhalte
                der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
                verantwortlich. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
                ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Urheberrecht
              </h3>
              <p>
                Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen
                dem deutschen Urheberrecht. Die Vervielf&auml;ltigung, Bearbeitung, Verbreitung und jede
                Art der Verwertung au&szlig;erhalb der Grenzen des Urheberrechtes bed&uuml;rfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
                Die Software &bdquo;symphony-state&ldquo; selbst steht unter der MIT-Lizenz.
              </p>
            </div>
          </div>
        </section>

        {/* ── Datenschutz ── */}
        <section id="datenschutz" className="scroll-mt-20">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Datenschutzerkl&auml;rung</h2>
          <p className="text-xs text-text-muted mb-4">gem. Art. 13, 14 DSGVO</p>

          <div className="rounded-xl border border-border bg-white p-6 space-y-8 text-sm leading-relaxed text-text-secondary">

            {/* 1 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                1. Verantwortlicher
              </h3>
              <p>
                Fabian Zimber<br />
                shiftbloom studio<br />
                Up de Worth 6a, 22927 Grosshansdorf<br />
                E-Mail: <a href="mailto:fabian@shiftbloom.studio" className="text-accent hover:underline">fabian@shiftbloom.studio</a>
              </p>
            </div>

            {/* 2 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                2. &Uuml;bersicht der Verarbeitungen
              </h3>
              <p>
                Diese Website ist eine technische Demonstration der Open-Source-Bibliothek
                &bdquo;symphony-state&ldquo;. Es werden <strong>keine Benutzerkonten</strong> angelegt,
                <strong>keine Formulare</strong> &uuml;bermittelt und <strong>keine Analyse- oder
                Tracking-Tools</strong> eingesetzt.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                3. Hosting und Content Delivery
              </h3>
              <p>
                Die Website wird bei <strong>Vercel Inc.</strong> (440 N Baxter St, Los Angeles, CA 90012, USA)
                gehostet. Beim Aufruf der Website werden automatisch technische Daten durch den
                Hosting-Anbieter erhoben (sog. Server-Logfiles):
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>IP-Adresse des anfragenden Ger&auml;ts</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Name und URL der abgerufenen Seite</li>
                <li>Verwendeter Browser und Betriebssystem</li>
                <li>Referrer-URL</li>
              </ul>
              <p className="mt-2">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
                sicheren und effizienten Bereitstellung der Website).
              </p>
              <p className="mt-2">
                Vercel verarbeitet Daten auch in den USA. Die &Uuml;bermittlung erfolgt auf Grundlage
                des EU-U.S. Data Privacy Framework (Angemessenheitsbeschluss der EU-Kommission
                vom 10. Juli 2023). Weitere Informationen:&nbsp;
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  vercel.com/legal/privacy-policy
                </a>.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                4. Cookies und lokale Speicherung
              </h3>
              <p>
                Diese Website verwendet <strong>keine Analyse- oder Marketing-Cookies</strong>.
              </p>
              <p className="mt-2">
                Die Demo-Anwendung speichert Benutzereinstellungen (z.&nbsp;B. gew&auml;hlte Tabellenansicht)
                im <strong>localStorage</strong> Ihres Browsers. Diese Daten verlassen Ihr Ger&auml;t nicht
                und werden nicht an Server &uuml;bertragen. Sie k&ouml;nnen diese Daten jederzeit &uuml;ber die
                Browser-Einstellungen l&ouml;schen.
              </p>
              <p className="mt-2">
                Technisch notwendige Cookies, die der Hosting-Anbieter Vercel setzt (z.&nbsp;B. f&uuml;r
                Load Balancing), dienen ausschlie&szlig;lich dem Betrieb der Website und sind nach
                Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO gerechtfertigt.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                5. Keine Weitergabe an Dritte
              </h3>
              <p>
                Eine Weitergabe personenbezogener Daten an Dritte findet nicht statt,
                es sei denn, dies ist zur Erf&uuml;llung gesetzlicher Pflichten erforderlich.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                6. Ihre Rechte
              </h3>
              <p>
                Sie haben das Recht auf:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>Auskunft</strong> &uuml;ber Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
                <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
                <li><strong>L&ouml;schung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
                <li><strong>Einschr&auml;nkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
                <li><strong>Daten&uuml;bertragbarkeit</strong> (Art. 20 DSGVO)</li>
                <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
              </ul>
              <p className="mt-2">
                Zur Aus&uuml;bung Ihrer Rechte wenden Sie sich bitte an:&nbsp;
                <a href="mailto:fabian@shiftbloom.studio" className="text-accent hover:underline">fabian@shiftbloom.studio</a>
              </p>
            </div>

            {/* 7 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                7. Beschwerderecht
              </h3>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbeh&ouml;rde zu beschweren
                (Art.&nbsp;77 DSGVO). Die zust&auml;ndige Aufsichtsbeh&ouml;rde ist:
              </p>
              <p className="mt-2">
                Unabh&auml;ngiges Landeszentrum f&uuml;r Datenschutz Schleswig-Holstein (ULD)<br />
                Holstenstra&szlig;e 98, 24103 Kiel<br />
                <a href="https://www.datenschutzzentrum.de" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  www.datenschutzzentrum.de
                </a>
              </p>
            </div>

            {/* 8 */}
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                8. Aktualit&auml;t dieser Erkl&auml;rung
              </h3>
              <p>
                Stand: M&auml;rz 2026. Wir behalten uns vor, diese Datenschutzerkl&auml;rung anzupassen,
                um sie an ge&auml;nderte Rechtslagen oder &Auml;nderungen der Website anzupassen.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Fabian Zimber / shiftbloom studio
        </div>
      </main>
    </>
  );
}

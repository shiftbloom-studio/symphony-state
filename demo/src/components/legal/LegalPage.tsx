import Link from "next/link";
import type { ReactNode } from "react";
import { Navigation } from "@/components/shared/Navigation";
import { getOperator, isConfigured, type Operator } from "@/lib/operator";

type Lang = "en" | "de";
type Kind = "imprint" | "privacy";

const PATHS: Record<Kind, Record<Lang, string>> = {
  imprint: { en: "/imprint", de: "/impressum" },
  privacy: { en: "/privacy", de: "/datenschutz" },
};

const TITLES: Record<Kind, Record<Lang, string>> = {
  imprint: { en: "Imprint", de: "Impressum" },
  privacy: { en: "Privacy policy", de: "Datenschutzerklärung" },
};

const UPDATED: Record<Lang, string> = {
  en: "Last updated 25 November 2026",
  de: "Stand: 25. November 2026",
};

const SOURCE = "https://github.com/shiftbloom-studio/symphony-state";

const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-10 mb-2 text-lg font-semibold text-ink">{children}</h2>
);

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="text-bloom-red hover:underline" rel="noopener noreferrer">
    {children}
  </a>
);

function Address({ op, lang }: { op: Operator; lang: Lang }) {
  if (!isConfigured(op)) {
    return (
      <p className="border-l-2 border-bloom-red pl-3">
        {lang === "de"
          ? "Die Angaben zum Betreiber sind noch nicht eingetragen (OPERATOR_* in der Build-Konfiguration)."
          : "The operator details have not been configured yet (OPERATOR_* build variables)."}
      </p>
    );
  }
  const lines = [op.name, op.business, op.street, op.city, op.country[lang]].filter(Boolean);
  return (
    <address className="not-italic">
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          <br />
        </span>
      ))}
    </address>
  );
}

const Mail = ({ op }: { op: Operator }) =>
  op.email ? <A href={`mailto:${op.email}`}>{op.email}</A> : null;

function Imprint({ op, lang }: { op: Operator; lang: Lang }) {
  const tel = op.phone?.replace(/[^\d+]/g, "");
  if (lang === "de") {
    return (
      <>
        <p>Angaben gemäß § 5 DDG:</p>
        <Address op={op} lang="de" />
        <p className="mt-4">
          E-Mail: <Mail op={op} />
          {op.phone && (
            <>
              <br />
              Telefon: <A href={`tel:${tel}`}>{op.phone}</A>
            </>
          )}
        </p>
        {op.vatId && <p className="mt-4">Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {op.vatId}</p>}
        <H2>Verantwortlich für den Inhalt</H2>
        <p>{op.name ?? "Siehe oben"}, Anschrift wie oben (§ 18 Abs. 2 MStV).</p>
        <H2>Verbraucherstreitbeilegung</H2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
        <H2>Open Source</H2>
        <p>
          Diese Seite demonstriert die Open-Source-Bibliothek Symphony State. Der{" "}
          <A href={SOURCE}>Quellcode</A> steht unter der Lizenz, die im Repository angegeben ist.
        </p>
      </>
    );
  }
  return (
    <>
      <p>Information pursuant to § 5 DDG:</p>
      <Address op={op} lang="en" />
      <p className="mt-4">
        Email: <Mail op={op} />
        {op.phone && (
          <>
            <br />
            Phone: <A href={`tel:${tel}`}>{op.phone}</A>
          </>
        )}
      </p>
      {op.vatId && <p className="mt-4">VAT ID pursuant to § 27a UStG: {op.vatId}</p>}
      <H2>Responsible for the content</H2>
      <p>{op.name ?? "See above"}, address as above (§ 18(2) MStV).</p>
      <H2>Consumer dispute resolution</H2>
      <p>
        We are not willing or obliged to take part in dispute resolution proceedings before a
        consumer arbitration board.
      </p>
      <H2>Open source</H2>
      <p>
        This site demonstrates the open-source library Symphony State. The{" "}
        <A href={SOURCE}>source code</A> is available under the license stated in the repository.
      </p>
    </>
  );
}

function Privacy({ op, lang }: { op: Operator; lang: Lang }) {
  if (lang === "de") {
    return (
      <>
        <p>
          Diese Seite ist eine interaktive Demo der Open-Source-Bibliothek Symphony State. Es gibt
          keine Konten, keine Formulare, keine Werbung, kein Tracking und keine Analyse deines
          Verhaltens. Hier steht, welche personenbezogenen Daten trotzdem anfallen.
        </p>

        <H2>Verantwortlicher</H2>
        <Address op={op} lang="de" />
        <p className="mt-4">
          E-Mail: <Mail op={op} />
        </p>

        <H2>Hosting</H2>
        <p>
          Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA, liefert diese Seite in
          unserem Auftrag aus. Dabei verarbeitet Cloudflare deine IP-Adresse, die aufgerufene
          Adresse, den Zeitpunkt und Angaben, die dein Browser mitsendet, etwa den User-Agent. Ohne
          diese Daten kann die Seite nicht angezeigt werden. Um Angriffe und automatisierte Zugriffe
          abzuwehren, kann Cloudflare das Cookie „__cf_bm“ (30 Minuten) und nach einer
          Sicherheitsabfrage „cf_clearance“ setzen. Diese Cookies sind für den sicheren Betrieb
          unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Wir selbst speichern keine
          Zugriffsprotokolle.
        </p>
        <p className="mt-3">
          Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen
          Bereitstellung der Seite (Art. 6 Abs. 1 lit. f DSGVO). Cloudflare verarbeitet die Daten als
          unser Auftragsverarbeiter (Art. 28 DSGVO). Cloudflare, Inc. ist nach dem EU-U.S. Data
          Privacy Framework zertifiziert, für das ein Angemessenheitsbeschluss der Europäischen
          Kommission besteht (Art. 45 DSGVO). Mehr dazu in der{" "}
          <A href="https://www.cloudflare.com/de-de/privacypolicy/">Datenschutzerklärung von Cloudflare</A>.
        </p>

        <H2>Speicherung im Browser</H2>
        <p>
          Die Demos zeigen, wie Zustand im Browser gespeichert wird. Einstellungen wie die gewählte
          Lagerhausansicht oder Text im Playground können deshalb im lokalen Speicher deines Browsers
          landen. Diese Daten verlassen dein Gerät nicht, und du kannst sie jederzeit über die
          Website-Daten deines Browsers löschen. Die Speicherung ist für die Funktion, die du
          nutzt, unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).
        </p>

        <H2>Schriften und Links</H2>
        <p>
          Alle Schriften liegen auf diesem Server. Es werden keine Inhalte von Dritten nachgeladen.
          Links zu GitHub oder npm führen auf Seiten anderer Anbieter, für die deren
          Datenschutzerklärungen gelten.
        </p>

        <H2>E-Mail</H2>
        <p>
          Wenn du uns schreibst, nutzen wir deine Adresse und Nachricht nur, um dir zu antworten
          (Art. 6 Abs. 1 lit. f DSGVO), und löschen sie, sobald die Sache erledigt ist, es sei denn,
          das Gesetz verpflichtet uns zur Aufbewahrung.
        </p>

        <H2>Deine Rechte</H2>
        <p>
          Du hast das Recht auf Auskunft über deine personenbezogenen Daten (Art. 15 DSGVO), auf
          Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und
          Datenübertragbarkeit (Art. 20). Schreib uns dazu eine E-Mail. Außerdem kannst du dich bei
          einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), etwa bei der an deinem
          Wohnort{op.authority ? ` oder bei der für uns zuständigen: ${op.authority}` : ""}.
        </p>

        <H2>Widerspruchsrecht</H2>
        <p>
          <strong>
            Du kannst der Verarbeitung deiner personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1
            lit. f DSGVO jederzeit aus Gründen widersprechen, die sich aus deiner besonderen
            Situation ergeben (Art. 21 DSGVO).
          </strong>
        </p>
      </>
    );
  }
  return (
    <>
      <p>
        This site is an interactive demo of the open-source library Symphony State. There are no
        accounts, no forms, no advertising, no tracking and no analysis of your behavior. This page
        lists the personal data that is processed anyway.
      </p>

      <H2>Controller</H2>
      <Address op={op} lang="en" />
      <p className="mt-4">
        Email: <Mail op={op} />
      </p>

      <H2>Hosting</H2>
      <p>
        Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA, delivers this site on our
        behalf. To do so, Cloudflare processes your IP address, the address you request, the time,
        and details your browser sends, such as its user agent. Without this data the site can&apos;t
        be shown to you. To fend off attacks and automated traffic, Cloudflare may set the cookie
        &quot;__cf_bm&quot; (30 minutes) and, after a security check, &quot;cf_clearance&quot;. These
        cookies are strictly necessary to run the site securely (§ 25(2) no. 2 TDDDG). We don&apos;t
        keep access logs ourselves.
      </p>
      <p className="mt-3">
        The legal basis is our legitimate interest in delivering the site securely and reliably
        (Art. 6(1)(f) GDPR). Cloudflare processes the data as our processor (Art. 28 GDPR).
        Cloudflare, Inc. is certified under the EU-U.S. Data Privacy Framework, for which the
        European Commission has adopted an adequacy decision (Art. 45 GDPR). More in{" "}
        <A href="https://www.cloudflare.com/privacypolicy/">Cloudflare&apos;s privacy policy</A>.
      </p>

      <H2>Storage in your browser</H2>
      <p>
        The demos show how state is kept in the browser, so settings such as the selected warehouse
        view or text in the playground can end up in your browser&apos;s local storage. This data
        never leaves your device, and you can delete it at any time through your browser&apos;s site
        data settings. Storing it is strictly necessary for the feature you use (§ 25(2) no. 2
        TDDDG).
      </p>

      <H2>Fonts and links</H2>
      <p>
        All fonts are served from this site. Nothing is loaded from third parties. Links to GitHub
        or npm lead to other providers, whose privacy policies apply there.
      </p>

      <H2>Email</H2>
      <p>
        If you email us, we use your address and message only to reply (Art. 6(1)(f) GDPR) and
        delete them once the matter is settled, unless the law requires us to keep them.
      </p>

      <H2>Your rights</H2>
      <p>
        You have the right of access to your personal data (Art. 15 GDPR), to rectification (Art.
        16), to erasure (Art. 17), to restriction of processing (Art. 18) and to data portability
        (Art. 20). To exercise them, email us. You can also lodge a complaint with a data protection
        supervisory authority (Art. 77 GDPR), for example the one where you live
        {op.authority ? ` or the one responsible for us: ${op.authority}` : ""}.
      </p>

      <H2>Right to object</H2>
      <p>
        <strong>
          You may object at any time, on grounds relating to your particular situation, to the
          processing of your personal data based on Art. 6(1)(f) GDPR (Art. 21 GDPR).
        </strong>
      </p>
    </>
  );
}

export function LegalPage({ kind, lang }: { kind: Kind; lang: Lang }) {
  const op = getOperator();
  const other: Lang = lang === "de" ? "en" : "de";
  const title = TITLES[kind][lang];

  return (
    <>
      <Navigation />
      <main lang={lang} className="mx-auto max-w-3xl px-6 py-14 text-sm leading-relaxed text-text-secondary">
        <p className="brand-label">{lang === "de" ? "Rechtliches" : "Legal"}</p>
        <h1 className="brand-display mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink">
          {title}
          <span className="text-bloom-red">.</span>
        </h1>
        <div className="mt-4 mb-8 flex flex-wrap gap-4 border-b border-border pb-4 font-mono text-xs text-text-muted">
          <Link href={PATHS[kind][other]} hrefLang={other} lang={other} className="brand-link">
            {other === "de" ? "Deutsch" : "English"}
          </Link>
          {kind === "privacy" && <span>{UPDATED[lang]}</span>}
        </div>

        {kind === "privacy" ? <Privacy op={op} lang={lang} /> : <Imprint op={op} lang={lang} />}

        <div className="mt-14 flex flex-wrap gap-5 border-t border-border pt-4 font-mono text-xs text-text-muted">
          <Link href={PATHS.imprint[lang]} className="brand-link">
            {TITLES.imprint[lang]}
          </Link>
          <Link href={PATHS.privacy[lang]} className="brand-link">
            {lang === "de" ? "Datenschutz" : "Privacy"}
          </Link>
          <a href={SOURCE} className="brand-link">
            {lang === "de" ? "Quellcode" : "Source code"}
          </a>
        </div>
      </main>
    </>
  );
}

export const legalMetadata = (kind: Kind, lang: Lang) => ({
  title: `${TITLES[kind][lang]} · Symphony State`,
  robots: { index: false },
  alternates: {
    languages: { en: PATHS[kind].en, de: PATHS[kind].de },
  },
});

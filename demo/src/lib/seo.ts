// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Metadata } from "next";

export const siteName = "Symphony State";
export const studioName = "shiftbloom studio";
export const studioUrl = "https://shiftbloom.studio";
export const repoUrl = "https://github.com/shiftbloom-studio/symphony-state";
export const npmUrl = "https://www.npmjs.com/package/@shiftbloom-studio/symphony-state";

export const siteUrl = resolveSiteUrl();

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Symphony State, a React library for orchestrating state sources",
};

export const homeTitle = "Symphony State · React library for orchestrating state sources";
export const homeDescription =
  "Open source React library that coordinates TanStack Query, Zustand, Redux, URL params and localStorage. Each store keeps its data, and one conductor commits their updates together.";

/** Per-page metadata with a self-referencing canonical and matching social tags. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // A page-level openGraph object replaces the root one, so the image is repeated here.
    openGraph: { title, description, url: path, images: [socialImage] },
    twitter: { title, description, images: [socialImage.url] },
  };
}

/** schema.org graph for the home page: the npm package, its source and the publisher. */
export function structuredData() {
  const home = siteUrl.toString();
  const org = { "@id": `${studioUrl}/#org` };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${home}#library`,
        name: siteName,
        alternateName: "@shiftbloom-studio/symphony-state",
        description: homeDescription,
        url: home,
        codeRepository: repoUrl,
        programmingLanguage: "TypeScript",
        runtimePlatform: "React 18 or newer",
        license: "https://www.gnu.org/licenses/agpl-3.0.html",
        sameAs: [repoUrl, npmUrl],
        publisher: org,
      },
      {
        "@type": "WebSite",
        "@id": `${home}#site`,
        name: siteName,
        url: home,
        inLanguage: "en",
        publisher: org,
      },
      { "@type": "Organization", "@id": org["@id"], name: studioName, url: studioUrl },
    ],
  };
}

function resolveSiteUrl() {
  const fallback = "https://symphony.shiftbloom.studio";
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return new URL(fallback);
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return new URL(fallback);
  }
}

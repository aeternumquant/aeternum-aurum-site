import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description: string;
  path: string;
  fullTitle?: string;
}

const SITE = "https://aeternumaurum.com";

export function RouteSeo({ title, description, path, fullTitle }: Props) {
  const url = `${SITE}${path}`;
  const finalTitle = fullTitle ?? `${title} — Aeternum Aurum Partners`;
  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
    </Helmet>
  );
}

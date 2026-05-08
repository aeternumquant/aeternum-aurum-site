import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description: string;
  path: string;
}

const SITE = "https://aeternumaurum.com";

export function RouteSeo({ title, description, path }: Props) {
  const url = `${SITE}${path}`;
  const fullTitle = `${title} — Aeternum Aurum Partners`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
    </Helmet>
  );
}

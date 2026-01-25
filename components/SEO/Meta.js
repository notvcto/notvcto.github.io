import React from "react";
import Head from "next/head";

export default function Meta() {
  return (
    <Head>
      /* Primary Meta Tags */
      <title>vcto's portfolio</title>
      <meta charSet="utf-8" />
      <meta name="title" content="vcto's portfolio" />
      <meta
        name="description"
        content="vcto's (notvcto) Personal Portfolio Website"
      />
      <meta name="author" content="vcto (notvcto)" />
      <meta
        name="keywords"
        content="notvcto, notvcto's portfolio, notvcto linux, ubuntu portfolio, notvcto protfolio, notvcto computer, notvcto, notvcto ubuntu, notvcto ubuntu portfolio"
      />
      <meta name="robots" content="index, follow" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#E95420" />
      /* Search Engine */
      <meta name="image" content="images/logos/fevicon.png" />
      /* Schema.org for Google */
      <meta itemProp="name" content="notvcto's portfolio" />
      <meta
        itemProp="description"
        content="vcto's (notvcto) Personal Portfolio Website"
      />
      <meta itemProp="image" content="images/logos/fevicon.png" />
      /* Twitter */
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="vcto" />
      <meta
        name="twitter:description"
        content="vcto's (notvcto) Personal Portfolio Website"
      />
      <meta name="twitter:site" content="notvcto" />
      <meta name="twitter:creator" content="notvcto" />
      <meta name="twitter:image:src" content="images/logos/logo_1024.png" />
      /* Open Graph general (Facebook, Pinterest & Google+) */
      <meta name="og:title" content="vcto's portfolio" />
      <meta
        name="og:description"
        content="vcto's (notvcto) Personal Portfolio Website"
      />
      <meta name="og:image" content="images/logos/logo_1200.png" />
      <meta name="og:url" content="http://notvcto.github.io/" />
      <meta name="og:site_name" content="vcto's Personal Portfolio" />
      <meta name="og:locale" content="en_IN" />
      <meta name="og:type" content="website" />
      <link rel="icon" href="images/logos/fevicon.png" />
      <link rel="apple-touch-icon" href="images/logos/logo.png" />
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap"
        as="style"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      ></link>
    </Head>
  );
}

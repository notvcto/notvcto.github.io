import Head from "next/head";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <Head>
        <title>Under Construction</title>
        <meta name="description" content="Site under construction" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-6xl">
          Under Construction
        </h1>
        <p className="text-lg text-gray-400 md:text-xl">
          Check back soon for v2.
        </p>
      </main>
    </div>
  );
}

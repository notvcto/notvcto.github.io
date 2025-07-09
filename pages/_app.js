<<<<<<< Updated upstream
import 'tailwindcss/tailwind.css'
import '../styles/index.css'
import Script from 'next/script'
=======
import "tailwindcss/tailwind.css";
import "../styles/index.css";
import Script from "next/script";
>>>>>>> Stashed changes

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-name="BMC-Widget"
        data-cfasync="false"
        data-id="vcto"
        data-description="Support me on Buy me a coffee!"
        data-message=""
        data-color="#FF813F"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
        strategy="afterInteractive"
      />
    </>
<<<<<<< Updated upstream
  )
=======
  );
>>>>>>> Stashed changes
}

export default MyApp;

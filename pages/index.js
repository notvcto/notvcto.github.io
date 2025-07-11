import Ubuntu from "../components/ubuntu";
import ReactGA from "react-ga4";
import { useEffect } from "react";
import Meta from "../components/SEO/Meta";

const TRACKING_ID = process.env.NEXT_PUBLIC_TRACKING_ID;

function App() {
  useEffect(() => {
    // Only initialize GA if we have a valid tracking ID
    if (TRACKING_ID && TRACKING_ID !== "G-XXXXXXXXXX") {
      ReactGA.initialize(TRACKING_ID);
    }
  }, []);

  return (
    <>
      <Meta />
      <Ubuntu />
    </>
  );
}

export default App;

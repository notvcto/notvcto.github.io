import Ubuntu from "../components/ubuntu";
import ReactGA from "react-ga4";
import { useEffect } from "react";
import Meta from "../components/SEO/Meta";
import { getSortedPostsData, getPostData } from "../lib/blog";

const TRACKING_ID = process.env.NEXT_PUBLIC_TRACKING_ID;

function App({ blogPosts }) {
  useEffect(() => {
    // Only initialize GA if we have a valid tracking ID
    if (TRACKING_ID && TRACKING_ID !== "G-XXXXXXXXXX") {
      ReactGA.initialize(TRACKING_ID);
    }
  }, []);

  return (
    <>
      <Meta />
      <Ubuntu blogPosts={blogPosts} />
    </>
  );
}

export default App;

export async function getStaticProps() {
  const allPostsData = await getSortedPostsData();

  // Get full content for each post
  const blogPosts = await Promise.all(
    allPostsData.map(async (post) => {
      const postData = await getPostData(post.id);
      return postData;
    })
  );

  return {
    props: {
      blogPosts,
    },
  };
}

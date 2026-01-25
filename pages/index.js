import Ubuntu from "../components/ubuntu";
import ReactGA from "react-ga4";
import { useEffect } from "react";
import Meta from "../components/SEO/Meta";
import { getSortedPostsData, getPostData } from "../lib/blog";
import { getSortedAchievementsData, getAchievementData } from "../lib/achievements";

const TRACKING_ID = process.env.NEXT_PUBLIC_TRACKING_ID;

function App({ blogPosts, achievements }) {
  useEffect(() => {
    // Only initialize GA if we have a valid tracking ID
    if (TRACKING_ID && TRACKING_ID !== "G-XXXXXXXXXX") {
      ReactGA.initialize(TRACKING_ID);
    }
  }, []);

  return (
    <>
      <Meta />
      <Ubuntu blogPosts={blogPosts} achievements={achievements} />
    </>
  );
}

export default App;

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allAchievementsData = getSortedAchievementsData();

  // Get full content for each post
  const blogPosts = await Promise.all(
    allPostsData.map(async (post) => {
      const postData = await getPostData(post.id);
      return postData;
    })
  );

  // Get full content for each achievement
  const achievements = await Promise.all(
    allAchievementsData.map(async (achievement) => {
      const achievementData = await getAchievementData(achievement.id);
      return achievementData;
    })
  );

  return {
    props: {
      blogPosts,
      achievements,
    },
  };
}

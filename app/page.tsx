import Desktop from "@/components/screen/Desktop";
import { getSortedPostsData, getPostData } from "@/lib/blog";
import { getSortedAchievementsData, getAchievementData } from "@/lib/achievements";

async function getData() {
  const allPostsData = getSortedPostsData();
  const allAchievementsData = getSortedAchievementsData();

  const blogPosts = await Promise.all(
    allPostsData.map(async (post) => {
      const postData = await getPostData(post.id);
      return postData;
    })
  );

  const achievements = await Promise.all(
    allAchievementsData.map(async (achievement) => {
      const achievementData = await getAchievementData(achievement.id);
      return achievementData;
    })
  );

  return { blogPosts, achievements };
}

export default async function Home() {
  const { blogPosts, achievements } = await getData();

  return <Desktop blogPosts={blogPosts} achievements={achievements} />;
}

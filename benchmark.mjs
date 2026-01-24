import { getPostData, getSortedPostsData } from './lib/blog.js';
import { performance } from 'perf_hooks';

async function runBenchmark() {
  console.log('Starting benchmark...');

  // Measure getSortedPostsData
  const startSorted = performance.now();
  let sortedPosts;
  // It is currently synchronous, but we handle if it becomes async
  try {
    const result = getSortedPostsData();
    if (result instanceof Promise) {
        sortedPosts = await result;
    } else {
        sortedPosts = result;
    }
  } catch (e) {
    console.error("Error in getSortedPostsData:", e);
  }
  const endSorted = performance.now();
  console.log(`getSortedPostsData took ${(endSorted - startSorted).toFixed(4)} ms`);
  console.log(`Found ${sortedPosts?.length} posts.`);

  // Measure getPostData for the first post found
  if (sortedPosts && sortedPosts.length > 0) {
      const postId = sortedPosts[0].id;
      const startPost = performance.now();
      await getPostData(postId);
      const endPost = performance.now();
      console.log(`getPostData('${postId}') took ${(endPost - startPost).toFixed(4)} ms`);
  } else {
      console.log("No posts found to benchmark getPostData");
  }

  // Run multiple iterations for better average
  console.log('\nRunning 100 iterations for getPostData...');
  if (sortedPosts && sortedPosts.length > 0) {
      const postId = sortedPosts[0].id;
      const startAvg = performance.now();
      for (let i = 0; i < 100; i++) {
          await getPostData(postId);
      }
      const endAvg = performance.now();
      console.log(`Average getPostData('${postId}') took ${((endAvg - startAvg) / 100).toFixed(4)} ms`);
  }
}

runBenchmark();

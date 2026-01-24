import { getSortedPostsData } from '../../../lib/blog';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const posts = await getSortedPostsData();
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
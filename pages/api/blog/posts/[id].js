import { getPostData } from '../../../../lib/blog';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      const post = await getPostData(id);
      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(404).json({ error: 'Post not found' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
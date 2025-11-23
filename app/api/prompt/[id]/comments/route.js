import { connectToDB } from "@utils/database";
import Comment from "@models/comment";

// GET comments for a prompt
export const GET = async (req, { params }) => {
  const { id } = await params;
  
  try {
    await connectToDB();

    const comments = await Comment.find({ prompt: id })
      .populate('user', 'username image')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(comments), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch comments", { status: 500 });
  }
};

// POST a new comment
export const POST = async (req, { params }) => {
  const { userId, text } = await req.json();
  const { id } = await params;

  try {
    await connectToDB();

    const newComment = new Comment({
      prompt: id,
      user: userId,
      text,
    });

    await newComment.save();
    await newComment.populate('user', 'username image');

    return new Response(JSON.stringify(newComment), { status: 201 });
  } catch (error) {
    return new Response("Failed to create comment", { status: 500 });
  }
};

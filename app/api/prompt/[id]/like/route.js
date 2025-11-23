import { connectToDB } from "@utils/database";
import Prompt from "@models/prompt";

export const POST = async (req, { params }) => {
  const { userId } = await req.json();
  const { id } = await params;

  try {
    await connectToDB();

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    // Initialize likes array if it doesn't exist
    if (!prompt.likes) {
      prompt.likes = [];
    }

    const likeIndex = prompt.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      prompt.likes.splice(likeIndex, 1);
    } else {
      // Like
      prompt.likes.push(userId);
    }

    await prompt.save();

    // Return the updated prompt with likes
    const updatedPrompt = await Prompt.findById(id).populate('creator');
    return new Response(JSON.stringify(updatedPrompt), { status: 200 });
  } catch (error) {
    console.error("Error liking prompt:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

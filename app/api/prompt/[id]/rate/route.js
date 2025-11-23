import { connectToDB } from "@utils/database";
import Prompt from "@models/prompt";

export const POST = async (req, { params }) => {
  const { rating } = await req.json();
  const { id } = await params;

  try {
    await connectToDB();

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    // Initialize rating if it doesn't exist
    if (!prompt.rating) {
      prompt.rating = {
        total: 0,
        count: 0,
        average: 0
      };
    }

    // Update rating
    prompt.rating.total += rating;
    prompt.rating.count += 1;
    prompt.rating.average = prompt.rating.total / prompt.rating.count;

    await prompt.save();

    return new Response(JSON.stringify(prompt), { status: 200 });
  } catch (error) {
    console.error("Error rating prompt:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

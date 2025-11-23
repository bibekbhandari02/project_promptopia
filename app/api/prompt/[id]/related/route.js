import { connectToDB } from "@utils/database";
import Prompt from "@models/prompt";

export const GET = async (req, { params }) => {
  const { id } = await params;
  
  try {
    await connectToDB();

    const currentPrompt = await Prompt.findById(id);

    if (!currentPrompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    // Find prompts with same tag or category
    const relatedPrompts = await Prompt.find({
      _id: { $ne: id },
      $or: [
        { tag: currentPrompt.tag },
        { category: currentPrompt.category }
      ]
    })
      .populate("creator")
      .limit(5)
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(relatedPrompts), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch related prompts", { status: 500 });
  }
};

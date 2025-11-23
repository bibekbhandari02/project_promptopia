import { connectToDB } from "@utils/database";
import Prompt from "@models/prompt";

export const GET = async (req) => {
  try {
    await connectToDB();

    // Get prompts from last 7 days, sorted by likes and views
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const prompts = await Prompt.find({
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate("creator")
      .sort({ likes: -1, views: -1 })
      .limit(10);

    return new Response(JSON.stringify(prompts), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch trending prompts", { status: 500 });
  }
};

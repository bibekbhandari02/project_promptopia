import { connectToDB } from "@utils/database";
import User from "@models/user";

export const POST = async (req, { params }) => {
  const { promptId } = await req.json();
  const { id } = await params;

  try {
    await connectToDB();

    const user = await User.findById(id);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Initialize bookmarks if it doesn't exist
    if (!user.bookmarks) {
      user.bookmarks = [];
    }

    const bookmarkIndex = user.bookmarks.indexOf(promptId);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      user.bookmarks.push(promptId);
    }

    await user.save();

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response("Failed to bookmark prompt", { status: 500 });
  }
};

// GET user bookmarks
export const GET = async (req, { params }) => {
  const { id } = await params;
  
  try {
    await connectToDB();

    const user = await User.findById(id);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Initialize bookmarks if it doesn't exist
    if (!user.bookmarks) {
      user.bookmarks = [];
      await user.save();
    }

    // Populate bookmarks
    await user.populate({
      path: 'bookmarks',
      populate: { path: 'creator', select: 'username email image' }
    });

    return new Response(JSON.stringify(user.bookmarks || []), { status: 200 });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return new Response(JSON.stringify([]), { status: 200 }); // Return empty array instead of error
  }
};

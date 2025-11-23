import { connectToDB } from "@utils/database";
import User from "@models/user";

export const POST = async (req, { params }) => {
  const { targetUserId } = await req.json();
  const { id } = await params;

  try {
    await connectToDB();

    const user = await User.findById(id);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const followIndex = user.following.indexOf(targetUserId);

    if (followIndex > -1) {
      // Unfollow
      user.following.splice(followIndex, 1);
    } else {
      // Follow
      user.following.push(targetUserId);
    }

    await user.save();

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response("Failed to follow/unfollow user", { status: 500 });
  }
};

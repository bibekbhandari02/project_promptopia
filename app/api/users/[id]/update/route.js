import { connectToDB } from "@utils/database";
import User from "@models/user";

export const PATCH = async (req, { params }) => {
  const { username } = await req.json();
  const { id } = await params;

  try {
    await connectToDB();

    const user = await User.findById(id);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Validate username
    if (!username || username.length < 8 || username.length > 20) {
      return new Response(JSON.stringify({ error: "Username must be between 8 and 20 characters" }), { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
    if (!usernameRegex.test(username)) {
      return new Response(JSON.stringify({ error: "Username can only contain letters, numbers, dots and underscores" }), { status: 400 });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already taken" }), { status: 400 });
    }

    user.username = username;
    await user.save();

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error updating username:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

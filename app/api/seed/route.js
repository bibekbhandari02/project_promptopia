import { connectToDB } from "@utils/database";
import Prompt from "@models/prompt";
import User from "@models/user";

const samplePrompts = [
  {
    prompt: "Create a photorealistic image of a futuristic city at sunset, with flying cars, neon lights, and towering skyscrapers made of glass and steel. Include a vibrant orange and purple sky.",
    tag: "futuristic",
    category: "AI Art"
  },
  {
    prompt: "Write a Python function that implements a binary search algorithm with error handling and type hints. Include docstrings and example usage.",
    tag: "python",
    category: "Coding"
  },
  {
    prompt: "Generate a compelling opening paragraph for a mystery novel set in Victorian London, introducing a detective who has just discovered an unusual clue.",
    tag: "mystery",
    category: "Writing"
  },
  {
    prompt: "Create a detailed business plan outline for a sustainable coffee shop that focuses on zero-waste practices and community engagement.",
    tag: "startup",
    category: "Business"
  },
  {
    prompt: "Explain quantum entanglement to a 10-year-old using simple analogies and everyday examples. Make it fun and engaging.",
    tag: "science",
    category: "Education"
  },
  {
    prompt: "Design a fantasy character: a wise old wizard with a mysterious past, unique magical abilities, and a distinctive appearance. Include personality traits and backstory.",
    tag: "character-design",
    category: "AI Art"
  },
  {
    prompt: "Write a React component that creates an interactive data visualization dashboard with charts, filters, and real-time updates using hooks.",
    tag: "react",
    category: "Coding"
  },
  {
    prompt: "Compose a heartfelt letter from a time traveler to their younger self, offering advice and wisdom gained from future experiences.",
    tag: "creative-writing",
    category: "Writing"
  },
  {
    prompt: "Develop a comprehensive social media marketing strategy for a new eco-friendly fashion brand targeting Gen Z consumers.",
    tag: "marketing",
    category: "Business"
  },
  {
    prompt: "Create an engaging lesson plan for teaching basic algebra to middle school students using gamification and real-world applications.",
    tag: "mathematics",
    category: "Education"
  },
  {
    prompt: "Generate a cyberpunk-style portrait of a hacker in a dark room illuminated only by multiple computer screens, with code reflections on their face.",
    tag: "cyberpunk",
    category: "AI Art"
  },
  {
    prompt: "Build a REST API endpoint in Node.js with Express that handles user authentication using JWT tokens, including middleware for protected routes.",
    tag: "nodejs",
    category: "Coding"
  },
  {
    prompt: "Write a product description for a smart home device that makes it sound innovative, user-friendly, and essential for modern living.",
    tag: "copywriting",
    category: "Writing"
  },
  {
    prompt: "Create a pitch deck outline for a mobile app that connects local farmers with consumers, emphasizing sustainability and fair trade.",
    tag: "pitch",
    category: "Business"
  },
  {
    prompt: "Design an interactive history lesson about ancient Egypt that includes virtual tours, quizzes, and hands-on activities for high school students.",
    tag: "history",
    category: "Education"
  }
];

export const POST = async (req) => {
  try {
    await connectToDB();

    // Get the first user (you need to be signed in first)
    const user = await User.findOne();

    if (!user) {
      return new Response("No user found. Please sign in first.", { status: 400 });
    }

    // Delete all existing prompts
    const deleteResult = await Prompt.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} prompts`);

    // Create new prompts
    const createdPrompts = [];
    
    for (const promptData of samplePrompts) {
      // Generate realistic ratings (1-5 stars)
      const ratingCount = Math.floor(Math.random() * 10) + 1; // 1-10 ratings
      let ratingTotal = 0;
      
      // Simulate individual ratings between 1-5
      for (let i = 0; i < ratingCount; i++) {
        ratingTotal += Math.floor(Math.random() * 5) + 1; // Each rating is 1-5
      }
      
      const ratingAverage = ratingTotal / ratingCount;

      const newPrompt = new Prompt({
        creator: user._id,
        prompt: promptData.prompt,
        tag: promptData.tag,
        category: promptData.category,
        likes: [],
        rating: {
          total: ratingTotal,
          count: ratingCount,
          average: ratingAverage,
        },
        views: Math.floor(Math.random() * 100),
      });
      
      await newPrompt.save();
      createdPrompts.push(newPrompt);
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully deleted old prompts and created ${createdPrompts.length} new prompts!`,
        prompts: createdPrompts 
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error seeding database:', error);
    return new Response("Failed to seed database", { status: 500 });
  }
};

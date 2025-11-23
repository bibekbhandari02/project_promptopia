const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://narutobibek000:bibek123@cluster0.7tqfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas
const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  image: String,
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const PromptSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prompt: String,
  tag: String,
  category: {
    type: String,
    enum: ['AI Art', 'Coding', 'Writing', 'Business', 'Education', 'Other'],
    default: 'Other',
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: {
    total: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
  },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Prompt = mongoose.models.Prompt || mongoose.model('Prompt', PromptSchema);

// Sample prompts data
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

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find the first user or create a default one
    let user = await User.findOne();
    
    if (!user) {
      console.log('No users found. Please sign in first to create a user.');
      process.exit(1);
    }

    console.log(`Using user: ${user.username}`);

    // Delete all existing prompts
    console.log('Deleting existing prompts...');
    const deleteResult = await Prompt.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} prompts`);

    // Create new prompts
    console.log('Creating new prompts...');
    const prompts = [];
    
    for (const promptData of samplePrompts) {
      const newPrompt = await Prompt.create({
        creator: user._id,
        prompt: promptData.prompt,
        tag: promptData.tag,
        category: promptData.category,
        likes: [],
        rating: {
          total: Math.floor(Math.random() * 20) + 5,
          count: Math.floor(Math.random() * 5) + 1,
          average: 0,
        },
        views: Math.floor(Math.random() * 100),
      });
      
      // Calculate average rating
      newPrompt.rating.average = newPrompt.rating.total / newPrompt.rating.count;
      await newPrompt.save();
      
      prompts.push(newPrompt);
      console.log(`Created: ${promptData.category} - ${promptData.tag}`);
    }

    console.log(`\nSuccessfully created ${prompts.length} prompts!`);
    console.log('Database seeding complete.');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

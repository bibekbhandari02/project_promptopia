import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";

export const GET = async(req)=>{
    try {
        await connectToDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const order = searchParams.get('order') || 'desc';

        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        let sortOptions = {};
        if (sortBy === 'popular') {
            sortOptions = { likes: order === 'desc' ? -1 : 1 };
        } else if (sortBy === 'rating') {
            sortOptions = { 'rating.average': order === 'desc' ? -1 : 1 };
        } else {
            sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };
        }

        const prompts = await Prompt.find(query)
            .populate('creator')
            .sort(sortOptions);

        return new Response(JSON.stringify(prompts), {status: 200})
    } catch (error) {
        return new Response("Failed to fetch all prompts", {status: 500})
    }
}
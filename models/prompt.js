import {Schema, model, models} from "mongoose";

const PromptSchema = new Schema({
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    prompt:{
        type:String,
        required:[true, 'Prompt is required.'],
    },
    tag:{
        type:String,
        required:[true, 'tag is required.'],
    },
    category:{
        type:String,
        enum: ['AI Art', 'Coding', 'Writing', 'Business', 'Education', 'Other'],
        default: 'Other',
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    rating:{
        total: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
    },
    views:{
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Prompt = models.Prompt || model('Prompt', PromptSchema);

export default Prompt;
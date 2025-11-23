import {Schema, model, models} from "mongoose";

const CommentSchema = new Schema({
    prompt:{
        type: Schema.Types.ObjectId,
        ref: 'Prompt',
        required: true,
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text:{
        type: String,
        required: [true, 'Comment text is required.'],
    },
}, { timestamps: true });

const Comment = models.Comment || model('Comment', CommentSchema);

export default Comment;

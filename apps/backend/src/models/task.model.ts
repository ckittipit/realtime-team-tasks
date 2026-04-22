import mongoose, { Schema, Document, Model } from 'mongoose'

export type TaskStatus = 'todo' | 'doing' | 'done'

export interface ITask extends Document {
	title: string
	description?: string
	status: TaskStatus
	createdBy: mongoose.Types.ObjectId
	assignee?: mongoose.Types.ObjectId
	createdAt: Date
	updatedAt: Date
}

const taskSchema = new Schema<ITask>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
		},
		status: {
			type: String,
			enum: ['todo', 'doing', 'done'],
			default: 'todo',
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		assignee: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	},
)

export const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
	googleId: string
	email: string
	name: string
	avatar?: string
	createdAt: Date
	updatedAt: Date
}

const userSchema = new Schema<IUser>(
	{
		googleId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
)

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema)

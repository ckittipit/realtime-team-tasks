import { User, IUser } from '../models/user.model'

type GoogleProfileInput = {
	googleId: string
	email: string
	name: string
	avatar?: string
}

export async function findOrCreateGoogleUser(
	input: GoogleProfileInput,
): Promise<IUser> {
	const existingUser = await User.findOne({
		$or: [{ googleId: input.googleId }, { email: input.email }], // Check if a user with the same googleId or email already exists
	})

	if (existingUser) {
		existingUser.googleId = input.googleId
		existingUser.name = input.name
		existingUser.avatar = input.avatar
		await existingUser.save()
		return existingUser
	}

	const newUser = await User.create({
		googleId: input.googleId,
		email: input.email,
		name: input.name,
		avatar: input.avatar,
	})

	return newUser
}

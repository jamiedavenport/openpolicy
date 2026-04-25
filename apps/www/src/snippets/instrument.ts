import { collecting, Ignore, thirdParty } from "@openpolicy/sdk";

export async function createUser(input: { name: string; email: string; password: string }) {
	const user = collecting(
		"Account Info",
		{
			name: input.name,
			email: input.email,
			hashedPassword: await hash(input.password),
		},
		{
			email: "Email address",
			hashedPassword: Ignore,
		},
	);

	return db.users.insert(user);
}

thirdParty("Stripe", "Payment processing", "https://stripe.com/privacy");

import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import openpolicy from "./openpolicy";

export function PrivacyPolicyPage() {
	return (
		<OpenPolicy config={openpolicy}>
			<PrivacyPolicy
				components={{
					Heading: ({ node }) => <h2 className="text-2xl font-bold">{node.value}</h2>,
					Paragraph: ({ children }) => <p className="text-sm text-gray-500">{children}</p>,
				}}
			/>
		</OpenPolicy>
	);
}

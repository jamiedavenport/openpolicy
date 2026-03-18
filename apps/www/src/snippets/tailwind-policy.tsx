import { PrivacyPolicy } from "@openpolicy/react";

const policyStyles = [
	"**:data-op-section:mb-10 **:data-op-section:border-b **:data-op-section:border-gray-200 **:data-op-section:pb-10",
	"**:data-op-heading:text-xl **:data-op-heading:font-semibold **:data-op-heading:mb-4",
	"**:data-op-paragraph:text-sm **:data-op-paragraph:text-gray-500 **:data-op-paragraph:leading-relaxed **:data-op-paragraph:mb-3",
].join(" ");

export function PrivacyPolicyPage() {
	return (
		<div className={policyStyles}>
			<PrivacyPolicy />
		</div>
	);
}

import policy from "../../public/policies/privacy-policy.html?raw";

export function PrivacyPolicyPage() {
	return <div dangerouslySetInnerHTML={{ __html: policy }} />;
}

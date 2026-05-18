export type PolicyStackConsentErrorCode = "UNKNOWN_CATEGORY";

export class OpenCookiesError extends Error {
	readonly code: PolicyStackConsentErrorCode;

	constructor(code: PolicyStackConsentErrorCode, message: string) {
		super(message);
		this.name = "OpenCookiesError";
		this.code = code;
	}
}

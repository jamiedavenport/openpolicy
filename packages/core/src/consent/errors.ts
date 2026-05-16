export type OpenCookiesErrorCode = "UNKNOWN_CATEGORY";

export class OpenCookiesError extends Error {
	readonly code: OpenCookiesErrorCode;

	constructor(code: OpenCookiesErrorCode, message: string) {
		super(message);
		this.name = "OpenCookiesError";
		this.code = code;
	}
}

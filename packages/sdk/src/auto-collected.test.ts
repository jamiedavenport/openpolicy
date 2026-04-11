import { expect, test } from "bun:test";
import { autoCollected } from "./auto-collected";

test("autoCollected is an empty object when no plugin is active", () => {
	// At runtime (without the vite-auto-collect plugin intercepting this
	// module's resolution) the sentinel is a plain empty record, so spreading
	// it into `dataCollected` is a no-op.
	expect(autoCollected).toEqual({});
});

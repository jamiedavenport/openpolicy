import { expect, test } from "bun:test";
import { dataCollected } from "./auto-collected";

test("dataCollected is an empty object when no plugin is active", () => {
	// At runtime (without the @openpolicy/vite plugin intercepting this
	// module's resolution) the sentinel is a plain empty record, so spreading
	// it into `dataCollected` is a no-op.
	expect(dataCollected).toEqual({});
});

/**
 * Declares data collected at the point of storage. Returns `value` unchanged
 * at runtime — the Vite plugin / CLI static analyser (OP-152) will scan calls
 * to `collecting()` at build time and merge the declarations into the
 * compiled privacy policy.
 *
 * The third argument is a label function mapping the stored value to a
 * record whose **keys** describe what each field represents in
 * human-readable terms. Only those keys are used by the analyser; the
 * function body is never executed at runtime. This shape lets you:
 *   - keep `value` matching your ORM/table schema exactly,
 *   - describe fields with friendly labels for the policy,
 *   - omit fields from the policy by leaving them out of the label record
 *     (e.g. `hashedPassword`).
 *
 * The category argument and the keys of the label record must be string
 * literals — dynamic values are silently skipped by the analyser.
 *
 * @example
 * ```ts
 * import { collecting } from "@openpolicy/sdk";
 *
 * export async function createUser(name: string, email: string) {
 *   return db.insert(users).values(
 *     collecting(
 *       "Account Information",
 *       { name, email }, // real ORM columns — returned unchanged
 *       (v) => ({
 *         Name: v.name,
 *         "Email address": v.email,
 *       }),
 *     ),
 *   );
 * }
 * ```
 */
export function collecting<T>(
	_category: string,
	value: T,
	_label: (v: T) => Record<string, unknown>,
): T {
	return value;
}

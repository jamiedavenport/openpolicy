/**
 * Declares data collected at the point of storage. Returns `value` unchanged
 * at runtime — the Vite plugin / CLI static analyser (OP-152) will scan calls
 * to `collecting()` at build time and merge the declarations into the
 * compiled privacy policy.
 *
 * The third argument is a plain object literal whose **keys** are field names
 * matching your stored value (for convenient access without a typed callback)
 * and whose **values** are the human-readable labels used in the compiled
 * policy. Only the string values are used by the analyser; the object is
 * never evaluated at runtime. This shape lets you:
 *   - keep `value` matching your ORM/table schema exactly,
 *   - describe fields with friendly labels for the policy,
 *   - omit fields from the policy by leaving them out of the label record
 *     (e.g. `hashedPassword`).
 *
 * The category argument and the string values of the label record must be
 * string literals — dynamic values are silently skipped by the analyser.
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
 *       { name: "Name", email: "Email address" },
 *     ),
 *   );
 * }
 * ```
 */
export function collecting<T>(
	_category: string,
	value: T,
	_label: Partial<Record<keyof T, string>>,
): T {
	return value;
}

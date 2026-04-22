import "node:module";
import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

Object.create;
Object.defineProperty;
Object.getOwnPropertyDescriptor;
Object.getOwnPropertyNames;
Object.getPrototypeOf;
Object.prototype.hasOwnProperty;
const input = {
	index: "./src/index.ts",
	"auto-collected": "./src/auto-collected.ts",
};
const external = (id) => id !== "@openpolicy/core" && /^[^./]/.test(id);
var rolldown_config_default = defineConfig([
	{
		input,
		external,
		output: {
			format: "esm",
			dir: "dist",
		},
	},
	{
		input,
		plugins: [dts()],
		external,
		output: {
			format: "esm",
			dir: "dist",
		},
	},
]);
//#endregion
export { rolldown_config_default as default };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbGRvd24uY29uZmlnLkJuenczaHFDLmpzIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbInJvbGxkb3duLmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwicm9sbGRvd25cIjtcbmltcG9ydCB7IGR0cyB9IGZyb20gXCJyb2xsZG93bi1wbHVnaW4tZHRzXCI7XG5cbi8vIFR3byBlbnRyeSBwb2ludHMgb24gcHVycG9zZTogYC4vYXV0by1jb2xsZWN0ZWRgIGlzIGtlcHQgYXMgYSBzZXBhcmF0ZVxuLy8gY2h1bmsgc28gdGhlIGBkaXN0L2luZGV4LmpzYCBidW5kbGUgcmVmZXJlbmNlcyBpdCB2aWEgYSByZWxhdGl2ZVxuLy8gYC4vYXV0by1jb2xsZWN0ZWQuanNgIGltcG9ydCBpbnN0ZWFkIG9mIGlubGluaW5nIGl0cyBjb250ZW50cy4gVGhhdFxuLy8gcmVsYXRpdmUgaW1wb3J0IGlzIHdoYXQgYEBvcGVucG9saWN5L3ZpdGVgJ3MgYHJlc29sdmVJZGAgaG9va1xuLy8gaW50ZXJjZXB0cyB0byBpbmxpbmUgc2Nhbm5lZCBjYXRlZ29yaWVzIGF0IGNvbnN1bWVyIGJ1aWxkIHRpbWUuXG5jb25zdCBpbnB1dCA9IHtcblx0aW5kZXg6IFwiLi9zcmMvaW5kZXgudHNcIixcblx0XCJhdXRvLWNvbGxlY3RlZFwiOiBcIi4vc3JjL2F1dG8tY29sbGVjdGVkLnRzXCIsXG59O1xuXG5jb25zdCBleHRlcm5hbCA9IChpZDogc3RyaW5nKTogYm9vbGVhbiA9PlxuXHRpZCAhPT0gXCJAb3BlbnBvbGljeS9jb3JlXCIgJiYgL15bXi4vXS8udGVzdChpZCk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhbXG5cdHtcblx0XHRpbnB1dCxcblx0XHRleHRlcm5hbCxcblx0XHRvdXRwdXQ6IHsgZm9ybWF0OiBcImVzbVwiLCBkaXI6IFwiZGlzdFwiIH0sXG5cdH0sXG5cdHtcblx0XHRpbnB1dCxcblx0XHRwbHVnaW5zOiBbZHRzKCldLFxuXHRcdGV4dGVybmFsLFxuXHRcdG91dHB1dDogeyBmb3JtYXQ6IFwiZXNtXCIsIGRpcjogXCJkaXN0XCIgfSxcblx0fSxcbl0pO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFRQSxNQUFNLFFBQVE7Q0FDYixPQUFPO0NBQ1Asa0JBQWtCO0NBQ2xCO0FBRUQsTUFBTSxZQUFZLE9BQ2pCLE9BQU8sc0JBQXNCLFNBQVMsS0FBSyxHQUFHO0FBRS9DLElBQUEsMEJBQWUsYUFBYSxDQUMzQjtDQUNDO0NBQ0E7Q0FDQSxRQUFRO0VBQUUsUUFBUTtFQUFPLEtBQUs7RUFBUTtDQUN0QyxFQUNEO0NBQ0M7Q0FDQSxTQUFTLENBQUMsS0FBSyxDQUFDO0NBQ2hCO0NBQ0EsUUFBUTtFQUFFLFFBQVE7RUFBTyxLQUFLO0VBQVE7Q0FDdEMsQ0FDRCxDQUFDIn0=

import { describe, expect, it } from "vite-plus/test";
import { parseDuration } from "./duration";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

describe("parseDuration", () => {
	it("returns null for null/undefined", () => {
		expect(parseDuration(null)).toBeNull();
		expect(parseDuration(undefined)).toBeNull();
	});

	it("passes numeric ms through", () => {
		expect(parseDuration(0)).toBe(0);
		expect(parseDuration(1234)).toBe(1234);
	});

	it("throws on negative or non-finite numbers", () => {
		expect(() => parseDuration(-1)).toThrow();
		expect(() => parseDuration(Number.NaN)).toThrow();
		expect(() => parseDuration(Number.POSITIVE_INFINITY)).toThrow();
	});

	it("throws on empty/garbage strings", () => {
		expect(() => parseDuration("")).toThrow();
		expect(() => parseDuration("   ")).toThrow();
		expect(() => parseDuration("abc")).toThrow();
		expect(() => parseDuration("13")).toThrow();
		expect(() => parseDuration("13 lightyears")).toThrow();
	});

	describe("human-friendly strings", () => {
		it("parses canonical units", () => {
			expect(parseDuration("13 months")).toBe(13 * MONTH);
			expect(parseDuration("30 days")).toBe(30 * DAY);
			expect(parseDuration("1 year")).toBe(YEAR);
			expect(parseDuration("24 hours")).toBe(24 * HOUR);
			expect(parseDuration("1 week")).toBe(WEEK);
			expect(parseDuration("5 minutes")).toBe(5 * MINUTE);
			expect(parseDuration("30 seconds")).toBe(30 * SECOND);
		});

		it("accepts singular and short aliases", () => {
			expect(parseDuration("1 day")).toBe(DAY);
			expect(parseDuration("1d")).toBe(DAY);
			expect(parseDuration("2h")).toBe(2 * HOUR);
			expect(parseDuration("90s")).toBe(90 * SECOND);
			expect(parseDuration("3 mo")).toBe(3 * MONTH);
		});

		it("is case-insensitive on units", () => {
			expect(parseDuration("13 Months")).toBe(13 * MONTH);
			expect(parseDuration("1 YEAR")).toBe(YEAR);
		});

		it("accepts decimal values", () => {
			expect(parseDuration("0.5 days")).toBe(0.5 * DAY);
		});
	});

	describe("ISO 8601 strings", () => {
		it("parses single-component values", () => {
			expect(parseDuration("P13M")).toBe(13 * MONTH);
			expect(parseDuration("P30D")).toBe(30 * DAY);
			expect(parseDuration("P1Y")).toBe(YEAR);
			expect(parseDuration("P1W")).toBe(WEEK);
			expect(parseDuration("PT24H")).toBe(24 * HOUR);
			expect(parseDuration("PT5M")).toBe(5 * MINUTE);
			expect(parseDuration("PT30S")).toBe(30 * SECOND);
		});

		it("parses combined values, distinguishing date-M from time-M", () => {
			expect(parseDuration("P1Y2M")).toBe(YEAR + 2 * MONTH);
			expect(parseDuration("P1DT12H")).toBe(DAY + 12 * HOUR);
			expect(parseDuration("PT1H30M")).toBe(HOUR + 30 * MINUTE);
		});

		it("is case-insensitive on the leading P", () => {
			expect(parseDuration("p13m")).toBe(13 * MONTH);
		});

		it("rejects malformed ISO 8601", () => {
			expect(() => parseDuration("P")).toThrow();
			expect(() => parseDuration("P13X")).toThrow();
		});
	});
});

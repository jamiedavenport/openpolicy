const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const HUMAN_UNITS: Record<string, number> = {
	second: SECOND,
	seconds: SECOND,
	sec: SECOND,
	secs: SECOND,
	s: SECOND,
	minute: MINUTE,
	minutes: MINUTE,
	min: MINUTE,
	mins: MINUTE,
	m: MINUTE,
	hour: HOUR,
	hours: HOUR,
	hr: HOUR,
	hrs: HOUR,
	h: HOUR,
	day: DAY,
	days: DAY,
	d: DAY,
	week: WEEK,
	weeks: WEEK,
	w: WEEK,
	month: MONTH,
	months: MONTH,
	mo: MONTH,
	year: YEAR,
	years: YEAR,
	yr: YEAR,
	yrs: YEAR,
	y: YEAR,
};

export function parseDuration(value: number | string | null | undefined): number | null {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") {
		if (!Number.isFinite(value) || value < 0) {
			throw new Error(`Invalid duration: ${value}`);
		}
		return value;
	}
	const trimmed = value.trim();
	if (trimmed.length === 0) throw new Error("Invalid duration: empty string");

	if (/^P/i.test(trimmed)) return parseIso8601(trimmed);

	const human = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/.exec(trimmed);
	if (human) {
		const n = Number.parseFloat(human[1] ?? "");
		const unit = (human[2] ?? "").toLowerCase();
		const factor = HUMAN_UNITS[unit];
		if (factor === undefined) throw new Error(`Unknown duration unit: "${human[2]}"`);
		return n * factor;
	}

	throw new Error(`Invalid duration: "${value}"`);
}

const ISO_RE =
	/^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i;

function parseIso8601(value: string): number {
	const m = ISO_RE.exec(value);
	if (!m || m[0] === "P") throw new Error(`Invalid ISO 8601 duration: "${value}"`);
	const [, y, mo, w, d, h, mi, s] = m;
	return (
		num(y) * YEAR +
		num(mo) * MONTH +
		num(w) * WEEK +
		num(d) * DAY +
		num(h) * HOUR +
		num(mi) * MINUTE +
		num(s) * SECOND
	);
}

function num(value: string | undefined): number {
	return value === undefined ? 0 : Number.parseFloat(value);
}

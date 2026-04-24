import { expect, test } from "@playwright/test";

// ─── Cookie Banner route ──────────────────────────────────────────────────────

test.describe("/cookie-banner", () => {
	test.beforeEach(async ({ page }) => {
		// Clear the consent from localStorage before each test so the banner is always shown.
		await page.goto("/cookie-banner");
		await page.evaluate(() => localStorage.removeItem("op_consent"));
		await page.reload();
	});

	test("banner is visible on first visit", async ({ page }) => {
		await expect(page.getByText("We value your privacy")).toBeVisible();
	});

	test("Accept All closes the banner", async ({ page }) => {
		await page.getByRole("button", { name: "Accept All" }).click();
		await expect(page.getByText("We value your privacy")).not.toBeVisible();
		await expect(page.getByTestId("consent-status")).toHaveText("completed");
	});

	test("Necessary Only closes the banner", async ({ page }) => {
		await page.getByRole("button", { name: "Necessary Only" }).click();
		await expect(page.getByText("We value your privacy")).not.toBeVisible();
		await expect(page.getByTestId("consent-status")).toHaveText("completed");
	});

	test("Manage Cookies opens the preference panel", async ({ page }) => {
		await page.getByRole("button", { name: "Manage Cookies" }).click();
		await expect(page.getByText("Cookie preferences")).toBeVisible();
	});

	test("preference panel Save closes the panel", async ({ page }) => {
		await page.getByRole("button", { name: "Manage Cookies" }).click();
		// Toggle analytics off (it is on by default for this config)
		await page.getByRole("switch").nth(1).click();
		await page.getByRole("button", { name: "Save preferences" }).click();
		await expect(page.getByText("Cookie preferences")).not.toBeVisible();
		await expect(page.getByTestId("consent-status")).toHaveText("completed");
	});

	test("closing preferences panel via X keeps the banner visible", async ({ page }) => {
		await page.getByRole("button", { name: "Manage Cookies" }).click();
		await expect(page.getByText("Cookie preferences")).toBeVisible();
		await page.getByRole("button", { name: "Close" }).click();
		await expect(page.getByText("Cookie preferences")).not.toBeVisible();
		await expect(page.getByText("We value your privacy")).toBeVisible();
		await expect(page.getByTestId("consent-status")).toHaveText("undecided");
	});

	test("Reset shows the banner again", async ({ page }) => {
		await page.getByRole("button", { name: "Accept All" }).click();
		await expect(page.getByTestId("consent-status")).toHaveText("completed");
		await page.getByTestId("reset-consent").click();
		await expect(page.getByText("We value your privacy")).toBeVisible();
	});

	test("consent status persists after page reload", async ({ page }) => {
		await page.getByRole("button", { name: "Accept All" }).click();
		await expect(page.getByTestId("consent-status")).toHaveText("completed");
		await page.reload();
		await expect(page.getByTestId("consent-status")).toHaveText("completed");
		await expect(page.getByText("We value your privacy")).not.toBeVisible();
	});
});

const ROUTES = ["/tailwind", "/shadcn", "/css-vars"];

for (const route of ROUTES) {
	test.describe(`${route}`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(route);
		});

		test("renders both policy documents", async ({ page }) => {
			await expect(page.locator("[data-op-policy]")).toHaveCount(2);
		});

		test("privacy policy renders key sections", async ({ page }) => {
			await expect(page.getByRole("heading", { name: "Introduction" })).toBeVisible();
			await expect(page.getByRole("heading", { name: "Information We Collect" })).toBeVisible();
			await expect(page.getByRole("heading", { name: "Your Rights" })).toBeVisible();
		});

		test("cookie policy renders key sections", async ({ page }) => {
			await expect(page.getByText("What Are Cookies?")).toBeVisible();
			await expect(page.getByText("Types of Cookies We Use")).toBeVisible();
			await expect(page.getByRole("heading", { name: "Managing Cookies" })).toBeVisible();
		});

		test("policies contain company name", async ({ page }) => {
			const policies = page.locator("[data-op-policy]");
			for (const policy of await policies.all()) {
				await expect(policy).toContainText("Acme");
			}
		});
	});
}

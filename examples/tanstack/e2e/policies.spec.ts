import { expect, test } from "@playwright/test";

// ─── Cookie Banner route ──────────────────────────────────────────────────────

test.describe("/cookie-banner", () => {
	test.beforeEach(async ({ page }) => {
		// Clear the consent cookie before each test so the banner is always shown.
		await page.goto("/cookie-banner");
		await page.evaluate(() => {
			document.cookie = "op_consent=; max-age=0; path=/; SameSite=Lax";
		});
		await page.reload();
	});

	test("banner is visible on first visit", async ({ page }) => {
		await expect(page.locator("[data-op-cookie-banner-root]")).toHaveAttribute(
			"data-state",
			"open",
		);
	});

	test("Accept All closes the banner and shows accepted status", async ({
		page,
	}) => {
		await page.locator("[data-op-cookie-banner-accept]").click();
		await expect(page.locator("[data-op-cookie-banner-root]")).toHaveAttribute(
			"data-state",
			"closed",
		);
		await expect(page.getByTestId("consent-status")).toHaveText("accepted");
	});

	test("Necessary Only closes the banner and shows rejected status", async ({
		page,
	}) => {
		await page.locator("[data-op-cookie-banner-reject]").click();
		await expect(page.locator("[data-op-cookie-banner-root]")).toHaveAttribute(
			"data-state",
			"closed",
		);
		await expect(page.getByTestId("consent-status")).toHaveText("rejected");
	});

	test("Manage Cookies opens the preference panel", async ({ page }) => {
		await page.locator("[data-op-cookie-banner-customize]").click();
		await expect(
			page.locator("[data-op-cookie-preferences-root]"),
		).toHaveAttribute("data-state", "open");
	});

	test("preference panel Save sets status to custom", async ({ page }) => {
		await page.locator("[data-op-cookie-banner-customize]").click();
		// Toggle analytics off (it is on by default for this config)
		await page
			.locator("[data-op-cookie-preferences-root] input[type=checkbox]")
			.nth(1)
			.click();
		await page.locator("[data-op-cookie-preferences-save]").click();
		await expect(
			page.locator("[data-op-cookie-preferences-root]"),
		).toHaveAttribute("data-state", "closed");
		await expect(page.getByTestId("consent-status")).toHaveText("custom");
	});

	test("Reset shows the banner again", async ({ page }) => {
		await page.locator("[data-op-cookie-banner-accept]").click();
		await expect(page.getByTestId("consent-status")).toHaveText("accepted");
		await page.getByTestId("reset-consent").click();
		await expect(page.locator("[data-op-cookie-banner-root]")).toHaveAttribute(
			"data-state",
			"open",
		);
	});
});

const ROUTES = ["/tailwind", "/shadcn", "/css-vars"];

for (const route of ROUTES) {
	test.describe(`${route}`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(route);
		});

		test("renders all three policy documents", async ({ page }) => {
			await expect(page.locator("[data-op-policy]")).toHaveCount(3);
		});

		test("privacy policy renders key sections", async ({ page }) => {
			await expect(page.getByText("Introduction")).toBeVisible();
			await expect(page.getByText("Information We Collect")).toBeVisible();
			await expect(page.getByText("Your Rights")).toBeVisible();
		});

		test("terms of service renders key sections", async ({ page }) => {
			await expect(page.getByText("Acceptance of Terms")).toBeVisible();
			await expect(page.getByText("Eligibility")).toBeVisible();
			await expect(page.getByText("Limitation of Liability")).toBeVisible();
		});

		test("cookie policy renders key sections", async ({ page }) => {
			await expect(page.getByText("What Are Cookies?")).toBeVisible();
			await expect(page.getByText("Types of Cookies We Use")).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Managing Cookies" }),
			).toBeVisible();
		});

		test("policies contain company name", async ({ page }) => {
			const policies = page.locator("[data-op-policy]");
			for (const policy of await policies.all()) {
				await expect(policy).toContainText("Acme");
			}
		});
	});
}

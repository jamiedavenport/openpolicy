import { expect, test } from "@playwright/test";

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

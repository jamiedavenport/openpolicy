import {
	CookieBanner,
	CookiePolicy,
	CookiePreferencePanel,
	OpenPolicy,
	PrivacyPolicy,
	TermsOfService,
	useCookieConsent,
} from "@openpolicy/vue";
import { createApp, defineComponent, h, ref } from "vue";
import {
	createRouter,
	createWebHistory,
	RouterLink,
	RouterView,
} from "vue-router";
import openpolicy from "../openpolicy";
import "./styles.css";

const nav = () =>
	h("nav", { class: "nav" }, [
		h(RouterLink, { to: "/" }, () => "Home"),
		h(RouterLink, { to: "/privacy" }, () => "Privacy"),
		h(RouterLink, { to: "/terms" }, () => "Terms"),
		h(RouterLink, { to: "/cookie" }, () => "Cookie"),
		h(RouterLink, { to: "/cookie-banner" }, () => "Cookie Banner"),
	]);

const HomePage = defineComponent({
	name: "HomePage",
	render() {
		return h("main", { class: "page" }, [
			h("header", [
				h("h1", "OpenPolicy Vue Example"),
				h("p", [
					"Runtime policy rendering with ",
					h("code", "@openpolicy/vue"),
					".",
				]),
			]),
			nav(),
			h("section", { class: "card" }, [
				h(
					"p",
					"This example uses a shared OpenPolicy config and renders each policy as a route.",
				),
			]),
		]);
	},
});

const PrivacyPage = defineComponent({
	name: "PrivacyPage",
	render() {
		return h("main", { class: "page" }, [
			nav(),
			h(OpenPolicy, { config: openpolicy }, () => h(PrivacyPolicy)),
		]);
	},
});

const TermsPage = defineComponent({
	name: "TermsPage",
	render() {
		return h("main", { class: "page" }, [
			nav(),
			h(OpenPolicy, { config: openpolicy }, () => h(TermsOfService)),
		]);
	},
});

const CookiePage = defineComponent({
	name: "CookiePage",
	render() {
		return h("main", { class: "page" }, [
			nav(),
			h(OpenPolicy, { config: openpolicy }, () => h(CookiePolicy)),
		]);
	},
});

const CookieBannerPage = defineComponent({
	name: "CookieBannerPage",
	setup() {
		const showPreferences = ref(false);
		const { consent, status, reset } = useCookieConsent();

		return () =>
			h("main", { class: "page" }, [
				nav(),
				h(OpenPolicy, { config: openpolicy }, () => [
					h("h2", "Cookie Banner Example"),
					h("div", { class: "card" }, [
						h("p", `Status: ${status.value}`),
						consent.value && h("pre", JSON.stringify(consent.value, null, 2)),
						status.value !== "undecided" &&
							h("button", { onClick: reset }, "Reset consent"),
					]),
					h(CookieBanner, {
						onCustomize: () => {
							showPreferences.value = true;
						},
					}),
					h(CookiePreferencePanel, {
						open: showPreferences.value,
						onClose: () => {
							showPreferences.value = false;
						},
					}),
				]),
			]);
	},
});

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: HomePage },
		{ path: "/privacy", component: PrivacyPage },
		{ path: "/terms", component: TermsPage },
		{ path: "/cookie", component: CookiePage },
		{ path: "/cookie-banner", component: CookieBannerPage },
	],
});

createApp(
	defineComponent({
		name: "RootApp",
		render() {
			return h(RouterView);
		},
	}),
)
	.use(router)
	.mount("#app");

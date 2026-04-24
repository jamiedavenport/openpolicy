import { CookiePolicy, OpenPolicy, PrivacyPolicy } from "@openpolicy/vue";
import { createApp, defineComponent, h } from "vue";
import { createRouter, createWebHistory, RouterLink, RouterView } from "vue-router";
import openpolicy from "../openpolicy";
import "./styles.css";

const nav = () =>
	h("nav", { class: "nav" }, [
		h(RouterLink, { to: "/" }, () => "Home"),
		h(RouterLink, { to: "/privacy" }, () => "Privacy"),
		h(RouterLink, { to: "/cookie" }, () => "Cookie"),
	]);

const HomePage = defineComponent({
	name: "HomePage",
	render() {
		return h("main", { class: "page" }, [
			h("header", [
				h("h1", "OpenPolicy Vue Example"),
				h("p", ["Runtime policy rendering with ", h("code", "@openpolicy/vue"), "."]),
			]),
			nav(),
			h("section", { class: "card" }, [
				h("p", "This example uses a shared OpenPolicy config and renders each policy as a route."),
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

const CookiePage = defineComponent({
	name: "CookiePage",
	render() {
		return h("main", { class: "page" }, [
			nav(),
			h(OpenPolicy, { config: openpolicy }, () => h(CookiePolicy)),
		]);
	},
});

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: HomePage },
		{ path: "/privacy", component: PrivacyPage },
		{ path: "/cookie", component: CookiePage },
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

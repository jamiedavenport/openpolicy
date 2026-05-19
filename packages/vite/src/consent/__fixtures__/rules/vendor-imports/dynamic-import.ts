async function load() {
  const mod = await import("mixpanel-browser");
  mod.default.init("token");
}
void load();

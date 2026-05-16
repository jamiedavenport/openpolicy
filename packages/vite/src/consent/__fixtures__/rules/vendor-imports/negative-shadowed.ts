function gtag(_event: string): void {
  // local helper, not the GA global
}
gtag("ignored");

const fbq = (..._args: unknown[]) => {};
fbq("track", "PageView");

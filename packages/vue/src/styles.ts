export const defaultStyles = `
.op-policy {
  --op-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --op-font-size-body: 1rem;
  --op-font-size-heading: 1.125rem;
  --op-font-weight-heading: 600;
  --op-line-height: 1.7;
  --op-body-color: #374151;
  --op-heading-color: #111827;
  --op-link-color: #2563eb;
  --op-link-color-hover: #1d4ed8;
  --op-section-gap: 2rem;
  --op-border-color: #e5e7eb;
  --op-border-radius: 0.375rem;

  font-family: var(--op-font-family);
  font-size: var(--op-font-size-body);
  color: var(--op-body-color);
  line-height: var(--op-line-height);
  max-width: 65ch;
}

.op-section {
  margin-bottom: var(--op-section-gap);
  padding-bottom: var(--op-section-gap);
  border-bottom: 1px solid var(--op-border-color);
}
.op-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.op-heading {
  font-size: var(--op-font-size-heading);
  font-weight: var(--op-font-weight-heading);
  color: var(--op-heading-color);
  line-height: 1.3;
  margin: 0 0 0.75rem;
}

.op-paragraph {
  margin: 0 0 0.75rem;
}
.op-paragraph:last-child { margin-bottom: 0; }

.op-list {
  margin: 0 0 0.75rem;
  padding-left: 1.5rem;
  list-style-type: disc;
}
.op-list:last-child { margin-bottom: 0; }
.op-list .op-list {
  margin-top: 0.375rem;
  margin-bottom: 0;
  list-style-type: circle;
}

.op-list-item {
  margin-bottom: 0.375rem;
}
.op-list-item:last-child { margin-bottom: 0; }

.op-bold {
  font-weight: 600;
  color: var(--op-heading-color);
}

.op-link {
  color: var(--op-link-color);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.op-link:hover { color: var(--op-link-color-hover); }
`;

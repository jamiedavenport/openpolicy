export function Gated() {
  return (
    <ConsentGate purpose="analytics">
      {(() => {
        gtag("event", "page_view");
        return null;
      })()}
    </ConsentGate>
  );
}

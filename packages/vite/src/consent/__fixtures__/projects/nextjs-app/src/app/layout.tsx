import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Script id="ga" src="https://www.googletagmanager.com/gtag/js?id=G-XYZ" />
      </head>
      <body>
        <ConsentGate purpose="analytics">
          <GtagInit />
        </ConsentGate>
        {children}
      </body>
    </html>
  );
}

function GtagInit() {
  gtag("config", "G-XYZ");
  return null;
}

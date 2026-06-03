import './globals.css'; // This will now load perfectly as an empty file

export const metadata = {
  title: 'Producer Saab | Elite Music Creator Workspace',
  description: 'Access your workstation suite and connect with sound producers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, backgroundColor: '#FAF8F5' }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#FAF8F5',
          color: '#111111',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          minHeight: '100vh',
          width: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </body>
    </html>
  );
}

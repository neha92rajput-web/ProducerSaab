import './globals.css';

export const metadata = {
  title: 'Producer Saab | Elite Music Creator Workspace',
  description: 'Access your workstation studio suite and connect with music producers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ backgroundColor: '#FAF8F5', margin: 0, padding: 0 }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#FAF8F5',
          color: '#111111',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
          width: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </body>
    </html>
  );
}

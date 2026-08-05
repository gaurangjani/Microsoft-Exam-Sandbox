import Script from 'next/script';
import './globals.css';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';

export const metadata = {
  title: 'Microsoft Certification Exam Simulator',
  description: 'Practice Microsoft certification exams with live content from Microsoft Learn',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="90" fill="%230078D4">📝</text></svg>',
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0, padding: 0 }}>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeToggle />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

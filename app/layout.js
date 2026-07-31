import './globals.css';
import ThemeToggle from './components/ThemeToggle';

export const metadata = {
  title: 'Microsoft Certification Exam Simulator',
  description: 'Practice Microsoft certification exams with live content from Microsoft Learn',
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}

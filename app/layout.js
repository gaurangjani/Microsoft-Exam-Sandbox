export const metadata = {
  title: 'Microsoft Certification Exam Simulator',
  description: 'Practice Microsoft certification exams with live content from Microsoft Learn',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

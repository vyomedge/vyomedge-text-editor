import './globals.css'
export const metadata = { title: 'Rich Text Editor', description: 'WYSIWYG Editor' }
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>
}

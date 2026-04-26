import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 overflow-auto">{children}</main>
    </div>
  );
}

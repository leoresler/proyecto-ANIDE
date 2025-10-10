import Header from '@/Components/Header/Header';
// import Footer from '@/Components/Footer';

export default function AuthenticatedLayout({ header, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      {header && (
        <div className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {header}
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Inicio() {
  return (
    <AuthenticatedLayout header={<h1 className="text-2xl font-semibold">Panel</h1>}>
      <div>
        <p>publicaciones...</p>
      </div>
    </AuthenticatedLayout>
  );
}

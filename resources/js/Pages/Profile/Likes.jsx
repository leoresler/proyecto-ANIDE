import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { User, Heart, FileText, BookOpen, Building2 } from "lucide-react";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

export default function Likes({ auth, likedPublicaciones = [], links = [] }) {
    const esInstitucion = auth.user?.tipo_usuario === "institucion";

    const nextPageUrl = links?.find((link) => link.label === "&raquo;")?.url;
    const { loaderRef, isLoading } = useInfiniteScroll({ nextPageUrl });

    const NavButton = ({ href, icon: Icon, label, isActive }) => (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                    ? "bg-edu-dark text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </Link>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            showRecomendaciones={true}
            header={
                <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 px-1">
                        <NavButton
                            href="/profile"
                            icon={User}
                            label="Mi Perfil"
                            isActive={false}
                        />
                        <NavButton
                            href="/likes"
                            icon={Heart}
                            label="Me Gusta"
                            isActive={true}
                        />
                        {esInstitucion && (
                            <>
                                <Link
                                    href="/publicaciones/misPublicaciones"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span>
                                        Mis Publicaciones
                                    </span>
                                </Link>
                                <Link
                                    href="/material"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    <span>
                                        Cursos y Carreras
                                    </span>
                                </Link>
                                <Link
                                    href={`/instituciones/${auth.user?.institucion.id}`}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Building2 className="w-5 h-5" />
                                    <span>Perfil Público</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Me Gusta" />

            <div className="py-4">
                <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Heart className="w-6 h-6 text-edu-dark dark:text-gray-200" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                                Publicaciones que te gustaron
                            </h3>
                        </div>

                        {likedPublicaciones.length > 0 ? (
                            <>
                                <div className="space-y-6">
                                    {likedPublicaciones.map((publicacion) => (
                                        <PublicacionCard
                                            key={publicacion.id}
                                            publicacion={publicacion}
                                            userType={auth.user.tipo_usuario}
                                            disableModal={true}
                                            disableFavorite={true}
                                        />
                                    ))}
                                </div>

                                {/* Loader para scroll infinito */}
                                {nextPageUrl && (
                                    <div ref={loaderRef}>
                                        {isLoading && <LoadingSpinner />}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-gray-200" />
                                <p className="text-gray-500 text-lg dark:text-gray-200">
                                    Aún no has dado "Me gusta" a ninguna
                                    publicación
                                </p>
                                <p className="text-gray-400 text-sm mt-2 dark:text-gray-200">
                                    Explora el feed y marca tus publicaciones
                                    favoritas
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

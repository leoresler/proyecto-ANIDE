import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';

export default function Index({ publicaciones, auth }) {
  const [processingLike, setProcessingLike] = useState({});
  const [processingFavorito, setProcessingFavorito] = useState({});

  const handleLike = (publicacionId) => {
    setProcessingLike(prev => ({ ...prev, [publicacionId]: true }));
    
    router.post('/likes/toggle', {
      target_id: publicacionId,
      target_tipo: 'App\\Models\\Publicacion'
    }, {
      preserveScroll: true,
      onFinish: () => {
        setProcessingLike(prev => ({ ...prev, [publicacionId]: false }));
      }
    });
  };

  const handleFavorito = (publicacionId) => {
    setProcessingFavorito(prev => ({ ...prev, [publicacionId]: true }));
    
    router.post('/favoritos/toggle', {
      publicacion_id: publicacionId
    }, {
      preserveScroll: true,
      onFinish: () => {
        setProcessingFavorito(prev => ({ ...prev, [publicacionId]: false }));
      }
    });
  };

  const isPersona = auth.user?.tipo_usuario === 'persona';
  const isInstitucion = auth.user?.tipo_usuario === 'institucion';

  return (
    <>
      <Head title="Publicaciones" />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Publicaciones</h1>
            
            {isInstitucion && (
              <Link
                href="/mis-publicaciones"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Mis Publicaciones
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {publicaciones.data.map((publicacion) => {
              const likesCount = publicacion.likes?.length || 0;
              const comentariosCount = publicacion.comentarios?.length || 0;
              const userLiked = isPersona && publicacion.likes?.some(
                like => like.perf_persona_id === auth.user.persona?.id
              );
              const userFavorito = isPersona && publicacion.favoritos?.some(
                fav => fav.perf_persona_id === auth.user.persona?.id
              );

              return (
                <div key={publicacion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <img
                        src={publicacion.institucion?.user?.profile_photo_url}
                        alt={publicacion.institucion?.user?.nombre}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {publicacion.institucion?.user?.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(publicacion.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {publicacion.titulo}
                    </h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {publicacion.contenido}
                    </p>

                    {/* Media */}
                    {publicacion.media && publicacion.media.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {publicacion.media.map((media) => (
                          <div key={media.id} className="relative">
                            {media.tipo === 'imagen' && (
                              <img
                                src={media.url_publica}
                                alt="Media"
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            )}
                            {media.tipo === 'video' && (
                              <video
                                src={media.url_publica}
                                controls
                                className="w-full h-64 rounded-lg"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => isPersona && handleLike(publicacion.id)}
                        disabled={!isPersona || processingLike[publicacion.id]}
                        className={`flex items-center space-x-2 transition ${
                          isPersona ? 'hover:text-red-600' : 'cursor-not-allowed opacity-50'
                        } ${userLiked ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        <Heart className={userLiked ? 'fill-current' : ''} size={20} />
                        <span>{likesCount}</span>
                      </button>

                      <Link
                        href={`/publicaciones/${publicacion.id}`}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
                      >
                        <MessageCircle size={20} />
                        <span>{comentariosCount}</span>
                      </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => isPersona && handleFavorito(publicacion.id)}
                        disabled={!isPersona || processingFavorito[publicacion.id]}
                        className={`transition ${
                          isPersona ? 'hover:text-yellow-600' : 'cursor-not-allowed opacity-50'
                        } ${userFavorito ? 'text-yellow-600' : 'text-gray-600'}`}
                      >
                        <Bookmark className={userFavorito ? 'fill-current' : ''} size={20} />
                      </button>

                      <button className="text-gray-600 hover:text-gray-900 transition">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {publicaciones.links && (
            <div className="mt-8 flex justify-center space-x-2">
              {publicaciones.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-4 py-2 rounded ${
                    link.active
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
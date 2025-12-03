import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import AddressValidation from "@/Components/CompletarDatos/AddressValidation";

export default function InstitucionFormFields({
    data,
    errors,
    clientErrors,
    onDataChange,
    onFieldValidation,
    clearFieldError,
    validandoDireccion,
    direccionValida,
    onValidarDireccion,
    setDireccionValida,
    mensajeValidacion,
    setMensajeValidacion,
    esAproximado,
    setEsAproximado,
}) {
    return (
        <>
            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Nombre de la institución *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.nombre}
                    onChange={(e) => {
                        onDataChange("nombre", e.target.value);
                        clearFieldError("nombre");
                    }}
                    onBlur={(e) => onFieldValidation("nombre", e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.nombre || errors.nombre) && (
                    <InputError
                        message={clientErrors.nombre || errors.nombre}
                        className="mt-1"
                    />
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Tipo de institución *
                </InputLabel>
                <select
                    value={data.tipo_institucion}
                    onChange={(e) => {
                        onDataChange("tipo_institucion", e.target.value);
                        clearFieldError("tipo_institucion");
                    }}
                    onBlur={(e) =>
                        onFieldValidation("tipo_institucion", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                >
                    <option value="">Seleccionar tipo...</option>
                    <option value="Universidad">Universidad</option>
                    <option value="Instituto Terciario">
                        Instituto Terciario
                    </option>
                    <option value="Establecimiento de educación superior">
                        Establecimiento de educación superior
                    </option>
                    <option value="Otro">Otro</option>
                </select>
                {(clientErrors.tipo_institucion || errors.tipo_institucion) && (
                    <InputError
                        message={
                            clientErrors.tipo_institucion ||
                            errors.tipo_institucion
                        }
                        className="mt-1"
                    />
                )}

                {data.tipo_institucion === "Otro" && (
                    <div className="mt-3">
                        <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                            Especificar tipo de institución *
                        </InputLabel>
                        <TextInput
                            type="text"
                            value={data.tipo_institucion_otro || ""}
                            onChange={(e) => {
                                onDataChange(
                                    "tipo_institucion_otro",
                                    e.target.value
                                );
                                clearFieldError("tipo_institucion_otro");
                            }}
                            onBlur={(e) =>
                                onFieldValidation(
                                    "tipo_institucion_otro",
                                    e.target.value
                                )
                            }
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                            placeholder="Ej: Instituto técnico, Centro de formación..."
                        />
                        {(clientErrors.tipo_institucion_otro ||
                            errors.tipo_institucion_otro) && (
                            <InputError
                                message={
                                    clientErrors.tipo_institucion_otro ||
                                    errors.tipo_institucion_otro
                                }
                                className="mt-1"
                            />
                        )}
                    </div>
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Teléfono *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.telefono}
                    onChange={(e) => {
                        onDataChange("telefono", e.target.value);
                        clearFieldError("telefono");
                    }}
                    onBlur={(e) =>
                        onFieldValidation("telefono", e.target.value)
                    }
                    placeholder="Ej: 299 123 4567"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.telefono || errors.telefono) && (
                    <InputError
                        message={clientErrors.telefono || errors.telefono}
                        className="mt-1"
                    />
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-gray-200 dark:border-blue-800">
                <h3 className="font-semibold mb-3 dark:text-gray-200">
                    Documento Identificador *
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Proporciona un documento que te identifique (CUIT, CUIL, DNI
                    del responsable)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-300">
                            Tipo de documento *
                        </label>
                        <select
                            value={data.tipo_documento}
                            onChange={(e) => {
                                onDataChange("tipo_documento", e.target.value);
                                clearFieldError("doc_identificador");
                            }}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                        >
                            <option value="CUIT">CUIT</option>
                            <option value="CUIL">CUIL</option>
                            <option value="DNI">DNI (Responsable)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-300">
                            Número *
                        </label>
                        <input
                            type="text"
                            value={data.doc_identificador}
                            onChange={(e) => {
                                onDataChange(
                                    "doc_identificador",
                                    e.target.value
                                );
                                clearFieldError("doc_identificador");
                            }}
                            onBlur={(e) =>
                                onFieldValidation(
                                    "doc_identificador",
                                    e.target.value,
                                    data.tipo_documento
                                )
                            }
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                            placeholder={
                                data.tipo_documento === "DNI"
                                    ? "Ej: 12345678"
                                    : "Ej: 20-12345678-9"
                            }
                        />
                        {(clientErrors.doc_identificador ||
                            errors.doc_identificador) && (
                            <InputError
                                message={
                                    clientErrors.doc_identificador ||
                                    errors.doc_identificador
                                }
                                className="mt-1"
                            />
                        )}
                    </div>
                </div>
            </div>

            <AddressValidation
                ciudad={data.ciudad}
                direccion={data.direccion}
                onCiudadChange={(e) => {
                    onDataChange("ciudad", e.target.value);
                    setDireccionValida(null);
                    setMensajeValidacion("");
                    setEsAproximado(false);
                }}
                onDireccionChange={(e) => {
                    onDataChange("direccion", e.target.value);
                    setDireccionValida(null);
                    setMensajeValidacion("");
                    setEsAproximado(false);
                    clearFieldError("direccion");
                }}
                onValidate={onValidarDireccion}
                validandoDireccion={validandoDireccion}
                direccionValida={direccionValida}
                errors={clientErrors.direccion || errors.direccion}
                mensajeValidacion={mensajeValidacion}
                esAproximado={esAproximado}
            />
        </>
    );
}

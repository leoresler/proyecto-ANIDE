import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { useValidation } from "@/utils/validaciones";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    // validaciones basicas en la vista, en conjunto con @/utils/validaciones
    const { validateField } = useValidation();
    const [clientErrors, setClientErrors] = useState({});

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setData("email", value);

        const error = validateField("email", value);
        setClientErrors((prev) => ({
            ...prev,
            email: error,
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        const emailError = validateField("email", data.email);
        if (emailError) {
            setClientErrors({ email: emailError });
            return;
        }

        setClientErrors({});

        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <Head title="Restablecer contraseña" />

            <div className="w-full max-w-sm sm:max-w-md p-4 sm:p-8 mt-4">
                <div className="mb-6 text-center text-md text-gray-800 font-semibold">
                    Ingrese su direccion de correo electrónico y le enviaremos
                    un enlace para reestablecer su contraseña.
                </div>

                <form
                    onSubmit={submit}
                    noValidate
                    className="flex flex-col sm:flex-row sm:items-start sm:gap-3 justify-center"
                >
                    <div className="flex-1">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full"
                            isFocused={true}
                            onChange={handleEmailChange}
                        />

                        <InputError
                            message={
                                clientErrors.email ||
                                (errors.email && "Error del servidor")
                            }
                            className="mt-2 mb-2"
                        />
                    </div>

                    <PrimaryButton
                        className="mt-4 sm:mt-0 px-6 w-full sm:w-auto justify-center"
                        disabled={processing}
                    >
                        Enviar
                    </PrimaryButton>
                </form>

                {status && (
                    <div className="mt-6 text-center text-sm font-semibold text-green-600">
                        {status === "We have emailed your password reset link."
                            ? "Te hemos enviado un enlace para restablecer tu contraseña por correo electrónico."
                            : status}
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <Link
                        href={"login"}
                        className="rounded-3xl border border-transparent bg-edu-dark px-20 py-4 mt-6 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        Volver
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}

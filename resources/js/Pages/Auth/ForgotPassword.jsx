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

            <div className="flex flex-col items-center justify-center w-full max-w">
                <div className="mb-4 text-md text-black font-semibold">
                    Ingrese su direccion de correo electrónico y le enviaremos
                    un enlace para reestablecer su contraseña.
                </div>

                <div className="flex flex-row justify-cente">
                    <form onSubmit={submit} noValidate>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-2 w-72"
                            isFocused={true}
                            onChange={handleEmailChange}
                        />

                        <PrimaryButton
                            className="mt-2 ml-4 px-8"
                            disabled={processing}
                        >
                            Enviar
                        </PrimaryButton>

                        <InputError
                            message={
                                clientErrors.email ||
                                (errors.email && "Error del servidor")
                            }
                            className="mt-2"
                        />
                    </form>
                </div>

                {status && (
                    <div className="mt-4 text-sm font-semibold text-green-200">
                        {status === "We have emailed your password reset link."
                            ? "Te hemos enviado un enlace para restablecer tu contraseña por correo electrónico."
                            : status}
                    </div>
                )}

                <Link
                    href={"login"}
                    className="rounded-3xl border border-transparent bg-edu-dark px-20 py-4 mt-6 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                >
                    Volver
                </Link>
            </div>
        </GuestLayout>
    );
}

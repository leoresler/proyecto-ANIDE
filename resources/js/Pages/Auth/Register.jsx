import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { useValidation } from "@/utils/validaciones";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        password_confirmation: "",
    });

    /* validaciones basicas en la vista, en conjunto con @/utils/validaciones */
    const { validateField } = useValidation();
    const [clientErrors, setClientErrors] = useState({});

    const isFormValid =
        data.email.trim() !== "" &&
        data.password.trim() !== "" &&
        data.password_confirmation.trim() !== "";

    // errores de registro en el servidor
    const hasServerError =
        errors.email ||
        errors.password ||
        errors.password_confirmation;


    const handleEmailChange = (e) => {
        const value = e.target.value;
        setData("email", value);

        if (clientErrors.email && value.trim() !== "") {
            setClientErrors((prev) => ({
                ...prev,
                email: null,
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setData("password", value);

        if (clientErrors.password && value.trim() !== "") {
            setClientErrors((prev) => ({
                ...prev,
                password: null,
            }));
        }
    };

    const handlePasswordConfirmationChange = (e) => {
        const value = e.target.value;
        setData("password_confirmation", value);

        if (clientErrors.password_confirmation && value.trim() !== "") {
            setClientErrors((prev) => ({
                ...prev,
                password_confirmation: null,
            }));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // se validan todos los campos antes de enviar
        const emailError = validateField("email", data.email);
        const passwordError = validateField("password", data.password);
        const passwordConfirmationError = validateField(
            "confirmPassword",
            data.password_confirmation,
            data.password
        );

        if (
            emailError ||
            passwordError ||
            passwordConfirmationError
        ) {
            setClientErrors({
                email: emailError,
                password: passwordError,
                password_confirmation: passwordConfirmationError,
            });
            return;
        }

        setClientErrors({});

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} noValidate>
                <div>
                    <InputLabel htmlFor="email" value="Correo electronico" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full pl-5 pr-10"
                        placeholder="Ingresá tu correo electrónico"
                        autoComplete="username"
                        onChange={handleEmailChange}
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        placeholder="Ingresá tu contraseña"
                        autoComplete="new-password"
                        onChange={handlePasswordChange}
                    />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Contraseña"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        placeholder="Confirmar contraseña"
                        autoComplete="new-password"
                        onChange={handlePasswordConfirmationChange}
                    />
                </div>

                {/* mostrar errores */}
                {(clientErrors.email || clientErrors.password || clientErrors.password_confirmation) && (
                        <div className="mt-6 flex justify-center">
                            <InputError
                                message={clientErrors.email || clientErrors.password || clientErrors.password_confirmation}
                                className="text-center font-semibold "
                            />
                        </div>
                    )}

                    {hasServerError && !clientErrors.email && !clientErrors.password && !clientErrors.password_confirmation && (
                        <div className="mt-6 flex justify-center">
                            <InputError
                                message={"Error en el registro. Verifica los datos ingresados."}
                                className="text-center font-semibold "
                            />
                        </div>
                    )}

                <div className="mt-6 flex items-center justify-end">
                    <Link
                        href={route("login")}
                        className="rounded-md text-sm font-bold text-gray-700 hover:text-black focus:outline-none"
                    >
                        ¿Ya estas registrado?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing || !isFormValid}>
                        Registrarse
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}

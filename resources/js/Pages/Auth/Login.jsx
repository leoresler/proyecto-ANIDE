import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { useValidation } from "@/utils/validaciones";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // validaciones basicas en la vista, en conjunto con @/utils/validaciones
    const { validateField } = useValidation();
    const [clientErrors, setClientErrors] = useState({});

    const isFormValid = data.email.trim() !== "" && data.password.trim() !== "";

    const hasAuthError = errors.email || errors.password;

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

    const submit = (e) => {
        e.preventDefault();

        // se validan todos los campos antes de enviar
        const emailError = validateField("email", data.email);
        const passwordError = validateField("password", data.password);
        
        if (emailError || passwordError) {
            setClientErrors({ 
                email: emailError, 
                password: passwordError 
            });
            return;
        }

        setClientErrors({});

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="w-full max-w-md px-6 py-8">
                <h2 className="text-center text-2xl font-bold text-black mb-6">
                    ¡Bienvenido de nuevo!
                </h2>

                <form onSubmit={submit} noValidate>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <img
                                src="/svg/user-icon.svg"
                                alt="Usuario"
                                className="h-6 w-6"
                            />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full pl-5 pr-10"
                            placeholder="Ingresá tu correo electrónico"
                            autoComplete="username"
                            isFocused={true}
                            onChange={handleEmailChange}
                        />
                    </div>

                    <div className="mt-10 relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <img
                                src={
                                    showPassword
                                        ? "/svg/eye-on.svg"
                                        : "/svg/eye-off.svg"
                                }
                                alt={
                                    showPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                                onClick={togglePasswordVisibility}
                            />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-5 pr-10"
                            autoComplete="current-password"
                            placeholder="Ingresá tu contraseña"
                            onChange={handlePasswordChange}
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-8">
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="rounded-md text-sm font-bold text-gray-700 hover:text-black focus:outline-none"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                        <Link
                            href={route("register")}
                            className="rounded-md text-sm font-bold text-gray-700 hover:text-black focus:outline-none"
                        >
                            ¿No tenes cuenta?
                        </Link>
                    </div>
                    
                    {/* mostrar errores */}
                    {(clientErrors.email || clientErrors.password) && (
                        <div className="mt-6 flex justify-center">
                            <InputError
                                message={clientErrors.email || clientErrors.password}
                                className="text-center font-semibold"
                            />
                        </div>
                    )}

                    {hasAuthError && !clientErrors.email && !clientErrors.password && (
                        <div className="mt-6 flex justify-center">
                            <InputError
                                message={"Credenciales incorrectas"}
                                className="text-center font-semibold"
                            />
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center mt-8 gap-4">
                        <PrimaryButton
                            className=""
                            disabled={processing || !isFormValid}
                        >
                            Iniciar sesión
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}

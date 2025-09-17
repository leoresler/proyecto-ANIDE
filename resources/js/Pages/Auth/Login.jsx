import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";


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

    const submit = (e) => {
        e.preventDefault();

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

                <form onSubmit={submit}>
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
                            className="mt-1 block w-full"
                            placeholder="Ingresá tu usuario"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
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
                            className="mt-1 block w-full pl-10"
                            autoComplete="current-password"
                            placeholder="Ingresá tu contraseña"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    {/* <div className="mt-4 block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-800">
                                    Recuerdame
                                </span>
                            </label>
                        </div> */}

                    <div className="mt-4 flex items-center justify-center">
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="rounded-md text-sm font-bold text-gray-700 hover:text-black focus:outline-none"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center justify-center">
                        <PrimaryButton className="mt-8" disabled={processing}>
                            Iniciar sesión
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}

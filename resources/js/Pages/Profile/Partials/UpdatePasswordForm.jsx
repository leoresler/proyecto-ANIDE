import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { useRef } from "react";
import { toast } from "react-hot-toast";

export default function UpdatePasswordForm({ className = "", onCancel }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();
        const toastId = toast.loading("Actualizando contraseña...");

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(toastId);
                toast.success("Contraseña se actualizada correctamente.");
            },
            onError: () => {
                toast.dismiss(toastId);
                toast.error("Hubo un error al actualizar la contraseña.");
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const handleCancel = () => {
        reset();
        if (onCancel) onCancel();
    };

    return (
        <section className={`${className} w-full`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Actualizar contraseña</h2>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="current_password" value="Contraseña actual" />
                        <TextInput id="current_password" ref={currentPasswordInput} value={data.current_password} onChange={(e) => setData("current_password", e.target.value)} type="password" className="mt-1 block w-full" autoComplete="current-password" />
                        <InputError message={errors.current_password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Nueva contraseña" />
                        <TextInput id="password" ref={passwordInput} value={data.password} onChange={(e) => setData("password", e.target.value)} type="password" className="mt-1 block w-full" autoComplete="new-password" />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                    <TextInput id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} type="password" className="mt-1 block w-full" autoComplete="new-password" />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <PrimaryButton type="submit" disabled={processing} className="w-full sm:w-auto">Guardar</PrimaryButton>
                    <SecondaryButton type="button" onClick={handleCancel} className="w-full sm:w-auto">Cancelar</SecondaryButton>

                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-gray-600">Actualizada.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import BarraBusqueda from "../BarraBusqueda/BarraBusqueda";
import NavLink from "../NavLink";

export default function Header() {
    const user = usePage().props.auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="bg-[#243746] text-white">
            <nav className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="inicio" className="flex items-center">
                        <img
                            src="/images/logo-navbar-eduquen.webp"
                            alt="EDUQUÉN"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* links para desktop*/}
                    <div className="hidden md:flex items-center space-x-8 gap-2">
                        <NavLink
                            href={route("inicio")}
                            active={route().current("inicio")}
                        >
                            <img
                                src="/svg/header/home1.svg"
                                alt="Inicio"
                                className="h-6 w-6"
                            />
                        </NavLink>
                        <NavLink
                            href={route("comunidad.index")}
                            active={route().current("comunidad.index")}
                        >
                            <img
                                src="/svg/header/users1.svg"
                                alt="Comunidad"
                                className="h-6 w-6"
                            />
                        </NavLink>
                        <NavLink
                            href={route("videos.index")}
                            active={route().current("videos.index")}
                        >
                            <img
                                src="/svg/header/video.svg"
                                alt="Videos"
                                className="h-6 w-6"
                            />
                        </NavLink>
                        <NavLink
                            href={route("mapa.index")}
                            active={route().current("mapa.index")}
                        >
                            <img
                                src="/svg/header/Map.svg"
                                alt="Mapa"
                                className="h-6 w-6"
                            />
                        </NavLink>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <BarraBusqueda />
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="inline-flex items-center rounded-full p-2 ">
                                    <img
                                        src="/svg/header/Vector.svg"
                                        alt="Notificaciones"
                                        className="h-6 w-6"
                                    />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route("profile.edit")}>
                                    Perfil
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                >
                                    Cerrar sesión
                                </Dropdown.Link>
                                <br /> <hr className="border border-blue-500" />{" "}
                                <Dropdown.Link href={route("profile.edit")}>
                                    mostrar notificaciones debajo
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    {/* busqueda en movil */}
                    <div className="flex-1 px-4 md:hidden">
                        <div className="max-w-xs mx-auto">
                            <BarraBusqueda />
                        </div>
                    </div>

                    {/* boton para abrir menu en movil */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileOpen((s) => !s)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10"
                            aria-expanded={mobileOpen}
                        >
                            <img
                                src="/svg/header/Group.svg"
                                alt="Menu"
                                className="h-6 w-6"
                            />
                        </button>
                    </div>
                </div>

                {/* menu para movil */}
                <div
                    className={`${
                        mobileOpen ? "block" : "hidden"
                    } md:hidden pb-4`}
                >
                    <div className="space-y-1 px-2 pt-2">
                        <ResponsiveNavLink href={route("inicio")}>
                            Inicio
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route("comunidad.index")}>
                            Comunidad
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route("videos.index")}>
                            Videos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route("mapa.index")}>
                            Mapa
                        </ResponsiveNavLink>
                        {/* corregir link a notificaciones cuando se implemente */}
                        <ResponsiveNavLink href={route("inicio")}>
                            Notificaciones
                        </ResponsiveNavLink>
                    </div>

                    {/* sacar despues */}
                    <div className="border-t border-white/10 px-4 pt-4 pb-2">
                        <div className="text-base font-medium">
                            {user?.name}
                        </div>
                        <div className="space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                Cerrar sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

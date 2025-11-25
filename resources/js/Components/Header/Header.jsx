import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import BarraBusqueda from "../BarraBusqueda/BarraBusqueda";
import NavLink from "../NavLink";

export default function Header({ onToggleSidebar }) {
    return (
        <header className="bg-edu-dark text-white sticky top-0 z-50">
            <nav className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/inicio" className="flex items-center">
                        <img
                            src="/images/logo-navbar-eduquen.webp"
                            alt="EDUQUÉN"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Links para desktop */}
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

                    {/* Acciones desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="hidden md:flex mx-6">
                            <BarraBusqueda variant="global" />
                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="inline-flex items-center rounded-full p-2 hover:bg-white/10 transition-colors">
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
                                <br />
                                <hr className="border border-edu-dark" />
                                <Dropdown.Link href={route("profile.edit")}>
                                    mostrar notificaciones debajo
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>

                        {/* Botón sidebar desktop */}
                        <button
                            onClick={onToggleSidebar}
                            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-white/10 transition-colors"
                        >
                            <img
                                src="/svg/header/Group.svg"
                                alt="Menu"
                                className="h-6 w-6"
                            />
                        </button>
                    </div>

                    {/* Mobile: solo logo y notificaciones */}
                    <div className="flex md:hidden items-center gap-2">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="inline-flex items-center rounded-full p-2">
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
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </nav>
        </header>
    );
}

import { useState } from "react";

import Header from "@/Components/Header/Header";
import Sidebar from "@/Components/Sidebard/Sidebard";
// import Footer from "@/Components/Footer";
import { Toaster } from "react-hot-toast";

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex flex-1">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* contenido */}
                <div className="flex-1 flex flex-col">
                    {header && (
                        <div className="bg-white shadow-sm">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </div>
                    )}

                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>

                    {/* <Footer /> */}

                    {/* libreria 'react-hot-toast' para mensajes en pantalla al usuario */}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#363636",
                                color: "#fff",
                                borderRadius: "12px",
                                padding: "16px",
                                fontSize: "14px",
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: "#10b981",
                                    secondary: "#fff",
                                },
                            },
                            error: {
                                duration: 4000,
                                iconTheme: {
                                    primary: "#ef4444",
                                    secondary: "#fff",
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

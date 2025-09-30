import ApplicationLogo from "@/Components/ApplicationLogo";

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-edu-dark pt-6 sm:justify-center sm:pt-0 overflow-hidden">
            
            <div className="z-20 logo-eduquen">
                <ApplicationLogo />
            </div>

            <div
                className="absolute left-1/2 pointer-events-none edu-halo z-0
                w-[62.5rem] h-[28rem] 
                md:w-[78.5rem] md:h-[28rem]
                sm:w-[72.5rem] sm:h-[28rem]"
                style={{
                    transform: "translateX(-50%)",
                }}
            >
                <div
                    className="w-full h-full rounded-[45%]"
                    style={{
                        background:
                            "radial-gradient(circle at center, rgba(245,223,166,0.9) 0%, 68%, rgba(42,58,71,0.1) 80%, transparent 90%)",
                        filter: "blur(80px)",
                        opacity: 0.9,
                    }}
                />
            </div>

            {/* className="relative z-10 flex-1 flex items-center justify-center w-full mb-2" */}
            <div
                className="
                    relative z-10 w-full flex-1 
                    flex items-center justify-center 
                    px-4 py-8
                    sm:py-0 sm:items-center sm:justify-center
                    overflow-y-auto
                "
            >
                {children}
            </div>
        </div>
    );
}

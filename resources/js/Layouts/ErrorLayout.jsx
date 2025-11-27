export default function ErrorLayout({ children }) {
    return (
        <div className="min-h-screen bg-edu-dark flex items-center justify-center px-6">
            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-10 text-center border border-white/20">
                {children}
            </div>
        </div>
    );
}

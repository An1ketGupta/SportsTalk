import Link from "next/link";

export default function SignInButton() {
    return (
        <Link
            className="group relative inline-flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
            href="/auth"
        >
            {/* Shine effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            {/* Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>

            <span className="relative text-sm">Sign In</span>
        </Link>
    );
}
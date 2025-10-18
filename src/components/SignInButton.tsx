export default function SignInButton() {
    return (
        <a 
            className="bg-white text-lg text-black h-auto w-auto px-4 py-2 rounded-full flex items-center" 
            href="/auth"
        >
            Sign In
        </a>
    );
}
import { auth } from "@/auth";

export default async function Avatar() {
    const session = await auth();
    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-2 text-lg">
            <img className="h-8 w-8 rounded-full" src={`${session.user.image}`} alt="User avatar" />
            {session.user.name?.split(" ")[0]}
        </div>
    );
}
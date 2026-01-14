import UserList from "@/components/UserList";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import prisma from "@/lib/db";

export default async function FollowersPage({ params }: { params: Promise<{ userid: string }> }) {
    const { userid: userId } = await params;

    const followers = await prisma.userFollow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    bio: true,
                    isVerified: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const formattedUsers = followers.map((f) => ({
        id: f.follower.id,
        name: f.follower.name,
        username: f.follower.email?.split("@")[0] ?? "user",
        image: f.follower.image,
        bio: f.follower.bio,
        isVerified: f.follower.isVerified,
    }));

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    });

    return (
        <>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-3 border-b border-white/20 flex items-center gap-4">
                <Link href={`/user/${userId}`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <FiArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold">{user?.name}</h1>
                    <p className="text-sm text-gray-500">@{user?.email?.split("@")[0]}</p>
                </div>
            </div>

            <div className="mt-2">
                <div className="flex border-b border-white/20">
                    <div className="flex-1 text-center py-4 font-bold border-b-4 border-blue-500 text-white">
                        Followers
                    </div>
                    <Link href={`/user/${userId}/following`} className="flex-1 text-center py-4 text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
                        Following
                    </Link>
                </div>
                <UserList users={formattedUsers} emptyMessage="This user has no followers yet." />
            </div>
        </>
    );
}

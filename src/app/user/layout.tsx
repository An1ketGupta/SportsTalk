import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/ui/searchbar";
import TrendingSports from "@/components/TrendingSports";
import WhoToFollow from "@/components/whotofollow";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-[90vh] flex text-white pb-16 md:pb-0">
            <div className="hidden md:block">
                <Sidebar />
            </div>
            <div className="border-r w-full max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide flex-1">
                {children}
            </div>
            <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
                <SearchBar />
                <TrendingSports />
                <WhoToFollow />
            </div>
        </div>
    );
}

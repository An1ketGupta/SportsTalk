
import Post from "@/components/post";
import Sidebar from "@/components/sidebar";
import Posts from "../../../public/post.json"
import SearchBar from "@/components/searchbar";
import CommunityTabSwticher from "@/components/communitytabswitch";
import TagsBox from "@/components/tagbox";
import WhoToFollow from "@/components/whotofollow";

export default function Main() {
    return (
        <div className="w-full h-screen flex h-screen">
            {/* Sidebar */}
            <div className="border-r pt-[10vh] border-white border-opacity-20 pr-3 pl-3 xl:pl-[16vh] xl:pr-10 h-screen">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="border-r pt-[10vh] max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide">
                <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none">
                    <CommunityTabSwticher/>
                </div>
                <div className="w-full">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Post key={i} post={Posts.posts[0]} />
                    ))}
                </div>
            </div>

            {/* Right Section */}
            <div className="pl-8 py-[10vh] overflow-y-auto scrollbar-hide hidden lg:block">
                <SearchBar/>
                <TagsBox/>
                <WhoToFollow/>
            </div>
        </div>
    );
}

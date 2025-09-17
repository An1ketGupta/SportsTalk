import Post from "@/components/ui/post";
import Sidebar from "@/components/ui/sidebar";
import Posts from "../../../public/post.json"
import SearchBar from "@/components/ui/searchbar";
import CommunityTabSwticher from "@/components/ui/communitytabswitch";
export default function Main() {


    return (
        <div className="grid w-full h-screen grid-cols-[auto_88vh_1fr]">
            {/* Sidebar */}
            <div className="border-r border-white border-opacity-20 pr-3 pl-3 xl:pl-[16vh] xl:pr-10">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="border-r border-white border-opacity-20 flex justify-center">
                <CommunityTabSwticher/>
                <div className="w-full scrollbar-hide">
                    <Post post={Posts.posts[0]} />
                </div>
            </div>

            {/* Right Section*/}
            <div className="pl-8 hidden lg:block w-full">
                <SearchBar/>
            </div>
        </div>
    );
}

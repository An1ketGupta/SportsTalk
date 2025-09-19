import SearchBar from "@/components/searchbar"
import Sidebar from "@/components/sidebar"
import TagsBox from "@/components/tagbox"
import Userpagenavbar from "@/components/userpagenavbar"
import WhoToFollow from "@/components/whotofollow"
import Posts from "../../public/post.json"
import Post from "@/components/post"
import UserInfo from "@/components/userinfo"

interface User{
    "username":string,
      "name": string,
      "profilePic": string,
      "bio": string
}

export default function Userpage(){
    return  <div className="w-full h-screen flex text-white">
            <div>
                <Sidebar/>
            </div>
            {/* The user profile will be rendered here */}
            <div className="border-r w-full pt-[10vh] max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide">
                <div className="w-full sticky top-0 z-10">
                    <Userpagenavbar name="Aniket" numberofposts={10}/>
                </div>
                    <UserInfo/>
                <div>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Post key={i} post={Posts.posts[0]} />
                    ))}
                </div>
            </div>
            <div className="pl-8 py-[10vh] overflow-y-auto scrollbar-hide hidden lg:block">
                    <SearchBar/>
                    <TagsBox/>
                    <WhoToFollow/>
            </div>
    </div>
}
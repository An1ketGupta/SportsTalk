'use client'
import Post from "@/components/ui/post";
import Sidebar from "@/components/sidebar";
import Posts from "../../public/post.json"
import { useState } from "react";
import TweetBox from "@/components/ui/tweetbox";
import RightSection from "@/components/rightsection";
import { Button } from "@/components/ui/button";

export default function Following() {
    const [showTweetBox , setTweetBox] = useState(false);
    const [section , setSection] = useState("foryou")
    return (
        <div className="w-full h-[90vh] flex">
            {/* Sidebar */}
            <div>
                <Sidebar setAddPost={setTweetBox}/>
            </div>
            {/* Main Content */}
            <div className="border-r max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide">
                <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none flex">
                    
                    <Button onClick={()=>{
                        setSection("foryou")
                    }} className={`${section=="foryou"?"bg-[#dfe6e9] text-black":"bg-black/20"} w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm`}>For You</Button>
                    
                    <Button onClick={()=>{
                        setSection("following")
                    }} className={`${section=="following"?"bg-[#dfe6e9] text-black":"bg-black/20"} w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm`}>Following</Button>
                </div>

                <div className="sticky top-0 mx-2">
                    {showTweetBox && <TweetBox/>}
                </div>
                <div className="w-full">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Post key={i} post={Posts.posts[0]} />
                    ))}
                </div>
            </div>

            {/* Right Section */}
            <RightSection/>
        </div>
    );
}

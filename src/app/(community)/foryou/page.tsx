'use client'

import Post from "@/components/ui/post";
import Sidebar from "@/components/sidebar";
import Posts from "../../../public/post.json"
import SearchBar from "@/components/ui/searchbar";
import CommunityTabSwticher from "@/components/communityTabSwitcher";
import TagsBox from "@/components/ui/tagbox";
import WhoToFollow from "@/components/whotofollow";
import { useState } from "react";
import TweetBox from "@/components/ui/tweetbox";
import RightSection from "@/components/rightsection";

export default function ForYou() {
    const [showAddPost, setAddPost] = useState(false);
    return (
        <div className="w-full h-screen flex">
            {/* Sidebar */}
            <div>
                <Sidebar setAddPost={setAddPost} />
            </div>

            {/* Main Content */}
            <div className="border-r w-full max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide">
                <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none">
                    <CommunityTabSwticher />
                </div>
                <div className="sticky top-0 mx-2">
                    {showAddPost && <TweetBox />}
                </div>
                <div>
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

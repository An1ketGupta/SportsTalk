"use client";

import Link from "next/link";

export default function CommunityTabSwticher(){
        return <div className="text-white w-full flex">
            <Link className="w-full py-2 rounded-full hover:bg-white hover:text-black justify-center flex" href={"/foryou"}>For you</Link>
            <Link className="w-full py-2 rounded-full hover:bg-white hover:text-black justify-center flex" href={"/following"}>Following</Link>
        </div>
}

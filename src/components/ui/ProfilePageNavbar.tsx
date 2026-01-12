"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

interface UserInterface{
    name:string,
    numberofposts:number
}

export default function Userpagenavbar({
    name,
    numberofposts
}:UserInterface){
    const router = useRouter();
    
    return <div className="h-auto py-1 px-4 flex gap-8 items-center bg-black/20 backdrop-blur-md">
        <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Go back"
        >
            <FaArrowLeft className="size-4"/>
        </button>
        <div>
            <div className="font-semibold text-xl">
                {name}
            </div>
            <div className="text-sm text-gray-500">
                {numberofposts} posts
            </div>
        </div>
    </div>
}
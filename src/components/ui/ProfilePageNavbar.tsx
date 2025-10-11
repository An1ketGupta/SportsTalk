import { FaArrowLeft } from "react-icons/fa";

interface UserInterface{
    name:string,
    numberofposts:number
}

export default function Userpagenavbar({
    name,
    numberofposts
}:UserInterface){
    return <div className="h-auto py-1 px-4 flex gap-8 items-center bg-black/20 backdrop-blur-md">
        <FaArrowLeft className="size-4 "/>
        <div>
            <div className="font-semibold text-xl">
                {name}
            </div>
            <div className="text-sm">
                {numberofposts} posts
            </div>
        </div>
    </div>
}
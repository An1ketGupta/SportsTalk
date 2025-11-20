import Link from "next/link";
import SquareBox from "./squarebox";
import { GoCheckCircleFill } from "react-icons/go";
export default function Post({
    post
}: {
    post: { 
            title: string,
            content: string ,
            imglink:string
            user:{
                name:string,
                username:string,
                verified:boolean,
                imglink:string
            }
    }
}) {
    return (
        <SquareBox bg="black" height="auto" width="full" paddingx="2.5vh" paddingy="3vh" rounded="0vh">
            <div className="grid grid-cols-12">
                <div className="col-span-1">
                    <Link href={`/user/`}>
                        <img className="w-12 h-11 rounded-full" src={post.user.imglink}/>
                    </Link>
                </div>
                <div className="col-span-11 pl-2">
                    <div className="w-full flex gap-1">
                        <a className="flex items-center gap-1 text-bold">
                            {post.user.name}
                            <GoCheckCircleFill /> 
                        </a>
                        <div className="text-[#4b4d51]">@{post.user.username}</div>
                    </div>
                    <div>{post.content}</div>
                    <img className="rounded-3xl pt-2 w-full h-g" src={post.imglink}/>
                </div>
            </div>
        </SquareBox>
    );
}

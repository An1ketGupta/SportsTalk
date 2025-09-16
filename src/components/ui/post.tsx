import SquareBox from "./squarebox";
import { GoCheckCircleFill } from "react-icons/go";
export default function Post({
    post
}: {
    post: { imglink: string
            title: string,
            content: string
    }
}) {
    return (
        <SquareBox bg="black" height="auto" width="full" paddingx="2.5vh" paddingy="3vh">
            <div className="grid grid-cols-12">
                <div className="col-span-1">
                    <a href={`/user/`}>
                        <img className="w-12 h-12 rounded-full" src={"https://thewire.signingdaysports.com/wp-content/uploads/IMG-Academy-1.jpg"} />
                    </a>
                </div>
                <div className="col-span-11 pl-2">
                    <div className="w-full flex gap-1">
                        <a className="flex items-center gap-1">
                            {post.title}
                            <GoCheckCircleFill /> //render this only when the user is verified
                        </a>
                        <div className="text-[#4b4d51]">{post.user.username}</div>
                    </div>
                    <div>{post.content}</div>
                </div>
            </div>
        </SquareBox>
    );
}

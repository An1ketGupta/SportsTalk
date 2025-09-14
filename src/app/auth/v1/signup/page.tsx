import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Main(){
    return <div className="gap-y-4 h-screen flex flex-col justify-center items-center">
        <div className="text-[7vh] font-bold">
            LOG IN
        </div>
        <div className="font-semibold text-lg">
            New to this site? &nbsp;
            <a href="/signup" className="text-blue-500 ">Sign up</a>
        </div>
        <Input type="email" placeholder="Enter your email"/>
        <Input type="password" placeholder="Enter password"/>
        <Button className="rounded-md h-[6vh] w-[20vw] text-lg bg-[#6b727f]"><a>Sign In</a></Button>
    </div>
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signin(){
    return <div className="gap-y-4 text-white h-screen flex flex-col justify-center items-center">
        <div className="text-[7vh] font-bold">
            LOG IN
        </div>
        <div className="font-semibold text-lg">
            New to this site? &nbsp;
            <a href="/auth/v1/signup" className="text-blue-500 ">Sign up</a>
        </div>
        <Input type="email" placeholder="Enter your email"/>
        <Input type="password" placeholder="Enter password"/>
        <Button className="rounded-lg hover:bg-neutral-200 text-black h-[6vh] w-[20vw] text-lg bg-white"><a>Sign In</a></Button>
    </div>
}
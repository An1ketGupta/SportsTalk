import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signup(){
    return <div className="gap-y-4 text-white h-screen flex flex-col justify-center items-center">
        <div className="text-[7vh] font-bold">
            SIGN UP
        </div>
        <Input type="email" placeholder="Enter your email"/>
        <Input type="password" placeholder="Enter password"/>
        <Button className="rounded-lg hover:bg-neutral-200 text-black h-[6vh] w-[20vw] text-lg bg-white"><a>Sign Up</a></Button>
    </div>
}
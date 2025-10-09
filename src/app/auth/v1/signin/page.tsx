"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRef } from "react";

export default function Signin(){
    const usernameref = useRef<HTMLInputElement>(null)
    const passwordref = useRef<HTMLInputElement>(null)
    return <div className="gap-y-4 text-white h-full pt-28 flex flex-col justify-center items-center">
        <div className="text-[7vh] font-bold">
            LOG IN
        </div>
        <div className="font-semibold text-lg">
            New to this site? &nbsp;
            <a href="/auth/v1/signup" className="text-blue-500 ">Sign up</a>
        </div>
        <Input ref={usernameref} type="username" placeholder="Enter your Username"/> 
        <Input ref={passwordref} type="password" placeholder="Enter Password"/>
        <Button onClick={async function (){
            await axios.post("./api/v1/signin", {
                username:usernameref.current?.value,
                password:passwordref.current?.value
            })
        }} className="rounded-lg hover:bg-neutral-200 text-black h-[6vh] w-[20vw] text-lg bg-white"><a>Sign In</a></Button>
    </div>
}
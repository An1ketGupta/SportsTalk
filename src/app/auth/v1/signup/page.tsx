"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Signup(){
    const firstnameref = useRef<HTMLInputElement>(null);
    const lastnameref = useRef<HTMLInputElement>(null);
    const usernameref = useRef<HTMLInputElement>(null);
    const passwordref= useRef<HTMLInputElement>(null);
    const router = useRouter();
    return <div className="gap-y-4 text-white h-auto pt-28 flex flex-col justify-center items-center">
        <div className="text-[7vh] font-bold">
            SIGN UP
        </div>
        
        <Input ref={firstnameref} type="string" placeholder="Enter your First Name"/>
        <Input ref={lastnameref} type="string" placeholder="Enter your Last Name"/>
        <Input ref={usernameref} type="username" placeholder="Create Username"/>
        <Input ref={passwordref} type="password" placeholder="Create Password"/>

        <Button onClick={async function(){
            const response = await axios.post("/api/v1/signup",
                {
                    firstName:firstnameref.current?.value,
                    lastName:lastnameref.current?.value,
                    username:usernameref.current?.value,
                    password:passwordref.current?.value
                }
            )
            if(response.data.success){
                alert("You were signed up.")
                router.push("./signin")
            }
        }} className="rounded-lg hover:bg-neutral-200 text-black h-[6vh] w-[20vw] text-lg bg-white"><a>Sign Up</a></Button>
    </div>
}
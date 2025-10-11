"use server"

import { signIn } from "@/auth"
import { url } from "inspector"
import { redirect } from "next/dist/server/api-utils"

export default async function SigninHandler(formData:any){
    const data = formData.get('action')
    await signIn(data , {redirectTo:"/"})
}
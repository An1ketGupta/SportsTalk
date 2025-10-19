"use server"

import { signIn } from "@/auth"

export default async function SigninHandler(formData:any){
    const data = formData.get('action')
    await signIn(data , {redirectTo:"/"})
}
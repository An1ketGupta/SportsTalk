"use server"

import { signIn, signOut } from "@/auth"

export default async function SigninHandler(formData:any){
    const data = formData.get('action')
    await signIn(data , {redirectTo:"/"})
}

export async function signoutHandler(){
    await signOut()
}
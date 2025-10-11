"use server"
import { signIn } from "@/auth";
export default async function SigninHandler(){
    await signIn("google")
}
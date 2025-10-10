import prisma from "@/lib/db";
import cookie from "cookie"
import { NextRequest, NextResponse } from "next/server";
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

export async function POST(req:NextRequest){
    const data = await req.json();
    const username = data.username
    const password = data.password
    try {
        const currentuser = await prisma.user.findFirst({
            where:{
                username:username
            }
        })
        if(currentuser){
            const checkedPassword = await bcrypt.compare(password,currentuser.password)
            if(checkedPassword){
                const token = jwt.sign({
                    username:username
                },"JWTSECRET")
                const response = NextResponse.json({
                    success:true,
                    message:"You are signed in."
                }) 
                const responsedata = cookie.serialize("token" , token , {
                    httpOnly:true,
                    sameSite:"strict",
                    maxAge: 60*60*24*10,
                    path:"/"
                })
                response.headers.set("Set-Cookie" , responsedata)
                return response
            }
        }
        else{
            return NextResponse.json({
                message:"User does not exist."
            })
        }
    } catch (error) {
        return NextResponse.json({
            message:"Network error. Try again."
        })
    }


    return NextResponse.json({
        message:"Hi there."
    })
}
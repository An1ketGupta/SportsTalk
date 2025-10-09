const bcrypt = require('bcrypt');
import { NextRequest, NextResponse } from "next/server";
import z, { success } from 'zod'
import prisma from "@/lib/db";
export async function POST(req: NextRequest) {
    const data = await req.json()

    const requiredbody = z.object({
        firstName: z.string(),
        lastName: z.string(),
        username: z.string(),
        password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number and be at least 8 chars long")
    })

    const parsedBody = await requiredbody.safeParseAsync(data)
    if (parsedBody.success) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10)
            await prisma.user.create({
                data: {
                    username: data.username,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                }
            })
        } catch (err) {
            return NextResponse.json({
                success:false,
                message:"Username already exists."
            })
        }
        return NextResponse.json({
            success:true,
            message: "You are signed up."
        })
    }
    else {
        return NextResponse.json({
            success:false,
            message: parsedBody.error.issues[0].message,
        })
    }
}
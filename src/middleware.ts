import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    matcher: [
        "/community/:path*",
        "/livematches/:path*",
        "/match/:path*",
    ],
}

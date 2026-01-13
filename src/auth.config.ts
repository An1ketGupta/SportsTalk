import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"

export const authConfig = {
    pages: {
        signIn: '/auth',
    },
    providers: [Google, Github],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnCommunity = nextUrl.pathname.startsWith('/community')
            const isOnLiveMatches = nextUrl.pathname.startsWith('/livematches') // Assuming the path is /livematches
            const isOnMatch = nextUrl.pathname.startsWith('/match')

            if (isOnCommunity || isOnLiveMatches || isOnMatch) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            }
            return true
        },
    },
} satisfies NextAuthConfig

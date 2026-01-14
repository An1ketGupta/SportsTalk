import NextAuth from "next-auth"
import prisma from "./lib/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;

        try {
          // Fetch user to ensure we have the custom profile picture if set
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { image: true, profilePic: true }
          });

          // Prioritize profilePic (custom), then image (provider), then fall back to existing session image
          if (dbUser?.profilePic) {
            session.user.image = dbUser.profilePic;
          } else if (dbUser?.image) {
            session.user.image = dbUser.image;
          }
        } catch (e) {
          console.error("Error fetching user profile pic in session:", e);
        }
      }
      return session;
    },
  },
})
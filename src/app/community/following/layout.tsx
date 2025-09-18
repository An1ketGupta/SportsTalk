import NavBar from "@/components/Parts/Navbar"

export default function FollowingLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body className="bg-black text-white">
          <NavBar/>
          <main className="min-h-screen">{children}</main>
        </body>
      </html>
    )
  }
import NavBar from "@/components/Parts/Navbar"

export default function ForYouLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body className="bg-black text-white">
          <NavBar/>
          <main className="min-h-screen pt-[10vh]">{children}</main>
        </body>
      </html>
    )
  }
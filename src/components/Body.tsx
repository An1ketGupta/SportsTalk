import categories from "@/public/categoryinfo.json";
import SquareBox from "@/components/ui/squarebox";
import SportsCatalogue from "@/components/SportPreview";
import { auth } from "@/auth";
import Link from "next/link";

export default async function Body() {
    const session = await auth()
    const user = session?.user

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-[10vh] pb-16 sm:pb-24 px-[4vw] sm:px-[2vw]">
                {/* Subtle Background Accents */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Main Hero Content */}
                        <div className="text-center my-12">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic mb-6 text-white leading-tight">
                                Your Sports<br />Community Awaits
                            </h1>
                            <p className="text-lg sm:text-xl text-[#d1d5db] max-w-2xl mx-auto mb-8">
                                Join thousands of fans discussing live matches, sharing passion, and connecting over the sports you love.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href={user ? "/community" : "/auth"} className="group inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg">
                                    {user ? "Go to Community" : "Get Started Free"}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                                        <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                                <Link href="/livematches/nfl" className="inline-flex items-center justify-center gap-2 bg-[#181818] hover:bg-[#252525] border border-white/10 text-white px-8 py-4 rounded-xl font-semibold transition-all">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Join Live Matches
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            {[
                                { value: "10+", label: "Sports", color: "text-[#f35730]" },
                                { value: "24/7", label: "Live Coverage", color: "text-[#3b82f6]" },
                                { value: "10K+", label: "Active Fans", color: "text-green-400" },
                                { value: "99%", label: "Uptime", color: "text-gray-300" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 text-center hover:bg-[#181818] transition-colors">
                                    <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-sm text-[#9ca3af]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-24 px-[4vw] sm:px-[2vw] border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Sports Fans Love Us</h2>
                        <p className="text-[#d1d5db] max-w-xl mx-auto">Everything you need to stay connected with your favorite sports</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "⚡",
                                title: "Real-Time Updates",
                                description: "Get instant notifications and live scores as the action happens"
                            },
                            {
                                icon: "💬",
                                title: "Live Chat",
                                description: "Discuss plays, share reactions with fans during matches"
                            },
                            {
                                icon: "🏆",
                                title: "Multi-Sport",
                                description: "Football, Cricket, NBA, Tennis and more - all in one place"
                            }
                        ].map((feature) => (
                            <div key={feature.title} className="group bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 hover:border-[#f35730]/50 transition-all">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-[#9ca3af]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sports Categories */}
            <section className="py-16 sm:py-24 px-[4vw] sm:px-[2vw]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold italic mb-4">Explore Sports</h2>
                        <p className="text-[#d1d5db] max-w-xl mx-auto">Follow your favorite sports and join live discussions with passionate fans</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {categories.map((cat) => (
                            <SportsCatalogue
                                key={cat.title}
                                imglink={cat.img}
                                Title={cat.title}
                                Description={cat.description}
                                link={cat.link}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!user && (
                <section className="py-16 sm:py-24 px-[4vw] sm:px-[2vw]">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative overflow-hidden bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 sm:p-12 text-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Join?</h2>
                                <p className="text-[#c6c9ce] mb-8 max-w-md mx-auto">
                                    Connect with fellow sports enthusiasts and never miss a moment of the excitement
                                </p>
                                <Link href="/auth" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors">
                                    Create Free Account
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
import Post from "@/components/ui/post";
import Sidebar from "@/components/ui/sidebar";

export default function Main() {
    const post = {
        title: "Aniket",
        content: "Hi there",
        imglink: "https://thewire.signingdaysports.com/wp-content/uploads/IMG-Academy-1.jpg"
    };

    return (
        <div className="text-white grid grid-cols-12">
        {/* Sidebar */}
        <div className="w-20 sm:w-auto sm:col-span-2 lg:col-span-3 h-screen border-r border-white border-opacity-20">
          <Sidebar />
        </div>
      
        {/* Main Content */}
        <div className="max-w-[85vh] col-span-11 sm:col-span-10 lg:col-span-8 h-screen border-r border-white border-opacity-20 flex justify-center">
          <div className="w-full">
            <Post post={post} />
          </div>
        </div>
      
        {/* Right Section*/}
        <div className="hidden lg:block lg:col-span-1 xl:col-span-2 pl-2">
        </div>
      </div>
    );
}

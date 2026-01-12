import { Dispatch, SetStateAction, useEffect, useRef } from "react";

type Message = {
  text: string;
  type: "sent" | "received";
};

export default function ChatBox({
    matchId,
    messages,
    sendmessage,
    setSendMessage,
    handleSendMessage,
}:{
    matchId:string|null|undefined,
    messages:Message[],
    sendmessage:string,
    setSendMessage:Dispatch<SetStateAction<string>>
    handleSendMessage:() => Promise<void>
}){
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll only within the chat container when new messages arrive
    useEffect(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, [messages]);

    return (
      <div className="w-full h-[600px] flex flex-col bg-gradient-to-br from-gray-900/90 to-gray-950/90 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Live Chat</h3>
                <p className="text-xs text-gray-400">Join the conversation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-400">Online</span>
              </div>
            </div>
          </div>
          {matchId && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">
                Room: <span className="text-blue-400 font-mono">{matchId}</span>
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No messages yet</p>
              <p className="text-gray-600 text-sm mt-1">Be the first to start the conversation!</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isSent = msg.type === "sent"
            return (
              <div key={i} className={`flex ${isSent ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                    isSent
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                      : "bg-gray-800/80 text-gray-100 border border-white/5 rounded-bl-md"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1.5 ${isSent ? "text-blue-200" : "text-gray-500"}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={sendmessage}
                onChange={(e) => setSendMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-800/50 text-white placeholder:text-gray-500 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!sendmessage.trim()}
              className="h-[52px] px-6 rounded-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none flex items-center gap-2"
            >
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
}
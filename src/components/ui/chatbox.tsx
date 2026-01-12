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
      <div className="w-full h-[600px] flex flex-col bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="text-white text-sm font-medium">Live Chat</span>
            {matchId && <span className="text-gray-500 text-xs">• {matchId}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-600 text-xs mt-1">Start the conversation</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isSent = msg.type === "sent"
            return (
              <div key={i} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isSent
                      ? "bg-white text-black rounded-br-sm"
                      : "bg-white/5 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isSent ? "text-gray-500" : "text-gray-600"}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={sendmessage}
              onChange={(e) => setSendMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm placeholder:text-gray-500 outline-none border border-white/5 focus:border-white/20 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!sendmessage.trim()}
              className="h-10 w-10 rounded-xl bg-white text-black hover:bg-gray-200 disabled:bg-white/10 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
}
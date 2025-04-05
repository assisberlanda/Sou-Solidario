import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@shared/schema";

interface ChatBotProps {
  campaignId?: number;
}

const ChatBot = ({ campaignId }: ChatBotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Olá! Eu sou o assistente do Sou Solidário. Como posso ajudar você com sua doação hoje?",
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat", {
        message: userMessage.content,
        campaignId,
      });
      
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente mais tarde.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll para a última mensagem quando uma nova mensagem é adicionada
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <CardTitle className="ml-3 text-xl font-heading">Assistente Virtual</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 mb-4 h-64 overflow-y-auto flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] mb-3 p-3 rounded-lg ${
                msg.role === "assistant"
                  ? "bg-green-50 border-green-100 text-gray-800 self-start rounded-bl-sm"
                  : "bg-blue-50 border-blue-100 text-gray-800 self-end rounded-br-sm"
              }`}
            >
              {msg.content.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-1" : ""}>
                  {line}
                </p>
              ))}
            </div>
          ))}
          {isLoading && (
            <div className="max-w-[80%] mb-3 p-3 rounded-lg bg-green-50 border-green-100 text-gray-800 self-start rounded-bl-sm flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="rounded-r-none focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary-dark rounded-l-none"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;

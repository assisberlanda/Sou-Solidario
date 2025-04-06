
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 bg-primary hover:bg-primary-dark"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold mb-2">Assistente Virtual</h3>
          <p className="text-sm text-gray-600">
            Como posso ajudar você hoje?
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

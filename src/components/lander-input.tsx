"use client";

import React, { useState } from "react"; // Import useState
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Paperclip, Send } from "lucide-react"; // Import icons

interface LanderInputProps {
  onSubmit: (question: string) => Promise<void>;
}

const LanderInput: React.FC<LanderInputProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState(""); // State for input
  const [loading, setLoading] = useState(false); // Loading state

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(inputValue);
    } catch (error) {
      console.error("Error submitting message:", error);
    } finally {
      setLoading(false);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-128px)] w-full p-4 gap-2">
      <p className="text-2xl font-bold">What would you like to know?</p>
      <div className="relative w-full max-w-2xl">
        <Input 
          value={inputValue} 
          onChange={handleInputChange} 
          className="pr-24 pl-10 py-6 text-base"
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          onClick={handleSend} 
          disabled={loading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          size="sm"
        >
          {loading ? "Sending..." : <Send className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LanderInput;

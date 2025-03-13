'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getUserEmail } from '@/app/actions';

type Email = {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean
};

type EmailSummarizerToolProps = {
  emails: Email[];
};

export const EmailSummarizer = ({ emails }: EmailSummarizerToolProps) => {
  // Only show the first 5 emails
  const displayEmails = emails.slice(0, 5);
  const [userEmail, setUserEmail] = useState<string>('');
  const [readEmails, setReadEmails] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = await getUserEmail()
      if(email && email != '') {
        console.log(email)
        setUserEmail(email);
      }

    };
    
    fetchUserEmail();
  }, []);
  
  const handleEmailClick = (emailId: string) => {
    setReadEmails(prev => {
      const newSet = new Set(prev);
      newSet.add(emailId);
      return newSet;
    });
  };
  
  return (
    <div className="border rounded-lg p-3 shadow-sm w-[300px]">
      <h3 className="font-medium text-sm mb-2">Email Summaries</h3>
      <div className="space-y-2">
        {displayEmails.map((email, index) => (
          <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground truncate">From: {email.sender}</div>
              <div className="flex items-center">
                {email.unread && !readEmails.has(email.id) && (
                  <div className="relative mr-1">
                    <svg
                      className="h-4 w-4 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full"></div>
                  </div>
                )}
                <a 
                  href={`https://mail.google.com/mail?authuser=${userEmail}#all/${email.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleEmailClick(email.id)}
                >
                  <ChevronRight size={16} />
                </a>
              </div>
            </div>
            <div className="text-xs truncate">{email.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
type Email = {
  sender: string;
  subject: string;
  snippet: string;
  date: string;
};

type EmailSummarizerToolProps = {
  emails: Email[];
};

export const EmailSummarizer = ({ emails }: EmailSummarizerToolProps) => {
  // Only show the first 5 emails
  const displayEmails = emails.slice(0, 5);
  
  return (
    <div className="border rounded-lg p-3 shadow-sm w-[300px]">
      <h3 className="font-medium text-sm mb-2">Email Summaries</h3>
      <div className="space-y-2">
        {displayEmails.map((email, index) => (
          <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
            <div className="text-xs text-muted-foreground truncate">From: {email.sender}</div>
            <div className="text-xs truncate">{email.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
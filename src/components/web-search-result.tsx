import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WebSearchResultProps = {
  content: string;
  sources?: Array<{
    title?: string;
    url: string;
  }>;
};

export const WebSearchResult = ({ content, sources }: WebSearchResultProps) => {
  console.log('Raw content:', content);
  
  // Function to parse markdown-style content
  const parseContent = (content: string) => {
    // First, split by double newlines to separate major sections
    return content.split('\n\n').map(section => {
      // Remove "Here are" introductory text if present
      section = section.replace(/^Here are .*?:/i, '').trim();
      
      if (section.includes('**')) {
        // Handle sections with bold markers
        const parts = section.split('**').filter(Boolean);
        return {
          type: 'section',
          title: parts[0]?.trim(),
          content: parts.slice(1).join(' ').trim()
        };
      } else if (section.startsWith('-')) {
        // Handle bullet points
        return {
          type: 'bullet',
          content: section.substring(1).trim()
        };
      } else {
        // Handle regular paragraphs
        return {
          type: 'paragraph',
          content: section.trim()
        };
      }
    }).filter(section => section.content || section.title);
  };

  const parsedSections = parseContent(content);
  console.log('Parsed sections:', parsedSections);

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Web Search Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none">
          {parsedSections.map((section, index) => {
            if (section.type === 'section') {
              return (
                <div key={index} className="mb-6">
                  <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">
                    {section.title}
                  </h3>
                  <div className="pl-4 text-gray-700 dark:text-gray-200">
                    {section.content}
                  </div>
                </div>
              );
            } else if (section.type === 'bullet') {
              return (
                <div key={index} className="pl-4 mb-2 flex items-start">
                  <span className="mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-200">{section.content}</span>
                </div>
              );
            } else {
              return (
                <p key={index} className="text-gray-700 dark:text-gray-200">
                  {section.content}
                </p>
              );
            }
          })}
        </div>
        
        {sources && sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Sources:</h4>
            <ul className="space-y-1">
              {sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
type WordDefinitionProps = {
  word: string;
  definition: string;
  error?: string;
};

export const WordDefinition = ({ word, definition, error }: WordDefinitionProps) => {
  return (
    <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <div className="text-xl font-medium text-white capitalize">{word}</div>
          <div className="text-sm text-zinc-400 italic">noun</div>
        </div>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="text-zinc-300 leading-relaxed">
            <span className="text-zinc-400">1.</span> {definition}
          </div>
        )}
      </div>
    </div>
  );
};

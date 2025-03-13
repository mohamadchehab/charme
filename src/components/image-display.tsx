type ImageDisplayProps = {
    image: string;
   
    error?: string;
  };
  
  export const ImageDisplay = ({ image, error }: ImageDisplayProps) => {
    return (
      <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
        <div className="flex flex-col gap-3">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            image && (
              <div className="overflow-hidden rounded-md">
                <img 
                  src={`data:image/png;base64,${image}`} 
                  alt="Generated image" 
                  className="w-[300px] h-[300px]"
                />
              </div>
            )
          )}
        </div>
      </div>
    )}
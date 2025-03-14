type Board = {
    id: string;
    name: string;
    board_kind: string;
    description: string;
    state: string;
    board_folder_id: string;
    workspace: {
      name: string;
    };
    creator: {
      id: string;
      name: string;
    };
  };
  

type MondayBoardsProps = {
    board: Board
    error?: string;
  };

const CreateBoard = ({board} : MondayBoardsProps) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700">
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M13.3334 4L6.00008 11.3333L2.66675 8" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium">Board created: {board && board.name ? board.name: ''}</span>
    </div>
  );
}

export default CreateBoard
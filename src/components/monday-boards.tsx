import {
  Card,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type MondayBoardsProps = {
  boards: Board[]
  error?: string;
};
interface Board {
  id: string;
  name: string;
  description?: string;
  board_kind: 'private' | 'public' | 'share';
  state: 'active' | 'all' | 'archived' | 'deleted';
  board_folder_id?: string;
  permissions: 'assignee' | 'collaborators' | 'everyone' | 'owners';
  items_count?: number;
  tags: {
    color?: string;
  };
  workspace?: {
    name: string;
  };
  workspace_id?: string;
  updated_at?: string;
  communication?: any; // JSON type
  type?: 'board' | 'custom_object' | 'document' | 'sub_items_board';
  url: string;
  item_terminology?: string;
  creator: {
    id: string;
    name: string;
  };
  owners: Array<{
    id: string;
    name: string;
  }>;
  subscribers: Array<{
    id: string;
    name: string;
  }>;
  team_owners?: Array<{
    id: string;
    name: string;
  }>;
  team_subscribers?: Array<{
    id: string;
    name: string;
  }>;
}

export default function MondayBoards({boards}: MondayBoardsProps) {
    if(!boards) {
        return ''
    }
console.log(boards[0])
  return (
    <div className="p-4">
      <p className="font-semibold text-xl mb-4">Found {boards.length} boards:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Card key={board.id} className="flex flex-col gap-2 hover:shadow-lg transition-shadow border-t-2 p-4">
         <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{board.name}</CardTitle>
                {board.state && (
                  <Badge 
                    variant="secondary"
                    className={`capitalize ${
                      board.state === 'active' ? 'bg-green-100 text-green-800' :
                      board.state === 'archived' ? 'bg-amber-100 text-amber-800' :
                      board.state === 'deleted' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {board.state.toLowerCase()}
                  </Badge>
                )}
                
              </div>  <div className="flex flex-wrap gap-2">
                {board.board_kind && (
                  <Badge variant="outline" className="capitalize">
                    {board.board_kind.toLowerCase()}
                  </Badge>
                )}
                {board.items_count !== undefined && (
                  <Badge variant="outline">
                    {board.items_count} items
                  </Badge>
                )}
                {board.permissions && (
                  <Badge variant="outline" className="capitalize">
                    {board.permissions.toLowerCase()}
                  </Badge>
                )}
              </div>
            

              
            
              {board.workspace?.name && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#0073ea] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 0C3.13 0 0 3.13 0 7C0 10.87 3.13 14 7 14C10.87 14 14 10.87 14 7C14 3.13 10.87 0 7 0ZM7 11.2C4.69 11.2 2.8 9.31 2.8 7C2.8 4.69 4.69 2.8 7 2.8C9.31 2.8 11.2 4.69 11.2 7C11.2 9.31 9.31 11.2 7 11.2Z" fill="white"/>
                      <path d="M7 4.2C5.46 4.2 4.2 5.46 4.2 7C4.2 8.54 5.46 9.8 7 9.8C8.54 9.8 9.8 8.54 9.8 7C9.8 5.46 8.54 4.2 7 4.2Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{board.workspace.name}</span>
                </div>
              )}

              {board.updated_at && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(board.updated_at).toLocaleDateString()}
                </p>
              )}
      
          </Card>
        ))}
      </div>
    </div>
  );
}

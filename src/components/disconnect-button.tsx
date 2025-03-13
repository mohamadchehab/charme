

import { Button } from "./ui/button"
import { disconnect } from "@/app/actions"

const DisconnectButton = () => {
    
    return (
        <form action={disconnect}>
        <Button  variant='outline'>Disconnect</Button>
        </form>
    )
}

export default DisconnectButton
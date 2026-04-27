import { UserButton } from "@clerk/nextjs";

export default function ProfilePage() {
    return  (
        <>
        <div>Clerk Settings:</div>
        <UserButton />
        <hr></hr>
        <div>Notiontab Settings:</div>
        <button>TBA</button>
        </>
    )
}
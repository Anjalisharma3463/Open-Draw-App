import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId;
    console.log("type of room id in page.tsx/[]: ", typeof(roomId));
    const room = Number(roomId);
    return <RoomCanvas roomId={room} />
   
}
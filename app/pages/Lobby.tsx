import {
 useRoomStore
}
from "@/store/useRoomStore";

export default function Lobby(){

 const players =
 useRoomStore(
  state=>state.players
 );

 return(

   <div>

     <h1>Lobby</h1>

     {
      players.map(player=>(
        <div
          key={player.id}
        >
          {player.name}
        </div>
      ))
     }

   </div>

 );

}
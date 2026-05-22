import { create } from "zustand";

interface RoomState {

 roomId:string;

 players:any[];

 setRoomId:(id:string)=>void;

 setPlayers:(players:any[])=>void;
}

export const useRoomStore =
 create<RoomState>((set)=>({

   roomId:"",

   players:[],

   setRoomId:(id)=>
      set({roomId:id}),

   setPlayers:(players)=>
      set({players})

 }));
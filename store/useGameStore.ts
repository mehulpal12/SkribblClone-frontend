import { create } from "zustand";

interface GameStore {

  currentRound:number;

  drawerId:string | null;

  setRound:
  (round:number)=>void;

  setDrawer:
  (id:string)=>void;

}

export const useGameStore =
create<GameStore>((set)=>({

  currentRound:1,

  drawerId:null,

  setRound:(round)=>
    set({
      currentRound:round
    }),

  setDrawer:(id)=>
    set({
      drawerId:id
    })

}));
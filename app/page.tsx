"use client"
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import Home from "./pages/Home";

function App() {

 useEffect(()=>{

   socket.on("connect",()=>{
      console.log(socket.id);
   });

 },[]);

 return (
  <>
  <Home/>
  </>
 );
}

export default App;
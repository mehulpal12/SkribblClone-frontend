"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useRoomStore } from "@/store/useRoomStore";
import { v4 as uuid } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const setRoomId = useRoomStore((state) => state.setRoomId);
  const setPlayers = useRoomStore((state) => state.setPlayers);

  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  
  // UI States for loading state transitions
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    if (savedName) {
      setPlayerName(savedName);
    }

    const savedRoom = localStorage.getItem("roomId");
    const savedPlayerId = localStorage.getItem("playerId");

    if (savedName && savedRoom && savedPlayerId) {
      socket.emit("join_room", {
        roomId: savedRoom,
        playerName: savedName,
        playerId: savedPlayerId,
      });
    }

    socket.on("room_created", (room) => {
      localStorage.setItem("roomId", room.id);
      setRoomId(room.id);
      setPlayers(room.players);
      router.push(`/room/${room.id}`);
    });

    socket.on("joined_room", (room) => {
      localStorage.setItem("roomId", room.id);
      setRoomId(room.id);
      setPlayers(room.players);
      router.push(`/room/${room.id}`);
    });

    socket.on("player_joined", (players) => {
      setPlayers(players);
    });

    socket.on("player_left", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("room_created");
      socket.off("joined_room");
      socket.off("player_joined");
      socket.off("player_left");
    };
  }, [router, setPlayers, setRoomId]);

  const createRoom = () => {
    if (!playerName.trim()) {
      alert("Enter player name");
      return;
    }

    setIsCreating(true);

    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = uuid();
      localStorage.setItem("playerId", playerId);
    }

    localStorage.setItem("playerName", playerName);

    socket.emit("create_room", {
      playerName,
      playerId,
    });
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      alert("Enter player name");
      return;
    }

    if (!joinRoomId.trim()) {
      alert("Enter room id");
      return;
    }

    setIsJoining(true);

    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = uuid();
      localStorage.setItem("playerId", playerId);
    }

    localStorage.setItem("playerName", playerName);
    localStorage.setItem("roomId", joinRoomId);

    socket.emit("join_room", {
      roomId: joinRoomId,
      playerName,
      playerId,
    });
  };

  return (
    <main className="min-h-screen w-full bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40dvw] h-[40dvw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40dvw] h-[40dvw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#131926]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl shadow-black/40 flex flex-col gap-6 z-10"
      >
        {/* Header Block */}
        <div className="text-center space-y-1">
          <motion.h1 
            className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent filter drop-shadow-sm pb-1"
            animate={{ scale: [0.98, 1.01, 1] }}
            transition={{ duration: 0.4 }}
          >
            Skribbl Clone
          </motion.h1>
          <p className="text-sm text-slate-400 font-medium">
            Draw, guess, and compete in real-time
          </p>
        </div>

        {/* Player Profile Setup Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Your Avatar Identity
          </label>
          <div className="relative">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter an awesome nickname..."
              disabled={isCreating || isJoining}
              className="w-full bg-[#1A2333] border border-slate-700/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder:text-slate-500 px-4 py-3.5 rounded-xl outline-none transition-all duration-200 font-medium disabled:opacity-50"
            />
          </div>
        </div>

        {/* Separator / Divider Split */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            Actions
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Options Grid Split Layout */}
        <div className="grid grid-cols-1 gap-5">
          {/* Action Card A: Create New Session */}
          <div className="bg-[#1A2333]/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-400 px-1">
              Host a new lobby for friends
            </div>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={createRoom}
              disabled={isCreating || isJoining}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCreating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Private Room"
              )}
            </motion.button>
          </div>

          {/* Action Card B: Join Existing Session */}
          <div className="bg-[#1A2333]/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-400 px-1">
              Have an invitation code?
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Paste Room ID here"
                disabled={isCreating || isJoining}
                className="flex-1 bg-[#1A2333] border border-slate-700/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-slate-100 placeholder:text-slate-500 px-4 py-2.5 rounded-xl outline-none transition-all duration-200 font-mono text-sm disabled:opacity-50"
              />
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={joinRoom}
                disabled={isCreating || isJoining}
                className="bg-slate-100 hover:bg-white text-slate-900 font-bold py-2.5 px-5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isJoining ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  "Join"
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import Canvas from "@/components/canvas";
import { socket } from "@/lib/socket";

import { useRoomStore } from "@/store/useRoomStore";
import { useGameStore } from "@/store/useGameStore";

interface Player {
  id: string;
  playerId: string;
  name: string;
  score: number;
}

interface ChatMessage {
  playerId: string;
  message: string;
}

interface GamePayload {
  round: number;
  drawerId: string;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const players = useRoomStore((state) => state.players);
  const setPlayers = useRoomStore((state) => state.setPlayers);
  const setRound = useGameStore((state) => state.setRound);
  const setDrawer = useGameStore((state) => state.setDrawer);

  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gameStarting, setGameStarting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Chat scroll anchor hook
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Smoothly auto-scroll to latest chat events
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startGame = useCallback(() => {
    if (!roomId) return;
    if (gameStarting) return;

    setGameStarting(true);

    socket.emit("start_game", {
      roomId,
    });
  }, [roomId, gameStarting]);

  const selectWord = useCallback(
    (word: string) => {
      socket.emit("word_selected", {
        roomId,
        word,
      });

      setWords([]);
    },
    [roomId]
  );

  const submitGuess = useCallback(() => {
    const value = guess.trim();

    if (!value) return;

    socket.emit("guess", {
      roomId,
      guess: value,
    });

    setGuess("");
  }, [guess, roomId]);

  useEffect(() => {
    const handlePlayerJoined = (players: Player[]) => {
      setPlayers(players);
    };

    const handlePlayerLeft = (players: Player[]) => {
      setPlayers(players);
    };

    const handleChooseWord = (options: string[]) => {
      setWords(options);
    };

    const handleGameStarted = ({ round, drawerId }: GamePayload) => {
      setRound(round);
      setDrawer(drawerId);

      setGameStarting(false);
      setGameOver(false);
      setWinner(null);
      setMessages([]);
    };

    const handleRoundStarted = ({ duration }: { duration: number }) => {
      setTimeLeft(duration);
    };

    const handleTimerUpdate = (time: number) => {
      setTimeLeft(time);
    };

    const handleYourWord = (word: string) => {
      setCurrentWord(word);
    };

    const handleChatMessage = (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    };

    const handleCorrectGuess = (data: {
      playerId: string;
      playerName: string;
      pointsEarned: number;
      score: number;
    }) => {
      if (data.playerId === socket.id) {
       
      }

      setMessages((prev) => [
        ...prev,
        {
          playerId: data.playerId,
          message: `🎉 ${data.playerName} guessed correctly! (+${data.pointsEarned})`,
        },
      ]);
    };

    const handleScoreUpdated = (players: Player[]) => {
      setPlayers(players);
    };

    const handleTurnChanged = ({ round, drawerId }: GamePayload) => {
      setRound(round);
      setDrawer(drawerId);

      setWords([]);
      setCurrentWord("");
      setTimeLeft(0);
      setGuess("");
      setMessages([]);
    };

    const handleWordRevealed = ({ word }: { word: string }) => {

    };

    const handleGameOver = ({ players }: { players: Player[] }) => {
      setGameOver(true);

      const sorted = [...players].sort((a, b) => b.score - a.score);

      setWinner(sorted[0]?.name ?? null);
    };

    socket.on("player_joined", handlePlayerJoined);
    socket.on("player_left", handlePlayerLeft);
    socket.on("choose_word", handleChooseWord);
    socket.on("game_started", handleGameStarted);
    socket.on("round_started", handleRoundStarted);
    socket.on("timer_update", handleTimerUpdate);
    socket.on("your_word", handleYourWord);
    socket.on("chat_message", handleChatMessage);
    socket.on("correct_guess", handleCorrectGuess);
    socket.on("score_updated", handleScoreUpdated);
    socket.on("turn_changed", handleTurnChanged);
    socket.on("word_revealed", handleWordRevealed);
    socket.on("game_over", handleGameOver);

    return () => {
      socket.off("player_joined", handlePlayerJoined);
      socket.off("player_left", handlePlayerLeft);
      socket.off("choose_word", handleChooseWord);
      socket.off("game_started", handleGameStarted);
      socket.off("round_started", handleRoundStarted);
      socket.off("timer_update", handleTimerUpdate);
      socket.off("your_word", handleYourWord);
      socket.off("chat_message", handleChatMessage);
      socket.off("correct_guess", handleCorrectGuess);
      socket.off("score_updated", handleScoreUpdated);
      socket.off("turn_changed", handleTurnChanged);
      socket.off("word_revealed", handleWordRevealed);
      socket.off("game_over", handleGameOver);
    };
  }, [setPlayers, setRound, setDrawer]);

  return (
    <main className="min-h-screen w-full bg-[#0B0F19] text-slate-100 flex flex-col antialiased selection:bg-purple-500 selection:text-white">
      {/* Top Application Navigation Bar */}
      <header className="w-full h-16 border-b border-slate-800/80 bg-[#131926]/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Room Code: <span className="text-purple-400 font-bold select-all ml-1">{roomId}</span>
          </h1>
        </div>

        {/* Global Game Status Monitors */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {timeLeft > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm border shadow-lg ${
                  timeLeft <= 10
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-bounce"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
              >
                <span>⏳</span>
                <span>{timeLeft}s</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={startGame}
            disabled={gameStarting}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-xl border border-purple-500/20 disabled:border-transparent shadow-lg shadow-purple-900/10 transition-all duration-150 transform active:scale-98"
          >
            {gameStarting ? "Syncing Setup..." : "Start Game"}
          </button>
        </div>
      </header>

      {/* Primary Dashboard Working Screen Space */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        
        {/* Left Column Section: Dynamic Scoring Board */}
        <section className="lg:col-span-3 xl:col-span-2 bg-[#131926]/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl h-[250px] lg:h-auto overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Lobby Leaders
            </h2>
            <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
              {players.length}P
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full bg-[#1A2333]/40 border border-slate-800/60 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-[#1A2333]/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 border border-slate-700/40">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/5 border border-purple-500/20 px-2 py-1 rounded-md shrink-0">
                    {player.score} pts
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Center Column Section: Main Interactive Canvas Core */}
        <section className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4 h-full relative">
          
          {/* Header Action Banner Area */}
          <div className="w-full bg-[#131926]/60 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-center min-h-[64px] shadow-md z-10">
            <AnimatePresence mode="wait">
              {currentWord ? (
                <motion.div
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 5, opacity: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Your Assigned Masterpiece
                  </span>
                  <div className="text-xl font-black tracking-wide text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {currentWord}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium text-slate-400"
                >
                  Observe the canvas closely to submit your answers...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Core Interactive Canvas Component Wrapper Panel */}
          <div className="flex-1 bg-[#131926]/40 border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden min-h-[400px]">
            <Canvas roomId={roomId} />

            {/* Word Selection Action Overlay State Container */}
            <AnimatePresence>
              {words.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    className="max-w-md w-full bg-[#131926] border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-5"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">Your turn to draw!</h3>
                      <p className="text-xs text-slate-400 mt-1">Select a prompt phrase to begin sketching</p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {words.map((word) => (
                        <motion.button
                          key={word}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => selectWord(word)}
                          className="w-full bg-[#1A2333] hover:bg-[#202B3E] border border-slate-700/60 hover:border-purple-500/50 text-sm font-semibold py-3 px-4 rounded-xl text-slate-200 shadow transition-all duration-150"
                        >
                          {word}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final Game Set Resolution State Overlay Container */}
            <AnimatePresence>
              {gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg z-40 flex flex-col items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-sm w-full bg-gradient-to-b from-[#1D1630] to-[#131926] border border-purple-500/20 p-8 rounded-3xl shadow-2xl text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
                      👑
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                        Game Over!
                      </h2>
                      <p className="text-xs text-slate-400">Lobby tournament finished successfully</p>
                    </div>
                    <div className="bg-[#1A2333]/80 border border-slate-800 p-4 rounded-xl">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                        Match Winner
                      </span>
                      <span className="text-xl font-bold text-slate-100 block mt-1">
                        {winner ?? "No Competitors"}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Column Section: Dedicated Real-time Match Chat Panel */}
        <section className="lg:col-span-3 xl:col-span-3 bg-[#131926]/60 border border-slate-800 rounded-2xl p-4 flex flex-col h-[400px] lg:h-auto shadow-xl overflow-hidden">
          <div className="border-b border-slate-800/80 pb-3 shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Live Feed Log
            </h2>
          </div>

          {/* Dynamic Feed Roll List Area */}
          <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1 custom-scrollbar text-sm">
            {messages.map((msg, index) => {
              const isSystemMessage = msg.message.includes("guessed correctly!");
              return (
                <div
                  key={index}
                  className={`p-2.5 rounded-xl border leading-relaxed break-words ${
                    isSystemMessage
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium"
                      : "bg-[#1A2333]/30 border-slate-800 text-slate-300"
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Integrated Interactive User Chat Command Bar Section */}
          <div className="flex gap-2 shrink-0 pt-1 border-t border-slate-800/60">
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitGuess();
                }
              }}
              placeholder="Submit guess here..."
              className="flex-1 bg-[#1A2333] border border-slate-700/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder:text-slate-500 px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            />
            <button
              onClick={submitGuess}
              className="bg-slate-100 hover:bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow transition-colors"
            >
              Send
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
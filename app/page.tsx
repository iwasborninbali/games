import TicTacToe from "./components/TicTacToe";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-12 flex items-center justify-center">
      <main className="w-full max-w-3xl">
        <TicTacToe />
      </main>
    </div>
  );
}

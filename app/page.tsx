import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <main className="max-w-2xl w-full flex flex-col items-center text-center">
        <h1 className="font-serif text-6xl md:text-8xl text-text-primary mb-4">
          Slate
        </h1>
        
        <p className="text-xl md:text-2xl text-text-secondary mb-12">
          La tua settimana, a blocchi.
        </p>
        
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg rounded-md font-medium text-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
        >
          Inizia gratis
          <ArrowRight className="w-5 h-5" />
        </Link>
        
        <div className="mt-16 text-text-secondary text-sm">
          Organizza studio, lavoro e lezioni in una griglia visiva
        </div>
      </main>
    </div>
  );
}
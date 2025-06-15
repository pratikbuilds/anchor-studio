"use client";

interface WelcomeScreenProps {
  onInitialize: () => void;
}

export function WelcomeScreen({ onInitialize }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to Anchor Studio</h2>
        <p className="text-muted-foreground mb-6">
          Get started by initializing your first Anchor program
        </p>
        <button
          onClick={onInitialize}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Initialize Program
        </button>
      </div>
    </div>
  );
}

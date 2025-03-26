import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <h1 className="text-4xl font-bold mb-4">Welcome to Launch Feed</h1>
      <p className="text-lg mb-8">
        Your one-stop destination for launch information
      </p>
      <Button>Get Started</Button>
    </div>
  );
}

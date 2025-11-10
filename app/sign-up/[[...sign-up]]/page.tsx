import { SignUp } from "@clerk/nextjs";
import { DarkBackground } from "@/components/DarkBackground";

export default function Page() {
  return (
    <DarkBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 font-syne">
              Get Started
            </h1>
            <p className="text-gray-400">
              Create your account to start remembering
            </p>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white/10 backdrop-blur-xl border border-white/20",
              },
            }}
          />
        </div>
      </div>
    </DarkBackground>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Github, Globe } from "lucide-react";

import { contractCodeUrl } from "@/lib/celoscan";

const CORE = "0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-12">
      <div className="glass rounded-3xl px-6 py-6 text-xs text-muted-foreground">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="Claudelance"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="font-display text-[0.95rem] font-bold text-foreground">Claudelance</p>
              <p className="mt-0.5">
                © {new Date().getFullYear()} · Built for{" "}
                <Link
                  href="https://celo.org/proof-of-ship"
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:underline hover:text-foreground"
                >
                  Celo Proof of Ship #8
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Link
              href="https://github.com/yeheskieltame/claudelance"
              target="_blank"
              rel="noreferrer"
              className="touch-target inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </Link>
            <Link href="/revenue" className="touch-target inline-flex items-center rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors">Stats</Link>
            <Link href="/about" className="touch-target inline-flex items-center rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors">About</Link>
            <Link href="/docs" className="touch-target inline-flex items-center rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors">Docs</Link>
            <a href="mailto:support@claudelance.xyz" className="touch-target inline-flex items-center rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors">Support</a>
            <Link href="/terms" className="touch-target inline-flex items-center rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="touch-target inline-flex items-center rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors">Privacy</Link>
            <Link
              href={contractCodeUrl(CORE)}
              target="_blank"
              rel="noreferrer"
              className="touch-target inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" /> Contract
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

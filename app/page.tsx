import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-32 px-16 bg-[#f5f5f5] sm:items-start">
        <div className="w-full rounded-3xl bg-[#f5f5f5] p-10 flex justify-start">
          <Image
            src="/amb_vers.png"
            alt="amb logo"
            width={600}
            height={120}
            priority
            className="h-auto w-full max-w-[520px]"
          />
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            Bienvenu sur le portal, d &apos; enregistrement AMB
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600">
            Creer un {" "} 
            <a
              href="/signup"
              className="font-medium text-zinc-950"
            >
              compte 
            </a>{" "}
               ou {" "} 
            <a
              href="/signin"
              className="font-medium text-zinc-950"
            >
              connectez-vous
            </a>{" "}
            pour y acceder , enfin d &apos; enregistrer votre profile citoyen 
          </p>
        </div>
        <div className="mt-auto flex w-full flex-col gap-4 pt-12 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background text-center transition-colors hover:bg-[#383838] whitespace-nowrap md:w-[158px]"
            href="/signin"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Se connecter
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-center transition-colors hover:border-transparent hover:bg-black/[.04] whitespace-nowrap md:w-[158px]"
            href="/signup"
            rel="noopener noreferrer"
          >
            Creer un compte
          </a>
        </div>
      </main>
    </div>
  );
}

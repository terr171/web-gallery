import React from "react";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import Link from "next/link";
import CreateButton from "@/features/project/components/CreateButton";
import { auth } from "@/auth";

import MakeMeAdminButton from "@/components/shared/MakeMeAdminButton";
const Page = async () => {
  const session = await auth();

  return (
    <section className="h-full w-full py-12 md:py-24 lg:py-32 ">
      <div className="container mx-auto px-4 md:px-6 h-full flex flex-col justify-center">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Create, Share, and Discover Code
              </h1>
              <p className="max-w-[600px] text-muted-foreground">
                Web-Gallery is the platform where developers connect,
                collaborate, and showcase their code with the world.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row items-center">
              <CreateButton customClass="gap-1.5" />
              <Link href={"/explore"}>
                <Button variant="outline" size="lg" className="gap-1.5">
                  <Share2 className="h-4 w-4" />
                  Explore Gallery
                </Button>
              </Link>
              {session && <MakeMeAdminButton />}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg border bg-background p-2">
              <pre className="text-xs md:text-sm overflow-auto h-full bg-slate-700 rounded-md p-4 text-slate-300 font-mono">
                <code>{`function WebGallery() {
  const [code, setCode] = useState("");
  const [shared, setShared] = useState(false);
  
  const shareCode = async () => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      setShared(true);
      return data.shareUrl;
    } catch (error) {
      console.error('Failed to share code', error);
    }
  };

  return (
    <div className="web-gallery">
      <CodeEditor 
        value={code}
        onChange={setCode}
        language="javascript"
        theme="dark"
      />
      <Button onClick={shareCode}>
        Share with the world
      </Button>
      {shared && (
        <div className="success-message">
          Your code is now live in the gallery!
        </div>
      )}
    </div>
  );
}`}</code>
              </pre>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground text-center">
        Join other developers already using Web-Gallery
      </p>
    </section>
  );
};
export default Page;

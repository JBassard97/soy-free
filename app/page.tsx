import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <h1 className="text-2xl font-bold">Soy Checker</h1>
      <Link href="/barcode">
        <Button className="mt-4">Check Product by Barcode</Button>
      </Link>
    </main>
  );
}

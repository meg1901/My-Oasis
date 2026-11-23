import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="mb-2 text-sm font-bold uppercase text-teal">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold md:text-5xl">{title}</h1>
      {children && <div className="mt-3 max-w-3xl text-lg text-muted-foreground">{children}</div>}
    </div>
  );
}
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 md:p-6", className)}>
      {children}
    </section>
  );
}
export function SourceNote({ source }: { source: "curated" | "template" }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Info className="size-3.5 shrink-0" />
      {source === "template"
        ? "From your activity and chosen moments"
        : "Original words from OASIS"}
    </p>
  );
}

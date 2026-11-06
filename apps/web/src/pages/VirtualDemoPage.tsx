import { CrashDemo, InpDemo, VirtualDemo } from "@/features/virtual-demo";

// A teaching page: the same long list with and without virtualisation, plus the error-boundary and INP demos.
export default function VirtualDemoPage() {
  return (
    <section>
      <h1>Virtualisation demo</h1>
      <VirtualDemo />
      <CrashDemo />
      <InpDemo />
    </section>
  );
}

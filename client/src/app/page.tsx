import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "../components/product/ProductGrid";
import { getFeaturedProducts } from "@/lib/api";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background">
        {/* Clean light background image — subtle texture, not a focal photo */}
        <Image
          src="https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.95]"
          aria-hidden="true"
        />

        {/* Fade the bg image back into the solid background at the edges so text stays crisp */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

        {/* Topographic contour-line overlay — signature element, sits above the bg image */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <path d="M-50 120 Q 200 40, 450 120 T 950 120 T 1350 120" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
          <path d="M-50 220 Q 220 100, 480 220 T 980 220 T 1380 220" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
          <path d="M-50 320 Q 240 160, 510 320 T 1010 320 T 1410 320" stroke="currentColor" className="text-primary" strokeWidth="1.5" />
          <path d="M-50 420 Q 260 220, 540 420 T 1040 420 T 1440 420" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
          <path d="M-50 520 Q 280 280, 570 520 T 1070 520 T 1470 520" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
          <path d="M-50 620 Q 300 340, 600 620 T 1100 620 T 1500 620" stroke="currentColor" className="text-primary" strokeWidth="1.5" />
          <path d="M-50 720 Q 320 400, 630 720 T 1130 720 T 1530 720" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
        </svg>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 items-center">

            {/* Left: Typography-led content */}
            <div className="w-full lg:w-[58%] space-y-8">
              <div className="flex items-baseline gap-3">
                {/* <span className="font-heading text-sm font-bold text-primary tabular-nums">01 —</span> */}
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Spring Collection
                </span>
              </div>

              <h1 className="font-heading text-foreground leading-[0.95]">
                <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                  Everyday
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary">
                  essentials.
                </span>
                <span className="block mt-2 text-2xl sm:text-3xl font-medium text-muted-foreground tracking-tight">
                  Exceptionally made.
                </span>
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed">
                Handpicked pieces built to last, priced fairly, and shipped fast. No filler — just what&apos;s worth owning.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                <Link href="/products">
                  <Button size="lg" className="gap-2 text-base font-semibold">
                    <ShoppingBag className="h-5 w-5" />
                    Shop All Products
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-border text-foreground hover:bg-secondary"
                  >
                    Browse Categories
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative connector — bridges the gap, continues the topology motif */}
            <div className="hidden lg:flex w-10 shrink-0 h-64 items-center justify-center relative">
              <div className="h-2/3 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <span className="absolute h-2 w-2 rounded-full bg-primary ring-4 ring-primary/15" />
            </div>

            {/* Right: Decorated product grid */}
            <div className="w-full lg:w-[80%]">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-[420px] sm:min-h-[480px]">

                {/* Main product image — anchors the grid, spans full height */}
                <div className="relative row-span-2 rounded-3xl overflow-hidden border border-border shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1920"
                    alt="Featured product collection"
                    fill
                    priority
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>

                {/* Top-right: contour-pattern accent tile */}
                <div className="relative rounded-3xl overflow-hidden border border-border bg-primary/10">
                  <svg
                    className="absolute inset-0 h-full w-full opacity-30"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="xMidYMid slice"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M-20 40 Q 50 10, 110 40 T 240 40" stroke="currentColor" className="text-primary" strokeWidth="2" />
                    <path d="M-20 80 Q 60 40, 130 80 T 260 80" stroke="currentColor" className="text-primary" strokeWidth="2" />
                    <path d="M-20 120 Q 70 70, 150 120 T 280 120" stroke="currentColor" className="text-primary" strokeWidth="2" />
                    <path d="M-20 160 Q 80 100, 170 160 T 300 160" stroke="currentColor" className="text-primary" strokeWidth="2" />
                  </svg>
                  <div className="relative flex h-full flex-col items-start justify-end p-4">
                    <span className="font-heading text-3xl font-extrabold text-primary leading-none">4.9</span>
                    <span className="text-xs font-medium text-foreground/70 mt-1">Avg. customer rating</span>
                  </div>
                </div>

                {/* Bottom-right: shipping stat card */}
                <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-lg p-4 flex flex-col justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground leading-none">Free shipping</p>
                    <p className="text-xs text-muted-foreground mt-1">On orders over $50</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS GRID SECTION ───────────────────────────── */}
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold">Featured Products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Handpicked recommendations for you</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            {products.length} Items
          </span>
        </div>

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCounterAnimation } from "@/hooks/useCounterAnimation";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import gallerySatsang from "@/assets/gallery-satsang.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";

export default function AboutPage() {
  const seekers = useCounterAnimation(500);
  const satsangs = useCounterAnimation(100);
  const retreats = useCounterAnimation(12);

  return (
    <AnimatedPage>
      <section className="section-odd relative pt-32 pb-14">
        <div className="sia-container">
          <h1 className="sia-h1">The Source of Our Work</h1>
        </div>
        <div className="pointer-events-none absolute right-10 top-28 text-8xl text-primary/10">
          ✺
        </div>
      </section>

      <section className="section-even py-16">
        <div className="sia-container space-y-14">
          {[gallerySatsang, retreatMountain, lotusDawn].map((image, index) => (
            <article key={image} className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}>
                <img
                  src={image}
                  alt="SIA pillar"
                  className="aspect-[16/10] w-full rounded-3xl object-cover"
                  loading="lazy"
                  width={1200}
                  height={800}
                />
              </div>
              <div className={index % 2 === 0 ? "order-2" : "order-2 lg:order-1"}>
                <h2 className="sia-h2">
                  {["Guided Awakening", "Living Philosophy", "Sacred Community"][index]}
                </h2>
                <p className="mt-4 sia-body">
                  We hold a grounded, direct, and heart-centered space where insight becomes
                  embodied life.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-odd py-16">
        <div className="sia-container grid gap-5 md:grid-cols-3">
          {[
            [seekers, "Seekers Guided"],
            [satsangs, "Satsangs Hosted"],
            [retreats, "Retreat Programs"],
          ].map(([value, label]) => (
            <article key={label as string} className="sia-card text-center">
              <p className="font-display text-5xl italic text-primary">{value as number}+</p>
              <p className="mt-2 text-sm uppercase tracking-[0.07em] text-muted-foreground">
                {label as string}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-even py-16">
        <div className="sia-container overflow-hidden rounded-3xl border border-gold/60 bg-primary p-10 text-primary-foreground">
          <p className="mx-auto max-w-4xl text-center font-display text-4xl italic leading-tight md:text-5xl">
            “Our philosophy is simple: awareness first, action second. When awareness deepens, life
            aligns.”
          </p>
        </div>
      </section>

      <section className="section-odd py-16">
        <div className="sia-container space-y-8">
          <h2 className="sia-h2">Stay Connected</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Instagram", "@shiftingintoawareness", "42K"],
              ["YouTube", "Shifting Into Awareness", "61K"],
              ["Facebook", "SIA Community", "18K"],
              ["WhatsApp", "Satsang Circle", "9K"],
            ].map(([name, handle, followers]) => (
              <article key={name as string} className="sia-card">
                <h3 className="text-lg font-semibold text-primary">{name as string}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{handle as string}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.06em] text-primary">
                  {followers as string} followers
                </p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {new Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}

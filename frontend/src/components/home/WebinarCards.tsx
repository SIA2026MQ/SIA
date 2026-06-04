import { useSiteContent } from "@/hooks/useSiteContent";

export function WebinarCards() {
  const { webinars } = useSiteContent();

  return (
    <section id="satsang" className="section-even py-20 bg-[#f7e7e7]">
      <div className="sia-container text-center space-y-10">
        <div className="reveal-on-scroll">
          <h2 className="sia-h2 text-center text-3xl md:text-5xl">Live Webinars & Upcoming Satsangs</h2>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022]">
              Welcome to the Pathless Path
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {webinars.map((webinar) => (
            <article key={webinar.id} className="sia-card reveal-on-scroll rounded-2xl">
              <h3 className="sia-h3 text-3xl">{webinar.title}</h3>
              <p className="mt-2 text-sm uppercase tracking-[0.08em] text-muted-foreground">
                {webinar.date}
              </p>
              <p className="mt-4 sia-body">{webinar.description}</p>
              <button
                className="sia-button-primary mt-6 w-full"
                aria-label={`Register for ${webinar.title}`}
              >
                Register Now
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
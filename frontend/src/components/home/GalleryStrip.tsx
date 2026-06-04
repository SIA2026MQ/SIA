import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import gallerySatsang from "@/assets/gallery-satsang.jpg";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";
import heroMandala from "@/assets/hero-mandala.jpg";
import scriptureStudy from "@/assets/scripture-study.jpg";

const slides = [
  { src: gallerySatsang, alt: "Satsang gathering" },
  { src: lotusDawn, alt: "Lotus at dawn" },
  { src: retreatMountain, alt: "Mountain retreat" },
  { src: heroMandala, alt: "Mandala sanctuary" },
  { src: scriptureStudy, alt: "Scripture and beads" },
];

export function GalleryStrip() {
  return (
    <section className="section-odd py-16">
      <div className="sia-container">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={1.2}
          speed={5000}
          loop
          autoplay={{ delay: 0, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4.2 },
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.alt}>
              <div className="group overflow-hidden rounded-2xl">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105 group-hover:grayscale-0 grayscale-[20%]"
                  loading="lazy"
                  width={1200}
                  height={800}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

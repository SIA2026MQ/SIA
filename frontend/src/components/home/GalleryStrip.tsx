import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";



const slides = [
  { src: "https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/gallery-satsang.jpg", alt: "Satsang gathering" },
  { src: "https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/lotus-dawn.jpg", alt: "Lotus at dawn" },
  { src: "https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/retreat-mountain.jpg", alt: "Mountain retreat" },
  { src: "https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/hero-mandala.jpg", alt: "Mandala sanctuary" },
  { src: "https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/scripture-study.jpg", alt: "Scripture and beads" },
];

export function GalleryStrip() {
  return (
    <section className="section-odd py-16">
      <div className="sia-container">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={2}
          speed={5000}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 3.2,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 4.2,
              spaceBetween: 16,
            },
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
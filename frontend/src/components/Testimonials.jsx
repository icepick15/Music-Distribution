import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: 'KAPITAL IFEX',
    image: 'https://via.placeholder.com/200x200.png?text=KAPITAL+IFEX',
    quote: "They’ve been a game-changer for me. Their platform is seamless, and their speed is unmatched.",
  },
  {
    name: 'Yemi Alade',
    image: 'https://via.placeholder.com/200x200.png?text=Yemi+Alade',
    quote: "Their platform is intuitive, their team is responsive, and they helped me reach new heights.",
  },
  {
    name: 'Tito Da.fire',
    image: 'https://via.placeholder.com/200x200.png?text=Tito+Da.fire',
    quote: "Peace of mind, full control, and transparent royalties — what more could I ask for?",
  },
  {
    name: 'Testo',
    image: 'https://via.placeholder.com/200x200.png?text=Testo',
    quote: "Their support and tools made me feel like a priority. Truly an elite experience.",
  },
  {
    name: 'Lamole',
    image: 'https://via.placeholder.com/200x200.png?text=Lamole',
    quote: "From distribution to analytics, every step was smooth and professional.",
  },
];

const Testimonials = () => {
  return (
    <div className="bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] py-20 px-4 md:px-10">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-16">
        What Our Artists Say
      </h2>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={40}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="max-w-7xl mx-auto"
      >
        {testimonials.map((item, i) => (
          <SwiperSlide key={i}>
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 h-full flex flex-col items-center text-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-28 h-28 object-cover rounded-full border-4 border-blue-600 mb-6"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-3">{item.name}</h3>
              <p className="text-gray-600 text-base leading-relaxed font-medium italic">
                “{item.quote}”
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Swiper pagination dot styling */}
      <style>{`
        .swiper-pagination-bullet {
          background: #ccc;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default Testimonials;

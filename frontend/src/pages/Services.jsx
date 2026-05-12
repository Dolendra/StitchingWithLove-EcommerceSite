import { useState } from "react";
import { Scissors, Shirt, Baby, PartyPopper, Diamond } from "lucide-react";

const Services = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const services = [
    {
      id: 1,
      title: "Bridal Wear",
      desc: "Elegant and custom-made bridal gowns tailored to perfection.",
      icon: <Diamond className="w-8 h-8 text-purple-600" />,
      subcategories: ["Wedding Gowns", "Reception Dresses", "Veils & Dupattas"],
    },
    {
      id: 2,
      title: "Designer Blouses",
      desc: "Trendy blouses with unique patterns and embroidery.",
      icon: <Shirt className="w-8 h-8 text-purple-600" />,
      subcategories: ["Saree Blouses", "Crop Tops", "Embroidered Blouses"],
    },
    {
      id: 3,
      title: "Kids Wear",
      desc: "Comfortable and stylish clothing for kids of all ages.",
      icon: <Baby className="w-8 h-8 text-purple-600" />,
      subcategories: ["Frocks", "School Uniforms", "Ethnic Wear"],
    },
    {
      id: 4,
      title: "Party Wear",
      desc: "Glamorous dresses designed for parties and special occasions.",
      icon: <PartyPopper className="w-8 h-8 text-purple-600" />,
      subcategories: ["Evening Gowns", "Cocktail Dresses", "Lehengas"],
    },
    {
      id: 5,
      title: "Alterations",
      desc: "Professional adjustments and fittings for your clothes.",
      icon: <Scissors className="w-8 h-8 text-purple-600" />,
      subcategories: ["Pant Hemming", "Zip Replacement", "Size Adjustments"],
    },
  ];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="text-center py-12 bg-purple-50">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-700">
          Services
        </h2>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          I provide a wide range of tailoring services with attention to detail
          and high-quality craftsmanship.
        </p>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-purple-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              {/* Icon + Title + Desc */}
              <div className="flex justify-center">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mt-4">
                {service.title}
              </h3>
              <p className="text-gray-600 text-center mt-2">{service.desc}</p>

              {/* Subcategories */}
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="mt-4 w-full text-sm text-purple-700 font-medium hover:underline"
              >
                {openIndex === index ? "Hide Details ▲" : "View Details ▼"}
              </button>

              {openIndex === index && (
                <ul className="mt-3 pl-5 text-gray-700 list-disc space-y-1 text-sm">
                  {service.subcategories.map((sub, subIndex) => (
                    <li key={subIndex}>{sub}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;

const Portfolio = () => {
  // Sample works (replace with real images later)
  const works = [
    { id: 1, title: "Bridal Gown", img: "/images/bridal.avif" },
    { id: 2, title: "Designer Blouse", img: "/images/full-sleeve-blouse-1.jpg" },
    { id: 3, title: "Kids Wear", img: "/images/kids.avif" },
    { id: 4, title: "Western Dress", img: "/images/western.webp" },
    { id: 5, title: "Ethnic Wear", img: "/images/ethnicwear.webp" },
    { id: 6, title: "Party Outfit", img: "/images/partywear.webp" },
  ];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="text-center py-12 bg-purple-50">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-700">
          My Portfolio
        </h2>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          A collection of my tailoring works – from elegant bridal dresses to
          everyday stylish outfits.
        </p>
      </section>

      {/* Gallery */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {works.map((work) => (
            <div
              key={work.id}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              <img
                src={work.img}
                alt={work.title}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {work.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Portfolio;

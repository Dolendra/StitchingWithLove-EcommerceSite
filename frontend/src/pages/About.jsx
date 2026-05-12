import React from 'react';

const About = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-slate-50 py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* Left - Image with Animation */}
          <div className="flex-shrink-0 w-[300px] md:w-[400px]">
            <img
              src="/images/amma.jpeg"
              alt="A passionate tailor, Supraja, at her workspace"
              className="w-full rounded-2xl shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
            />
          </div>

          {/* Right - Text */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700">
              About Me
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed text-lg">
              Hi, I’m <span className="font-semibold text-indigo-800">Supraja</span>, a passionate tailor
              who loves creating clothes that make people feel confident and
              comfortable.
              <br /><br />
              From a young age, I enjoyed working with fabrics, experimenting
              with designs, and crafting outfits for family and friends. Over
              time, tailoring became more than just a skill — it became my
              identity.
              <br /><br />
              Whether it’s elegant bridal wear, stylish dresses, or simple
              alterations, I believe every stitch carries a story and a touch of
              love. My goal is to bring your ideas to life with the perfect fit
              and design.
            </p>
            <p className="mt-6 text-indigo-600 font-semibold text-lg italic">
              "Stitching Dreams, One Outfit at a Time."
            </p>
          </div>
        </div>
      </section>

      {/* Skills / Highlights Section with Animation */}
      <section className="py-16 bg-white text-center">
        <h3 className="text-3xl font-semibold text-gray-800 mb-10">What I Offer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          
          {/* Card 1 */}
          <div className="p-8 bg-indigo-50 rounded-2xl shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-2">
            <h4 className="text-xl font-bold text-indigo-700">👗 Custom Stitching</h4>
            <p className="mt-3 text-gray-600">Outfits designed to match your unique style and personality.</p>
          </div>
          
          {/* Card 2 */}
          <div className="p-8 bg-amber-50 rounded-2xl shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-2">
            <h4 className="text-xl font-bold text-amber-700">✂️ Alterations</h4>
            <p className="mt-3 text-gray-600">Perfect fit adjustments for your favorite clothes.</p>
          </div>
          
          {/* Card 3 */}
          <div className="p-8 bg-indigo-50 rounded-2xl shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-2">
            <h4 className="text-xl font-bold text-indigo-700">💍 Bridal Wear</h4>
            <p className="mt-3 text-gray-600">Special outfits for weddings and grand occasions.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;


// /images/amma.jpeg
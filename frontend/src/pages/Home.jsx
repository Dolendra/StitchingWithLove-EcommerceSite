const Home = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-purple-50 min-h-[80vh] flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-6 md:px-16 text-center md:text-left">
        
        {/* Left Content */}
        <div className="max-w-xl mt-6 md:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-700 leading-snug md:leading-tight">
            Custom Tailoring <br /> Made Just for You ✂️
          </h1>
          <p className="mt-4 text-gray-600 text-base sm:text-lg">
            Perfect fits, elegant designs, and personalized fashion — crafted with love and precision.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="/products">
              <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow-md">
                Shop Now
              </button>
            </a>
            <a href="/book">
              <button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl shadow-md">
                Book Appointment
              </button>
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src="/images/home3.webp"
            alt="Tailoring Work"
            className="w-[400px] sm:w-[450px] md:w-[700px] my-5 rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-12 bg-white text-center px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-8">
          Why Choose TailorMade?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-purple-100 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-purple-700">👗 Custom Designs</h3>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">Unique outfits tailored to your exact style.</p>
          </div>
          <div className="p-6 bg-amber-100 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-amber-600">✂️ Perfect Fitting</h3>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">Every stitch measured to fit you perfectly.</p>
          </div>
          <div className="p-6 bg-purple-100 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-purple-700">💍 Bridal & Occasion Wear</h3>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">Special designs for weddings & celebrations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

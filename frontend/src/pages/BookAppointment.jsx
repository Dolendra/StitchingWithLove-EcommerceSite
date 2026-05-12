import { useState } from "react";
import { Calendar, MessageCircle } from "lucide-react";

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Your WhatsApp Number (with country code, without +)
    const phoneNumber = "919494241849";

    const text = `New Appointment Request 👗
    --------------------------
    👤 Name: ${formData.name}
    📞 Phone: ${formData.phone}
    🛠 Service: ${formData.service}
    📅 Date: ${formData.date}
    💬 Message: ${formData.message}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      text
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="text-center py-12 bg-purple-50">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-700">
          Book an Appointment
        </h2>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Fill in your details below to schedule an appointment with us.
        </p>
      </section>

      {/* Form Section */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-purple-50 p-8 rounded-2xl shadow-lg"
        >
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Service */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Service
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a Service</option>
              <option value="Bridal Wear">Bridal Wear</option>
              <option value="Designer Blouse">Designer Blouse</option>
              <option value="Kids Wear">Kids Wear</option>
              <option value="Party Wear">Party Wear</option>
              <option value="Alterations">Alterations</option>
            </select>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Book via WhatsApp
          </button>
        </form>
      </section>
    </div>
  );
};

export default BookAppointment;

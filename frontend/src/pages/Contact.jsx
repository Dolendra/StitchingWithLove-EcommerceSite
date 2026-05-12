import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // WhatsApp Integration (send message)
    const whatsappNumber = "919494241849"; // her WhatsApp number with country code
    const message = `Hello, my name is ${formData.name}. My email is ${formData.email}. Message: ${formData.message}`;
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="bg-cream min-h-screen flex flex-col items-center py-25 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">Contact Me</h2>

      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
          <h3 className="text-2xl font-semibold text-secondary">Get in Touch</h3>
          <p className="text-gray-700">Feel free to reach out for tailoring services, custom orders, or collaborations!</p>

          <div className="flex items-center space-x-3">
            <FaPhoneAlt className="text-primary" />
            <span className="text-gray-800">+91 98765 43210</span>
          </div>

          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-primary" />
            <span className="text-gray-800">stitchingwithlove@gmail.com</span>
          </div>

          <div className="flex items-center space-x-3">
            <FaMapMarkerAlt className="text-primary" />
            <span className="text-gray-800">123 Street, Hyderabad, India</span>
          </div>

          <a
            href="https://wa.me/919494241849"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            <FaWhatsapp className="mr-2" /> Chat on WhatsApp
          </a>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-2xl font-semibold text-secondary">Send a Message</h3>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary bg-green-500 text-white py-2 rounded-lg hover:bg-secondary transition cursor-pointer"
          >
            Send via WhatsApp
          </button>
        </form>
      </div>

      {/* Optional Google Map Embed */}
      <div className="mt-10 w-full max-w-4xl">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15230.340973837736!2d78.31164779185083!3d17.383679613796247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb94ef6bd240dd%3A0x56923cc994ee6a56!2sGandipet%2C%20Telangana%20500075!5e0!3m2!1sen!2sin!4v1755545125027!5m2!1sen!2sin"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

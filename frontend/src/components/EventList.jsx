import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("❌ Error fetching events:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");

    // Navigate to confirmation page with email and event as query params
    navigate(`/confirm?email=${encodeURIComponent(email)}&eventLink=${encodeURIComponent(selectedEvent.link)}&eventId=${selectedEvent.id}`);
  };

  return (
    <div className="p-6 min-h-screen text-gray-100 bg-[#0e0e10]">
      <h1 className="text-3xl font-bold mb-8 text-center text-white tracking-wide">
        🎉 Sydney Events
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-[#1a1a1d] border border-[#2c2c30] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-600"
          >
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">
              {event.title}
            </h2>
            <p className="text-sm text-gray-400 mb-1">📍 {event.location}</p>
            <p className="text-sm text-gray-400 mb-4">📅 {event.date}</p>
            <button
              onClick={() => {
                setSelectedEvent(event);
                setShowForm(true);
              }}
              className="inline-block bg-gradient-to-r from-zinc-600 to-gray-600 font-bold text-amber-50 px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <p className="text-white">Get Tickets</p>
            </button>
          </div>
        ))}
      </div>

      {showForm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1d] border border-gray-700 rounded-xl p-6 w-full max-w-md relative shadow-2xl">
            <h2 className="text-xl text-white font-bold mb-4">
              Enter your email to continue
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white mb-4"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Continue
              </button>
            </form>
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

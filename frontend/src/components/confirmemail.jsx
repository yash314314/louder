import { useSearchParams } from "react-router-dom";


export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const eventLink = params.get("eventLink");
  const eventId = params.get("eventId");

  const handleAgree = async () => {
    try {
      await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, eventId }),
      });
      window.location.href = eventLink;
    } catch (err) {
        console.error("❌ Error saving email:", err);
      alert("Error saving email.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0e0e10] text-white p-6">
      <div className="max-w-md bg-[#1a1a1d] p-8 rounded-xl border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">📧 Email Confirmation</h2>
        <p className="mb-4">
          You entered: <span className="font-mono">{email}</span>
        </p>
        <p className="mb-6 text-sm text-gray-400">
          By clicking "I Agree", you consent to storing your email and receiving updates about events.
        </p>
        <button
          onClick={handleAgree}
          className="bg-green-600 hover:bg-green-700 transition px-6 py-2 rounded text-white font-semibold"
        >
          ✅ I Agree and Continue
        </button>
      </div>
    </div>
  );
}

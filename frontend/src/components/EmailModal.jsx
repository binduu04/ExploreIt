import React, { useState } from "react";
import { X, Send } from "lucide-react";

const EmailModal = ({ isOpen, trip, onClose, user }) => {
  const [emailForm, setEmailForm] = useState({ email: "", message: "" });
  const [emailLoading, setEmailLoading] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setEmailForm({ email: "", message: "" });
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/send-trip-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tripData: trip,
            recipientEmail: emailForm.email,
            senderName: user?.displayName || user?.email || "ExploreIt User",
            senderMessage: emailForm.message,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Trip details sent successfully!");
        onClose();
      } else {
        alert(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      alert("Failed to send email. Please check your connection.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEmailForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Send Trip via Email
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <h4 className="font-semibold text-indigo-800 mb-2">
            {trip.destination}
          </h4>
          <p className="text-sm text-indigo-600">
            {trip.duration} {trip.duration === 1 ? "day" : "days"}
            {trip.budget && ` • ${trip.budget} budget`}
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              required
              value={emailForm.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="friend@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={emailForm.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="Hey! Check out this amazing trip plan I created..."
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={emailLoading}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {emailLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {emailLoading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;
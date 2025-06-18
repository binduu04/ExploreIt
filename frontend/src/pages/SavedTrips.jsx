import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {ArrowLeft,Plus,MapPin,Calendar,Trash2,Eye,Heart,User,LogOut,Search,Filter,Grid,List,Globe,Star,Clock,DollarSign,Share2,Bookmark,Plane,SortAsc,SortDesc,MoreVertical,Edit,Copy,Archive,MessageCircle,Mail,Send,X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import TripChatPanel, { TripChatButton } from "../components/TripChatPanel";
import EmailModal from "../components/EmailModal"; // Import the EmailModal component

const SavedTrips = () => {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const { savedTrips, deleteTrip, setCurrentTrip } = useTrip();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, destination, duration
  const [filterBudget, setFilterBudget] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTripForChat, setSelectedTripForChat] = useState(null);

  // Simplified email modal state - only need to track if it's open and which trip
  const [emailModal, setEmailModal] = useState({ isOpen: false, trip: null });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSendEmail = async (trip) => {
    setEmailModal({ isOpen: true, trip });
  };

  const handleCloseEmailModal = () => {
    setEmailModal({ isOpen: false, trip: null });
  };

  const handleOpenChat = (trip) => {
    console.log("Opening chat for trip:", trip); // Debug log
    setSelectedTripForChat(trip);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    console.log("Closing chat"); // Debug log
    setChatOpen(false);
    setSelectedTripForChat(null);
  };

  const handleDeleteTrip = async (tripId) => {
    setDeleteLoading(tripId);
    const success = await deleteTrip(tripId);
    setDeleteLoading(null);

    if (!success) {
      alert("Failed to delete trip. Please try again.");
    }
  };

  const handleViewTrip = (trip) => {
    setCurrentTrip(trip);
    navigate("/viewtrip");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSelectTrip = (tripId) => {
    const newSelected = new Set(selectedTrips);
    if (newSelected.has(tripId)) {
      newSelected.delete(tripId);
    } else {
      newSelected.add(tripId);
    }
    setSelectedTrips(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedTrips.size === filteredTrips.length) {
      setSelectedTrips(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedTrips(new Set(filteredTrips.map((trip) => trip.firestoreId)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTrips.size} selected trips?`)) {
      for (const tripId of selectedTrips) {
        await handleDeleteTrip(tripId);
      }
      setSelectedTrips(new Set());
      setShowBulkActions(false);
    }
  };

  const filteredTrips = savedTrips
    .filter((trip) => {
      const matchesSearch =
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.preferences.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBudget =
        filterBudget === "all" || trip.budget === filterBudget;
      return matchesSearch && matchesBudget;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.savedOn) - new Date(b.savedOn);
        case "destination":
          return a.destination.localeCompare(b.destination);
        case "duration":
          return b.duration - a.duration;
        case "newest":
        default:
          return new Date(b.savedOn) - new Date(a.savedOn);
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const budgetOptions = ["all", "budget", "mid", "luxury"];
  const uniqueDestinations = [
    ...new Set(savedTrips.map((trip) => trip.destination)),
  ];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          chatOpen ? "mr-96" : "mr-0"
        }`}
      >
        {/* Header */}
        <header className="relative bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg shadow-black/5">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="font-medium">Home</span>
                </button>

                <div className="h-6 w-px bg-gradient-to-b from-gray-200 to-gray-400"></div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    My Adventures
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.isAnonymous
                      ? "Explorer"
                      : user?.displayName || user?.email || "Traveler"}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/plan")}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-500/25 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Adventure
                </button>
                <button
                  onClick={handleLogout}
                  className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Enhanced Controls */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 mb-8 shadow-black/5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search destinations, preferences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none bg-white/70 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              {/* Filters and Sort */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    showFilters
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none bg-white/70 backdrop-blur-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="destination">A-Z</option>
                  <option value="duration">Longest First</option>
                </select>

                <div className="flex border-2 border-gray-200 rounded-2xl overflow-hidden bg-white/70">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={filterBudget}
                    onChange={(e) => setFilterBudget(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none bg-white/70"
                  >
                    {budgetOptions.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget === "all"
                          ? "All Budgets"
                          : budget.charAt(0).toUpperCase() + budget.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    {selectedTrips.size === filteredTrips.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">
                {selectedTrips.size} trip{selectedTrips.size > 1 ? "s" : ""}{" "}
                selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </button>
            </div>
          )}

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-xl p-6 shadow-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{savedTrips.length}</p>
                  <p className="text-blue-100">Total Adventures</p>
                </div>
                <Globe className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-xl p-6 shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {uniqueDestinations.length}
                  </p>
                  <p className="text-purple-100">Destinations</p>
                </div>
                <MapPin className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-xl p-6 shadow-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {
                      savedTrips.filter(
                        (trip) =>
                          new Date(trip.savedOn) >
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </p>
                  <p className="text-orange-100">This Month</p>
                </div>
                <Clock className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Enhanced Trips Display */}
          {filteredTrips.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-16 text-center shadow-black/5">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Plane className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {savedTrips.length === 0
                  ? "Ready for your first adventure?"
                  : "No matching trips found"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {savedTrips.length === 0
                  ? "Create your first trip plan and start exploring the world with AI-powered recommendations!"
                  : "Try adjusting your search terms or filters to find what you're looking for."}
              </p>
              <button
                onClick={() => navigate("/plan")}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-500/25 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-3" />
                Start Planning
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {filteredTrips.map((trip, index) => (
                <div
                  key={trip.firestoreId}
                  className={`group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-102 shadow-black/5 ${
                    viewMode === "list"
                      ? "flex items-center p-8"
                      : "flex flex-col"
                  } ${
                    selectedTrips.has(trip.firestoreId)
                      ? "ring-2 ring-indigo-500"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Enhanced Grid View */}
                      <div className="relative p-4 flex-1">
                        {/* Selection Checkbox */}
                        <div className="absolute top-4 left-4">
                          <input
                            type="checkbox"
                            checked={selectedTrips.has(trip.firestoreId)}
                            onChange={() => handleSelectTrip(trip.firestoreId)}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Time Badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {getRelativeTime(trip.savedOn)}
                        </div>

                        <div className="mt-8">
                          <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">
                            {trip.destination}
                          </h3>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-5 h-5 mr-3 text-indigo-500" />
                              <span className="font-medium">
                                {trip.duration}{" "}
                                {trip.duration === 1 ? "day" : "days"}
                              </span>
                            </div>

                            <div className="flex items-start text-gray-600">
                              <Heart className="w-5 h-5 mr-3 text-pink-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm leading-relaxed">
                                {trip.preferences.length > 60
                                  ? `${trip.preferences.substring(0, 60)}...`
                                  : trip.preferences}
                              </span>
                            </div>
                          </div>

                          {trip.budget && (
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-2xl text-sm font-medium mb-6">
                              <DollarSign className="w-4 h-4 mr-2" />
                              {trip.budget.charAt(0).toUpperCase() +
                                trip.budget.slice(1)}{" "}
                              Budget
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewTrip(trip)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md shadow-indigo-500/20 text-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </button>
                          <TripChatButton trip={trip} onOpenChat={handleOpenChat} />
                          <button
                            onClick={() => handleSendEmail(trip)}
                            className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all duration-200"
                            title="Send via email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteTrip(trip.firestoreId)}
                            disabled={deleteLoading === trip.firestoreId}
                            className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 disabled:opacity-50"
                            title="Delete trip"
                          >
                            {deleteLoading === trip.firestoreId ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Enhanced List View */}
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={selectedTrips.has(trip.firestoreId)}
                          onChange={() => handleSelectTrip(trip.firestoreId)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                            {trip.destination}
                          </h3>
                          <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            {getRelativeTime(trip.savedOn)}
                          </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                            {trip.duration}{" "}
                            {trip.duration === 1 ? "day" : "days"}
                          </div>
                          {trip.budget && (
                            <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {trip.budget.charAt(0).toUpperCase() +
                                trip.budget.slice(1)}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed">
                          {trip.preferences.length > 100
                            ? `${trip.preferences.substring(0, 100)}...`
                            : trip.preferences}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 ml-8">
                        <button
                          onClick={() => handleViewTrip(trip)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md shadow-indigo-500/20 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </button>
                        <TripChatButton trip={trip} onOpenChat={handleOpenChat} />
                        <button
                          onClick={() => handleSendEmail(trip)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md shadow-green-500/20 text-sm"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </button>

                        <button
                          onClick={() => handleDeleteTrip(trip.firestoreId)}
                          disabled={deleteLoading === trip.firestoreId}
                          className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 disabled:opacity-50"
                          title="Delete trip"
                        >
                          {deleteLoading === trip.firestoreId ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Integrated Chat Panel */}
      {selectedTripForChat && (
        <TripChatPanel
          trip={selectedTripForChat}
          isOpen={chatOpen}
          onClose={handleCloseChat}
        />
      )}

      {/* Use the external EmailModal component */}
      <EmailModal
        isOpen={emailModal.isOpen}
        trip={emailModal.trip}
        onClose={handleCloseEmailModal}
        user={user}
      />
    </div>
  );
};

export default SavedTrips;

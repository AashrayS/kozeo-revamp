"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "../../../../store/hooks";
import { isAuthenticated } from "../../../../utilities/api";
import {
  createDiscussionRoom,
  updateDiscussionRoom,
  deleteDiscussionRoom,
  getDiscussionRooms,
} from "../../../../utilities/kozeoApi";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiMessageSquare,
  FiImage,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

interface DiscussionRoom {
  id: string;
  title: string;
  description: string;
  displayPicture?: string;
  isActive: boolean;
  moderators: any[];
  createdAt: string;
  updatedAt: string;
}

interface CreateRoomData {
  title: string;
  description: string;
  displayPicture?: string;
}

export default function AdminDiscussionRoomsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user: currentUser, isAuthenticated: userAuthenticated } = useUser();

  const [rooms, setRooms] = useState<DiscussionRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<DiscussionRoom | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateRoomData>({
    title: "",
    description: "",
    displayPicture: "",
  });

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthenticated() || !userAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user is admin
    if (currentUser?.role !== "admin") {
      router.push("/Atrium");
      return;
    }

    fetchRooms();
  }, [userAuthenticated, currentUser, router]);

  // Fetch discussion rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await getDiscussionRooms();
      setRooms(roomsData || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch discussion rooms");
    } finally {
      setLoading(false);
    }
  };

  // Handle create room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setActionLoading("create");
      const newRoom = (await createDiscussionRoom(formData)) as DiscussionRoom;
      setRooms((prev) => [...prev, newRoom]);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", displayPicture: "" });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to create discussion room");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle update room
  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingRoom ||
      !formData.title.trim() ||
      !formData.description.trim()
    ) {
      setError("Title and description are required");
      return;
    }

    try {
      setActionLoading("update");
      const updatedRoom = (await updateDiscussionRoom(
        editingRoom.id,
        formData
      )) as DiscussionRoom;
      setRooms((prev) =>
        prev.map((room) => (room.id === editingRoom.id ? updatedRoom : room))
      );
      setEditingRoom(null);
      setFormData({ title: "", description: "", displayPicture: "" });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update discussion room");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete room
  const handleDeleteRoom = async (roomId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this discussion room? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(roomId);
      await deleteDiscussionRoom(roomId);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete discussion room");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit click
  const handleEditClick = (room: DiscussionRoom) => {
    setEditingRoom(room);
    setFormData({
      title: room.title,
      description: room.description,
      displayPicture: room.displayPicture || "",
    });
    setShowCreateModal(false);
  };

  // Cancel edit/create
  const handleCancel = () => {
    setEditingRoom(null);
    setShowCreateModal(false);
    setFormData({ title: "", description: "", displayPicture: "" });
    setError(null);
  };

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      {/* Main Layout */}
      <div
        className={`min-h-screen relative z-10 flex flex-row theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <Sidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto pb-20 lg:pb-6">
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Discussion Room Management
                  </h1>
                  <p
                    className={`theme-transition ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Create and manage discussion rooms for your community
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={20} />
                  Create Room
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Create/Edit Form */}
              {(showCreateModal || editingRoom) && (
                <div
                  className={`mb-8 p-6 rounded-lg border theme-transition ${
                    theme === "light"
                      ? "bg-white border border-gray-200 shadow-sm"
                      : "bg-neutral-900 border-neutral-700"
                  }`}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    {editingRoom
                      ? "Edit Discussion Room"
                      : "Create New Discussion Room"}
                  </h2>
                  <form
                    onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Room Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 theme-transition ${
                          theme === "light"
                            ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                            : "bg-neutral-900 border-neutral-700 text-white placeholder-gray-400 focus:ring-neutral-600"
                        }`}
                        placeholder="Enter room title..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 theme-transition ${
                          theme === "light"
                            ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                            : "bg-neutral-900 border-neutral-700 text-white placeholder-gray-400 focus:ring-neutral-600"
                        }`}
                        placeholder="Enter room description..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Picture URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.displayPicture}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            displayPicture: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 theme-transition ${
                          theme === "light"
                            ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                            : "bg-neutral-900 border-neutral-700 text-white placeholder-gray-400 focus:ring-neutral-600"
                        }`}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <FiSave size={16} />
                        {actionLoading === "create" ||
                        actionLoading === "update"
                          ? "Saving..."
                          : "Save Room"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className={`flex items-center gap-2 px-6 py-2 border rounded-lg transition-colors theme-transition ${
                          theme === "light"
                            ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            : "bg-neutral-900 border-neutral-700 text-gray-300 hover:bg-neutral-800"
                        }`}
                      >
                        <FiX size={16} />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Rooms List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading discussion rooms...
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {rooms.length === 0 ? (
                    <div
                      className={`text-center py-12 rounded-lg border-2 border-dashed theme-transition ${
                        theme === "light"
                          ? "border-gray-300 bg-white/50"
                          : "border-neutral-700 bg-neutral-900/50"
                      }`}
                    >
                      <FiMessageSquare
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-xl font-medium mb-2">
                        No Discussion Rooms Yet
                      </p>
                      <p
                        className={`mb-4 theme-transition ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Create your first discussion room to get started
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create First Room
                      </button>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-6 rounded-lg border transition-all duration-300 theme-transition ${
                          theme === "light"
                            ? "bg-white border border-gray-200 hover:shadow-lg hover:bg-gradient-to-br hover:from-cyan-50 hover:to-purple-50"
                            : "bg-neutral-900 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            {room.displayPicture && (
                              <img
                                src={room.displayPicture}
                                alt={room.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">
                                  {room.title}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {room.isActive ? (
                                    <FiEye
                                      className="text-green-500"
                                      size={16}
                                    />
                                  ) : (
                                    <FiEyeOff
                                      className="text-red-500"
                                      size={16}
                                    />
                                  )}
                                  <span
                                    className={`text-sm ${
                                      room.isActive
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {room.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={`mb-3 theme-transition ${
                                  theme === "light"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                }`}
                              >
                                {room.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <FiUsers size={16} />
                                  <span>
                                    {room.moderators?.length || 0} moderators
                                  </span>
                                </div>
                                <span
                                  className={`theme-transition ${
                                    theme === "light"
                                      ? "text-gray-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  Created:{" "}
                                  {new Date(
                                    room.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditClick(room)}
                              className={`p-2 rounded-lg transition-colors theme-transition ${
                                theme === "light"
                                  ? "hover:bg-blue-50 text-blue-600"
                                  : "hover:bg-neutral-700 text-blue-400"
                              }`}
                              title="Edit room"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              disabled={actionLoading === room.id}
                              className={`p-2 rounded-lg transition-colors theme-transition ${
                                theme === "light"
                                  ? "hover:bg-red-50 text-red-600"
                                  : "hover:bg-neutral-700 text-red-400"
                              } disabled:opacity-50`}
                              title="Delete room"
                            >
                              {actionLoading === room.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                              ) : (
                                <FiTrash2 size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

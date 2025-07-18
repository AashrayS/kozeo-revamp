"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { useRouter } from "next/navigation";
import { createGig } from "../../../../utilities/kozeoApi";
import { useUser } from "../../../../store/hooks";
import { FiPlus, FiX } from "react-icons/fi";

export default function CreateGigPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const [form, setForm] = useState({
    title: "",
    looking_For: "",
    description: "",
    skills: [] as string[],
    currency: "USD",
    amount: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.looking_For.trim()) {
      setError("Looking For field is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (form.skills.length === 0) {
      setError("At least one skill is required");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Valid amount is required");
      return;
    }

    setSubmitting(true);

    try {
      const gigData = {
        title: form.title.trim(),
        looking_For: form.looking_For.trim(),
        description: form.description.trim(),
        skills: form.skills,
        currency: form.currency,
        amount: parseFloat(form.amount),
      };

      console.log("Creating gig with data:", gigData);
      const newGig = await createGig(gigData);
      console.log("Gig created successfully:", newGig);

      setSuccess("Gig created successfully!");

      // Reset form
      setForm({
        title: "",
        looking_For: "",
        description: "",
        skills: [],
        currency: "USD",
        amount: "",
      });

      // Redirect to the specific gig's lobby page with the gig ID
      setTimeout(() => {
        router.push(`/gigs/${(newGig as any).id}/lobby`);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating gig:", error);
      setError(error?.message || "Failed to create gig. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-0 sm:p-8 flex flex-col items-center sm:justify-center">
            <form
              onSubmit={handleSubmit}
              className="w-full h-screen sm:h-auto max-w-2xl bg-transparent rounded-none sm:rounded-2xl border-0 sm:border border-neutral-800 shadow-none sm:shadow-xl p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8 drop-shadow-none sm:drop-shadow-glow backdrop-blur-none sm:backdrop-blur-md justify-start"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center tracking-tight">
                Create a New Gig
              </h1>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Gig Title"
                className="w-full px-4 sm:px-5 py-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-700 text-base sm:text-lg"
                required
              />
              <input
                name="looking_For"
                value={form.looking_For}
                onChange={handleChange}
                placeholder="Looking For (e.g. React Developer)"
                className="w-full px-4 sm:px-5 py-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-700 text-base sm:text-lg"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows={4}
                className="w-full px-4 sm:px-5 py-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-700 text-base sm:text-lg"
                required
              />
              {/* Skills Section */}
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    placeholder="Add a skill"
                    className="flex-1 px-4 sm:px-5 py-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-700 text-base sm:text-lg"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition flex items-center gap-2"
                  >
                    <FiPlus className="text-sm" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-600 text-gray-300 rounded-md"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-gray-400 hover:text-white transition"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleSelectChange}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-white focus:outline-none text-base sm:text-lg"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  type="number"
                  min="0"
                  className="flex-1 px-4 sm:px-5 py-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-700 text-base sm:text-lg"
                  required
                />
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/50 border border-green-500 rounded-xl">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold transition-colors text-base sm:text-lg"
              >
                {submitting ? "Creating..." : "Create Gig"}
              </button>
            </form>
          </main>
        </div>
        {/* Glows */}
        <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
        <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      </div>
    </>
  );
}

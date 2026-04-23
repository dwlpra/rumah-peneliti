"use client";

import "../globals.css";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiDatabase,
  FiLink,
  FiCpu,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiChevronDown,
  FiExternalLink,
  FiX,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const EXPLORER = "https://chainscan-galileo.0g.ai";

const STEPS = [
  { id: 1, title: "0G Storage Upload", desc: "Upload paper to decentralized storage", icon: FiUploadCloud, color: "#3b82f6" },
  { id: 2, title: "Data Availability Proof", desc: "Publish DA proof on 0G network", icon: FiDatabase, color: "#8b5cf6" },
  { id: 3, title: "On-Chain Anchor", desc: "Anchor paper hash to 0G blockchain", icon: FiLink, color: "#f59e0b" },
  { id: 4, title: "AI Research Agent", desc: "Autonomous AI analyzes, scores, and curates", icon: FiCpu, color: "#10b981" },
  { id: 5, title: "NFT Minting", desc: "Mint research NFT as proof of publication", icon: FiAward, color: "#6366f1" },
];

const TOUR_STEPS = [
  { target: "form", title: "📝 Step 1: Fill Paper Details", desc: "Enter your paper title, authors, and abstract. The wallet address is where your NFT will be minted.", icon: "📋" },
  { target: "upload", title: "📤 Step 2: Upload Your Paper", desc: "Click the upload area or drag your paper file (PDF, TXT, MD, DOCX). The file will be stored on 0G decentralized storage.", icon: "☁️" },
  { target: "run", title: "🚀 Step 3: Run the Pipeline", desc: "Click the button to start the full 6-step pipeline. Each step runs automatically — watch the progress unfold!", icon: "⚡" },
  { target: "progress", title: "📊 Step 4: Watch Progress", desc: "Each pipeline step will show real-time status: pending → running → completed. Click any step to see detailed logs.", icon: "📈" },
  { target: "result", title: "✅ Step 5: View Results", desc: "After completion, you'll see the paper ID, on-chain transaction hash, and a link to view your NFT on the explorer.", icon: "🎉" },
];

/* ─── Guided Tour Overlay ─── */
function GuidedTour({ step, onNext, onPrev, onClose, total }) {
  return (
    <AnimatePresence>
      {step !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 10000, background: "rgba(15,15,25,0.95)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(139,92,246,0.3)", borderRadius: 16,
            padding: "1.2rem 1.5rem", maxWidth: 460, width: "90%",
            boxShadow: "0 8px 40px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.3rem" }}>{TOUR_STEPS[step]?.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{TOUR_STEPS[step]?.title}</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4 }}>
              <FiX size={16} />
            </button>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 14 }}>{TOUR_STEPS[step]?.desc}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i === step ? "var(--accent, #8b5cf6)" : i < step ? "#22c55e" : "rgba(255,255,255,0.15)",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={onPrev} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: "6px 14px", color: "#94A3B8", cursor: "pointer", fontSize: "0.8rem",
                  display: "flex", alignItems: "center", gap: 4,
                }}><FiArrowLeft size={12} /> Back</button>
              )}
              <button onClick={step < total - 1 ? onNext : onClose} style={{
                background: "linear-gradient(135deg, #8b5cf6, #6D28D9)", border: "none",
                borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: "0.8rem",
                fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
              }}>
                {step < total - 1 ? <>Next <FiArrowRight size={12} /></> : "Let's Go! 🚀"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function PipelinePage() {
  const [stepState, setStepState] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: "", authors: "", abstract: "", price_wei: "0", author_wallet: "" });
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [tourStep, setTourStep] = useState(null);

  // Show tour for first-time visitors
  useEffect(() => {
    const seen = typeof window !== "undefined" && localStorage.getItem("rp-tour-seen");
    if (!seen) setTourStep(0);
  }, []);

  const closeTour = () => {
    setTourStep(null);
    localStorage.setItem("rp-tour-seen", "1");
  };

  const addLog = (step, msg) => {
    setStepState((prev) => ({
      ...prev,
      [step]: {
        ...(prev[step] || { status: "pending", logs: [] }),
        logs: [...(prev[step]?.logs || []), `${new Date().toLocaleTimeString()}: ${msg}`],
      },
    }));
  };

  const setStepStatus = (step, status) => {
    setStepState((prev) => ({
      ...prev,
      [step]: { ...(prev[step] || { logs: [] }), status },
    }));
  };

  const runPipeline = useCallback(async () => {
    if (!file || !form.title) return alert("Please fill title and select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", form.title);
    formData.append("authors", form.authors);
    formData.append("abstract", form.abstract);
    formData.append("price_wei", form.price_wei);
    formData.append("author_wallet", form.author_wallet);

    setCurrentStep(1);
    setStepStatus(1, "running");
    addLog(1, "Uploading paper to 0G Storage...");

    try {
      const res = await fetch(`${API}/api/papers`, { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        setStepStatus(1, "error");
        addLog(1, `Error: ${data.error}`);
        return;
      }

      setResult(data);

      // Step 1: Storage
      if (data.pipeline.storageUploaded) {
        setStepStatus(1, "completed");
        addLog(1, "✅ Uploaded to 0G Storage successfully");
      } else {
        setStepStatus(1, "completed");
        addLog(1, "⚠️ File saved locally (0G Storage skipped)");
      }

      // Step 2: DA
      setCurrentStep(2);
      setStepStatus(2, "running");
      if (data.pipeline.daProof) {
        addLog(2, `Blob hash: ${data.pipeline.daProof}`);
        setStepStatus(2, "completed");
        addLog(2, "✅ DA proof published");
      } else {
        addLog(2, "⚠️ DA proof skipped");
        setStepStatus(2, "completed");
      }

      // Step 3: Anchor
      setCurrentStep(3);
      setStepStatus(3, "running");
      if (data.pipeline.chainAnchor) {
        addLog(3, `Tx: ${data.pipeline.chainAnchor}`);
        setStepStatus(3, "completed");
        addLog(3, "✅ Anchored on-chain");
      } else {
        addLog(3, "⚠️ Chain anchor skipped");
        setStepStatus(3, "completed");
      }

      // Step 4: AI Curation (async - just mark as running)
      setCurrentStep(4);
      setStepStatus(4, "running");
      addLog(4, "AI curation started in background...");
      setStepStatus(4, "completed");
      addLog(4, "✅ AI curation queued (check article page shortly)");

      // Step 5: NFT
      setCurrentStep(5);
      setStepStatus(5, "running");
      addLog(5, "NFT minting queued...");
      setStepStatus(5, "completed");
      addLog(5, "✅ NFT minting started (gasless, backend-sponsored)");

    } catch (err) {
      setStepStatus(currentStep || 1, "error");
      addLog(currentStep || 1, `Error: ${err.message}`);
    }
  }, [file, form]);

  const StatusIcon = ({ status }) => {
    if (status === "running") return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><FiLoader size={18} /></motion.div>;
    if (status === "completed") return <FiCheckCircle size={18} className="text-green-400" />;
    if (status === "error") return <FiAlertCircle size={18} className="text-red-400" />;
    return <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            0G Pipeline Wizard
          </h1>
          <p className="text-gray-400 mt-3">
            Upload, verify, curate, and mint your research paper — fully on-chain
          </p>
          <button onClick={() => setTourStep(0)} className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#A78BFA" }}>
            💡 How does this work?
          </button>
        </motion.div>

        {/* Guided Tour */}
        <GuidedTour
          step={tourStep}
          onNext={() => setTourStep(s => Math.min(s + 1, TOUR_STEPS.length - 1))}
          onPrev={() => setTourStep(s => Math.max(s - 1, 0))}
          onClose={closeTour}
          total={TOUR_STEPS.length}
        />

        {/* Upload Form */}
        <motion.div id="tour-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur border rounded-2xl p-6 mb-8"
          style={{ borderColor: tourStep === 0 ? "rgba(139,92,246,0.5)" : undefined,
            boxShadow: tourStep === 0 ? "0 0 30px rgba(139,92,246,0.15)" : undefined,
            transition: "all 0.3s" }}>
          <h2 className="text-xl font-semibold mb-4">📄 Paper Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Paper Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Authors (comma separated)" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} />
            <input className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none col-span-2"
              placeholder="Your wallet address (for NFT)" value={form.author_wallet} onChange={(e) => setForm({ ...form, author_wallet: e.target.value })} />
            <textarea className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none col-span-2 h-24 resize-none"
              placeholder="Abstract" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
          </div>

          <div id="tour-upload" className="mt-4 flex items-center gap-4" style={{
            borderColor: tourStep === 1 ? "rgba(139,92,246,0.5)" : undefined,
            transition: "all 0.3s" }}>
            <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-6 text-center transition-colors">
              <input type="file" accept=".pdf,.txt,.md,.docx" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              {file ? (
                <div><FiCheckCircle className="mx-auto mb-2 text-green-400" size={24} /><p className="text-sm text-green-400">{file.name}</p></div>
              ) : (
                <div><FiUploadCloud className="mx-auto mb-2 text-gray-400" size={24} /><p className="text-sm text-gray-400">Drop or click to upload paper</p></div>
              )}
            </label>
            <motion.button id="tour-run" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={runPipeline} disabled={!file || !form.title}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all"
              style={tourStep === 2 ? { boxShadow: "0 0 20px rgba(139,92,246,0.4)", animation: "pulse 1.5s infinite" } : {}}>
              🚀 Run Pipeline
            </motion.button>
          </div>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const state = stepState[step.id] || { status: "pending", logs: [] };
            const Icon = step.icon;
            const isActive = currentStep === step.id;

            return (
              <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className={`bg-gray-800/50 backdrop-blur border rounded-xl overflow-hidden transition-all ${
                  isActive ? "border-blue-500 shadow-lg shadow-blue-500/20" :
                  state.status === "completed" ? "border-green-500/30" :
                  state.status === "error" ? "border-red-500/30" : "border-gray-700"
                }`}>
                  <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(expanded === step.id ? null : step.id)}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: step.color + "20" }}>
                      <Icon size={20} style={{ color: step.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                    <StatusIcon status={state.status} />
                    <FiChevronDown className={`text-gray-500 transition-transform ${expanded === step.id ? "rotate-180" : ""}`} />
                  </div>

                  <AnimatePresence>
                    {expanded === step.id && state.logs.length > 0 && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-700">
                        <div className="p-4 bg-gray-900/50 font-mono text-xs space-y-1">
                          {state.logs.map((log, j) => (
                            <p key={j} className={log.startsWith("✅") ? "text-green-400" : log.startsWith("⚠️") ? "text-yellow-400" : log.startsWith("Error") ? "text-red-400" : "text-gray-400"}>
                              {log}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gray-800/50 backdrop-blur border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-4">✅ Pipeline Complete!</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Paper ID:</span> {result.paper?.id}</p>
              <p><span className="text-gray-400">Title:</span> {result.paper?.title}</p>
              {result.pipeline.chainAnchor && (
                <p><span className="text-gray-400">Tx:</span>{" "}
                  <a href={`${EXPLORER}/tx/${result.pipeline.chainAnchor}`} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1 inline-flex">
                    {result.pipeline.chainAnchor.slice(0, 20)}... <FiExternalLink size={12} />
                  </a>
                </p>
              )}
              {result.pipeline.chainPaperId && (
                <p><span className="text-gray-400">On-chain ID:</span> {result.pipeline.chainPaperId}</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

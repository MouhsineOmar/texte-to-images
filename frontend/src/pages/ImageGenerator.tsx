import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Download, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import "./ImageGenerator.css";

interface GeneratedImage {
  id: string;
  prompt: string;
  image: string;
  timestamp: Date;
  generationTime: number;
}

const PYTHON_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numSteps, setNumSteps] = useState(50);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new images are generated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generatedImages]);

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("Veuillez entrer un prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(`${PYTHON_API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim() || null,
          num_inference_steps: numSteps,
          guidance_scale: guidanceScale,
          height: 512,
          width: 512,
          seed: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erreur lors de la génération");
      }

      const data = await response.json();

      if (data.success && data.image_base64) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          image: `data:image/png;base64,${data.image_base64}`,
          timestamp: new Date(),
          generationTime: data.generation_time,
        };

        setGeneratedImages((prev) => [...prev, newImage]);
        setPrompt("");
        toast.success(`Image générée en ${data.generation_time.toFixed(2)}s`);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la génération"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = image.image;
    link.download = `generated-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image téléchargée");
  };

  const deleteImage = (id: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image supprimée");
  };

  const copyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Prompt copié");
  };

  return (
    <div className="image-generator-container">
      {/* Header */}
      <div className="generator-header">
        <div className="header-content">
          <h1 className="header-title">Image Generator</h1>
          <p className="header-subtitle">
            Générez des images magnifiques avec l'IA
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="generator-main">
        {/* Chat History */}
        <div className="chat-history">
          {generatedImages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h2>Commencez à générer</h2>
              <p>Entrez un prompt pour créer votre première image</p>
            </div>
          ) : (
            <div className="messages-container">
              {generatedImages.map((img) => (
                <div key={img.id} className="message-group">
                  {/* User Prompt */}
                  <div className="user-message">
                    <div className="message-content">
                      <p className="prompt-text">{img.prompt}</p>
                      <span className="message-time">
                        {img.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Generated Image */}
                  <div className="ai-message">
                    <Card className="image-card">
                      <div className="image-wrapper">
                        <img
                          src={img.image}
                          alt={img.prompt}
                          className="generated-image"
                        />
                      </div>

                      {/* Image Actions */}
                      <div className="image-actions">
                        <button
                          className="action-btn copy-btn"
                          onClick={() => copyPrompt(img.prompt, img.id)}
                          title="Copier le prompt"
                        >
                          {copiedId === img.id ? (
                            <Check size={18} />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                        <button
                          className="action-btn download-btn"
                          onClick={() => downloadImage(img)}
                          title="Télécharger"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteImage(img.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="image-info">
                        <span className="generation-time">
                          ⏱️ {img.generationTime.toFixed(2)}s
                        </span>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <form onSubmit={generateImage} className="input-form">
            <div className="input-wrapper">
              <Input
                type="text"
                placeholder="Décrivez l'image que vous souhaitez générer..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="prompt-input"
              />
              <Button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="send-button"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Générer</span>
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Masquer" : "Afficher"} les options avancées
            </button>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="advanced-options">
                <div className="option-group">
                  <label>Prompt négatif (optionnel)</label>
                  <Input
                    type="text"
                    placeholder="Éléments à éviter..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                <div className="option-group">
                  <label>
                    Étapes d'inférence: <strong>{numSteps}</strong>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={numSteps}
                    onChange={(e) => setNumSteps(parseInt(e.target.value))}
                    disabled={isGenerating}
                    className="slider"
                  />
                </div>

                <div className="option-group">
                  <label>
                    Échelle de guidance: <strong>{guidanceScale.toFixed(1)}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    disabled={isGenerating}
                    className="slider"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Pare 3D (build 126): AI design. Say or type what to make or change; ChatGPT (on the person's own plan)
 * or Gemini (through Google's Gemini CLI) builds it in the open design with the editor's own tools.
 * Every change lands in the undo history like a change made by hand.
 */
import { Box, Bot, ImagePlus, Loader2, LogOut, Mic, MicOff, Send, Sparkles, Square, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { t } from "@/lib/i18n";
import {
  AI_ENGINE_EVENT,
  AI_MODEL_KEY,
  aiJob,
  aiModels,
  aiStatus,
  inDesktopApp,
  OPEN_AI_EVENT,
  IMPORT_FILES_EVENT,
  meshFile,
  startMeshRun,
  pictureForAi,
  readAiEngine,
  signInChatgpt,
  signOutChatgpt,
  startAiRun,
  stopAiRun,
  writeAiEngine,
  type AiEngine,
  type AiModel,
  type AiStatus,
} from "@/lib/pareAi";

type Turn = { role: "user" | "assistant"; text: string; steps?: string[]; error?: boolean; image?: string };

const ENGINE_NAMES: Record<AiEngine, string> = { chatgpt: "ChatGPT", gemini: "Gemini" };
const MESH_FILE = /\.(stl|obj|3mf|glb|gltf|ply|off|amf)$/i;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

function speechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/** The ChatGPT / Gemini switch; on the toolbar and at the top of the panel. */
export function AiEngineSwitch({ compact = false }: { compact?: boolean }) {
  const [engine, setEngine] = useState<AiEngine>("chatgpt");
  useEffect(() => {
    setEngine(readAiEngine());
    const changed = (event: Event) => setEngine((event as CustomEvent<AiEngine>).detail);
    window.addEventListener(AI_ENGINE_EVENT, changed);
    return () => window.removeEventListener(AI_ENGINE_EVENT, changed);
  }, []);
  return (
    <div className={`ai-engine-switch${compact ? " is-compact" : ""}`} role="radiogroup" aria-label={t("ai.engine")}>
      {(["chatgpt", "gemini"] as const).map((id) => (
        <button key={id} type="button" role="radio" aria-checked={engine === id} className={engine === id ? "is-active" : ""} onClick={() => writeAiEngine(id)} title={id === "chatgpt" ? t("ai.chatgptHint") : t("ai.geminiHint")}>
          {ENGINE_NAMES[id]}
        </button>
      ))}
    </div>
  );
}

/** The toolbar's AI button and switch. Only the desktop app shows them. */
export function AiToolbarControls() {
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(inDesktopApp()), []);
  if (!shown) return null;
  return (
    <div className="ai-toolbar-controls">
      <button type="button" className="ai-open-button" data-layerling-tool="ai" title={t("ai.openHint")} onClick={() => window.dispatchEvent(new Event(OPEN_AI_EVENT))}>
        <Sparkles aria-hidden="true" />
        <span>{t("ai.button")}</span>
      </button>
      <AiEngineSwitch compact />
    </div>
  );
}

export function AiPanel() {
  const [open, setOpen] = useState(false);
  const [engine, setEngine] = useState<AiEngine>("chatgpt");
  const [status, setStatus] = useState<AiStatus | null | undefined>(undefined);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [prompt, setPrompt] = useState("");
  const [jobId, setJobId] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [models, setModels] = useState<AiModel[]>([]);
  const [model, setModel] = useState("");
  const [notice, setNotice] = useState("");
  const [picture, setPicture] = useState("");
  const [dragging, setDragging] = useState(false);
  const [meshName, setMeshName] = useState("");
  const [pendingFollowUp, setPendingFollowUp] = useState("");
  // Build 129: what a picture becomes - a mesh made on this Mac, or a model the AI builds from shapes.
  const [pictureMode, setPictureMode] = useState<"mesh" | "shapes">("mesh");
  const [meshSetupOpen, setMeshSetupOpen] = useState(false);
  const jobKindRef = useRef<{ kind: "ai" | "mesh"; followUp: string }>({ kind: "ai", followUp: "" });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const canSpeak = typeof window !== "undefined" && Boolean(speechRecognition());

  useEffect(() => {
    if (!inDesktopApp()) return;
    setEngine(readAiEngine());
    try {
      setModel(window.localStorage.getItem(AI_MODEL_KEY) || "");
    } catch {
      setModel("");
    }
    const openPanel = () => setOpen((value) => !value);
    const changed = (event: Event) => setEngine((event as CustomEvent<AiEngine>).detail);
    window.addEventListener(OPEN_AI_EVENT, openPanel);
    window.addEventListener(AI_ENGINE_EVENT, changed);
    return () => {
      window.removeEventListener(OPEN_AI_EVENT, openPanel);
      window.removeEventListener(AI_ENGINE_EVENT, changed);
    };
  }, []);

  const refresh = useCallback(async () => setStatus(await aiStatus()), []);

  useEffect(() => {
    if (!open) return;
    void refresh();
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, refresh]);

  // While ChatGPT's sign-in page is open in the browser, look for the result every two seconds.
  useEffect(() => {
    if (!open || !status?.chatgpt.signingIn) return;
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(timer);
  }, [open, status?.chatgpt.signingIn, refresh]);

  useEffect(() => {
    if (!open || engine !== "chatgpt" || !status?.chatgpt.signedIn || models.length) return;
    aiModels().then(setModels).catch(() => setModels([]));
  }, [open, engine, status?.chatgpt.signedIn, models.length]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, steps]);

  // Follow the running request.
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let seen = 0;
    const collected: string[] = [];
    const follow = async () => {
      while (!cancelled) {
        try {
          const job = await aiJob(jobId, seen);
          seen = job.logLength;
          for (const entry of job.log) if (entry.kind === "tool" && collected[collected.length - 1] !== entry.text) collected.push(entry.text);
          setSteps([...collected]);
          if (job.status !== "running") {
            const finished = jobKindRef.current;
            if (finished.kind === "mesh" && job.status === "done") {
              try {
                const file = await meshFile(jobId);
                window.dispatchEvent(new CustomEvent(IMPORT_FILES_EVENT, { detail: { files: [file] } }));
                setMeshName(file.name);
                if (finished.followUp) window.setTimeout(() => setPendingFollowUp(finished.followUp), 2500);
              } catch (error) {
                job.answer = error instanceof Error ? error.message : String(error);
              }
            }
            setTurns((list) => [
              ...list,
              job.status === "done"
                ? { role: "assistant", text: job.answer, steps: [...collected] }
                : { role: "assistant", text: job.status === "stopped" ? t("ai.stopped") : job.error, steps: [...collected], error: job.status === "error" },
            ]);
            setJobId("");
            setSteps([]);
            return;
          }
        } catch (error) {
          setTurns((list) => [...list, { role: "assistant", text: error instanceof Error ? error.message : String(error), error: true }]);
          setJobId("");
          setSteps([]);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      }
    };
    void follow();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const ready = status ? (engine === "chatgpt" ? status.chatgpt.signedIn : status.gemini.installed && status.gemini.signedIn) : false;

  const takePicture = async (file: Blob | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      if (file) setNotice(t("ai.pictureNotImage"));
      return;
    }
    try {
      setPicture(await pictureForAi(file));
      setNotice("");
      inputRef.current?.focus();
    } catch {
      setNotice(t("ai.pictureUnreadable"));
    }
  };

  const send = async () => {
    const text = prompt.trim() || (picture ? t("ai.pictureDefault") : "");
    const meshing = Boolean(picture) && pictureMode === "mesh" && Boolean(status?.meshMaker?.installed);
    if (!text || jobId || (!ready && !meshing)) return;
    // The page updated but the app's server still runs older AI code, which would drop the picture.
    if (picture && !status?.features?.includes(meshing ? "mesh-from-picture" : "picture")) {
      setNotice(t("ai.restartForPictures"));
      return;
    }
    recognitionRef.current?.stop();
    const history = turns.filter((turn) => !turn.error).map((turn) => ({ role: turn.role, text: turn.text }));
    const image = picture;
    // Build 129: a picture as a mesh, made on this Mac; what was typed with it goes to the AI afterwards.
    if (image && pictureMode === "mesh" && status?.meshMaker?.installed) {
      setTurns((list) => [...list, { role: "user", text: prompt.trim() || t("ai.meshFromPicture"), image }]);
      setPrompt("");
      setPicture("");
      try {
        const { id } = await startMeshRun(image);
        jobKindRef.current = { kind: "mesh", followUp: status.chatgpt.signedIn || engine === "gemini" ? prompt.trim() : "" };
        setJobId(id);
      } catch (error) {
        setTurns((list) => [...list, { role: "assistant", text: error instanceof Error ? error.message : String(error), error: true }]);
      }
      return;
    }
    jobKindRef.current = { kind: "ai", followUp: "" };
    setTurns((list) => [...list, { role: "user", text, image: image || undefined }]);
    setPrompt("");
    setPicture("");
    const request = meshName ? `${text}\n\n(I just added the mesh "${meshName}" to the design; it is the newest object in the scene. Work on that mesh unless I say otherwise.)` : text;
    setMeshName("");
    try {
      const { id } = await startAiRun({ engine, prompt: request, history, model: engine === "chatgpt" ? model : undefined, image: image || undefined });
      setJobId(id);
    } catch (error) {
      setTurns((list) => [...list, { role: "assistant", text: error instanceof Error ? error.message : String(error), error: true }]);
    }
  };

  // After a mesh from a picture is in the design, what was typed with the picture goes to the AI.
  useEffect(() => {
    if (!pendingFollowUp || jobId) return;
    const text = pendingFollowUp;
    setPendingFollowUp("");
    setPrompt(text);
    window.setTimeout(() => document.querySelector<HTMLButtonElement>(".ai-panel .ai-send-button[type=submit]")?.click(), 50);
  }, [pendingFollowUp, jobId]);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = speechRecognition();
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-AU";
    recognition.interimResults = true;
    recognition.continuous = true;
    const before = prompt.trim() ? `${prompt.trim()} ` : "";
    recognition.onresult = (event) => {
      let heard = "";
      for (let index = 0; index < event.results.length; index += 1) heard += event.results[index][0].transcript;
      setPrompt(before + heard.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") setNotice(t("ai.micBlocked"));
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setNotice("");
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  if (!open) return null;

  const signIn = async () => {
    setNotice("");
    try {
      await signInChatgpt();
      setNotice(t("ai.signInOpened"));
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    }
  };

  const signOut = async () => {
    await signOutChatgpt().catch(() => undefined);
    setModels([]);
    await refresh();
  };

  let setup: ReactNode = null;
  if (status === null) {
    setup = <p className="ai-setup">{t("ai.needsNewApp")}</p>;
  } else if (status && engine === "chatgpt" && !status.chatgpt.signedIn) {
    setup = (
      <div className="ai-setup">
        <p>{t("ai.chatgptIntro")}</p>
        <button type="button" className="ai-signin-button" onClick={() => void signIn()} disabled={status.chatgpt.signingIn}>
          {status.chatgpt.signingIn ? <Loader2 className="ai-spin" aria-hidden="true" /> : <Bot aria-hidden="true" />}
          {status.chatgpt.signingIn ? t("ai.signingIn") : t("ai.continueWithChatgpt")}
        </button>
        {status.chatgpt.error ? <p className="ai-error">{status.chatgpt.error}</p> : null}
      </div>
    );
  } else if (status && engine === "gemini" && !(status.gemini.installed && status.gemini.signedIn)) {
    setup = (
      <div className="ai-setup">
        <p>{status.gemini.installed ? t("ai.geminiSignIn") : t("ai.geminiInstall")}</p>
        <ol>
          {!status.gemini.installed ? <li>{t("ai.geminiStep1")} <code>brew install gemini-cli</code></li> : null}
          <li>{t("ai.geminiStep2")} <code>gemini</code></li>
          <li>{t("ai.geminiStep3")}</li>
        </ol>
        <button type="button" className="ai-small-button" onClick={() => void refresh()}>{t("ai.checkAgain")}</button>
      </div>
    );
  }

  return (
    <aside
      className={`ai-panel${dragging ? " is-dragging" : ""}`}
      aria-label={t("ai.title")}
      onDragOver={(event) => {
        if (!Array.from(event.dataTransfer.types).includes("Files")) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (!file) return;
        if (file.type.startsWith("image/") && !/\.svg$/i.test(file.name)) {
          // A picture: for the AI to model. It does not go on to the editor's own import.
          event.preventDefault();
          event.stopPropagation();
          void takePicture(file);
          return;
        }
        // Anything else (an STL, OBJ, 3MF or GLB made elsewhere, an SVG): the editor imports it as usual,
        // and the next request tells the AI it is there.
        if (MESH_FILE.test(file.name)) {
          setMeshName(file.name);
          setNotice(t("ai.meshAdded", { name: file.name }));
        }
      }}
    >
      {dragging ? <div className="ai-drop-hint">{t("ai.pictureDrop")}</div> : null}
      <header className="ai-panel-header">
        <Sparkles aria-hidden="true" />
        <strong>{t("ai.title")}</strong>
        <AiEngineSwitch />
        <button type="button" className="ai-icon-button" aria-label={t("ai.close")} onClick={() => setOpen(false)}>
          <X aria-hidden="true" />
        </button>
      </header>
      {engine === "chatgpt" && status?.chatgpt.signedIn ? (
        <div className="ai-account">
          <span title={status.chatgpt.email}>{status.chatgpt.email || t("ai.signedIn")}</span>
          {models.length ? (
            <select
              aria-label={t("ai.model")}
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
                try {
                  window.localStorage.setItem(AI_MODEL_KEY, event.target.value);
                } catch {
                  // Remembered for this visit only.
                }
              }}
            >
              <option value="">{t("ai.modelDefault")}</option>
              {models.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.name}</option>
              ))}
            </select>
          ) : null}
          <button type="button" className="ai-icon-button" title={t("ai.signOut")} aria-label={t("ai.signOut")} onClick={() => void signOut()}>
            <LogOut aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <div className="ai-conversation" ref={listRef}>
        {meshSetupOpen ? (
          <div className="ai-setup">
            <p><strong>{t("ai.meshSetupTitle")}</strong> {t("ai.meshSetupIntro")}</p>
            <ol>
              <li>{t("ai.meshSetupStep1")} <a href="https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m" target="_blank" rel="noreferrer">huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m</a></li>
              <li>{t("ai.meshSetupStep2")}
                <pre>{"cd ~ && git clone https://github.com/sanchez-kim/trellis-silicon.git && cd trellis-silicon\nxcodebuild -downloadComponent MetalToolchain\nbash setup.sh && source .venv/bin/activate\nhf auth login"}</pre>
              </li>
              <li>{t("ai.meshSetupStep3")}</li>
            </ol>
            <div className="ai-setup-actions">
              <button type="button" className="ai-small-button" onClick={() => void refresh()}>{t("ai.checkAgain")}</button>
              <button type="button" className="ai-small-button" onClick={() => setMeshSetupOpen(false)}>{t("ai.close")}</button>
            </div>
            {status?.meshMaker?.installed ? <p className="ai-ok">{t("ai.meshSetupDone")}</p> : null}
          </div>
        ) : null}
        {setup}
        {!setup && turns.length === 0 && !jobId ? <p className="ai-empty">{t("ai.empty")}</p> : null}
        {turns.map((turn, index) => (
          <div key={index} className={`ai-turn is-${turn.role}${turn.error ? " is-error" : ""}`}>
            {turn.steps?.length ? <p className="ai-steps">{turn.steps.join(" · ")}</p> : null}
            {turn.image ? <img className="ai-turn-picture" src={turn.image} alt={t("ai.pictureAlt")} /> : null}
            <p>{turn.text}</p>
          </div>
        ))}
        {jobId ? (
          <div className="ai-turn is-assistant is-working">
            <p className="ai-steps">
              <Loader2 className="ai-spin" aria-hidden="true" /> {steps.length ? steps[steps.length - 1] : jobKindRef.current.kind === "mesh" ? t("ai.meshWorking") : t("ai.thinking", { engine: ENGINE_NAMES[engine] })}
            </p>
          </div>
        ) : null}
      </div>
      {notice ? <p className="ai-notice">{notice}</p> : null}
      <form
        className="ai-compose"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        {picture ? (
          <div className="ai-picture">
            <img src={picture} alt={t("ai.pictureAlt")} />
            <span className="ai-picture-text">
              <span className="ai-picture-modes" role="radiogroup" aria-label={t("ai.pictureMode")}>
                <button type="button" role="radio" aria-checked={pictureMode === "mesh"} className={pictureMode === "mesh" ? "is-active" : ""} onClick={() => setPictureMode("mesh")} title={t("ai.pictureMeshHint")}>
                  {t("ai.pictureMesh")}
                </button>
                <button type="button" role="radio" aria-checked={pictureMode === "shapes"} className={pictureMode === "shapes" ? "is-active" : ""} onClick={() => setPictureMode("shapes")} title={t("ai.pictureShapesHint")}>
                  {t("ai.pictureShapes")}
                </button>
              </span>
              {pictureMode === "mesh" && !status?.meshMaker?.installed ? (
                <button type="button" className="ai-link-button" onClick={() => setMeshSetupOpen(true)}>{t("ai.meshSetupLink")}</button>
              ) : (
                <span>{pictureMode === "mesh" ? t("ai.pictureMeshReady") : t("ai.pictureReady")}</span>
              )}
            </span>
            <button type="button" className="ai-icon-button" aria-label={t("ai.pictureRemove")} title={t("ai.pictureRemove")} onClick={() => setPicture("")}>
              <X aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <textarea
          ref={inputRef}
          value={prompt}
          rows={3}
          placeholder={picture ? t("ai.picturePlaceholder") : t("ai.placeholder")}
          disabled={!ready && status !== undefined}
          onChange={(event) => setPrompt(event.target.value)}
          onPaste={(event) => {
            const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/"));
            if (!file) return;
            event.preventDefault();
            void takePicture(file);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <div className="ai-compose-actions">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/gif"
            hidden
            onChange={(event) => {
              void takePicture(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button type="button" className="ai-icon-button ai-picture-button" title={t("ai.pictureAdd")} aria-label={t("ai.pictureAdd")} onClick={() => fileRef.current?.click()} disabled={!ready || Boolean(jobId)}>
            <ImagePlus aria-hidden="true" />
          </button>
          {canSpeak ? (
            <button type="button" className={`ai-icon-button${listening ? " is-listening" : ""}`} aria-pressed={listening} title={listening ? t("ai.micStop") : t("ai.micStart")} aria-label={listening ? t("ai.micStop") : t("ai.micStart")} onClick={toggleListening} disabled={!ready}>
              {listening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
            </button>
          ) : null}
          {jobId ? (
            <button type="button" className="ai-send-button is-stop" onClick={() => void stopAiRun(jobId)}>
              <Square aria-hidden="true" /> {t("ai.stop")}
            </button>
          ) : (
            <button type="submit" className="ai-send-button" disabled={(!ready && !(picture && pictureMode === "mesh" && status?.meshMaker?.installed)) || (!prompt.trim() && !picture)}>
              <Send aria-hidden="true" /> {t("ai.send")}
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}

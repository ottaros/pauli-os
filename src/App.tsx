import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  supabase,
  failure,
  type Product,
  type Video,
  type Hook,
  type Metrics,
  type Checkin,
} from "./supabase";
import HouseContent, {
  contentPanels,
  contentTitles,
  useHouseState,
} from "./HouseContent";
import World, { rooms, type Room } from "./World";
import { localDay, progress } from "./domain.mjs";
const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button aria-label="Fechar" className="icon-button" onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Field({
  label,
  name,
  type = "text",
  value,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "any" : undefined}
      />
    </label>
  );
}
function Login() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const email = String(f.get("email"));
      const password = String(f.get("password"));
      const { error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : mode === "signup"
            ? await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: location.origin },
              })
            : await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: location.origin,
              });
      if (error) throw error;
      if (mode === "signup")
        setMessage("Confira seu email para confirmar a entrada no chalé.");
      if (mode === "reset")
        setMessage(
          "Se este email estiver cadastrado, você receberá um link para redefinir a senha.",
        );
    } catch (e) {
      setMessage(failure(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="entrance">
      <div className="entrance-art" />
      <header className="brand">
        <span>⌂</span>
        <div>
          Pauli OS<small>UM REFÚGIO PARA A SUA VIDA</small>
        </div>
      </header>
      <section className="welcome">
        <span className="eyebrow">NAS MONTANHAS, DO SEU JEITO</span>
        <h1>
          Uma vida bonita
          <br />
          começa em casa.
        </h1>
        <p>
          Um lugar para cuidar de você, criar coisas
          <br className="desktop" /> e ver seus pequenos passos florescerem.
        </p>
        <form onSubmit={submit}>
          <h2>
            {mode === "login"
              ? "Seu chalé está esperando."
              : mode === "signup"
                ? "Pegue a chave do seu chalé."
                : "Vamos recuperar sua chave."}
          </h2>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              required
            />
          </label>
          {mode !== "reset" && (
            <label>
              Senha
              <input
                name="password"
                type="password"
                minLength={8}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="Sua chave de entrada"
                required
              />
            </label>
          )}
          <button className="primary" disabled={busy}>
            {busy
              ? "Abrindo a porta…"
              : mode === "login"
                ? "Entrar no chalé →"
                : mode === "signup"
                  ? "Criar minha conta"
                  : "Enviar link de recuperação"}
          </button>
          <p role="status" className="form-message">
            {message}
          </p>
          <div className="login-links">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setMessage("");
              }}
            >
              {mode === "signup"
                ? "Já tenho uma conta"
                : "Primeira visita? Criar conta"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "reset" ? "login" : "reset");
                setMessage("");
              }}
            >
              {mode === "reset" ? "Voltar ao login" : "Esqueci a senha"}
            </button>
          </div>
        </form>
        <small className="welcome-note">
          ✦ Rotina, ideias e uma vida com mais significado.
        </small>
      </section>
      <span className="entrance-foot">
        Seu pequeno mundo. Infinitas possibilidades.
      </span>
    </main>
  );
}
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error(error.message);
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (loading)
    return <main className="loading">✦ Acendendo as luzes do chalé…</main>;
  return session ? (
    <Home
      key={session.user.id}
      session={session}
      recovery={recovery}
      onRecovered={() => setRecovery(false)}
    />
  ) : (
    <Login />
  );
}
function Home({
  session,
  recovery,
  onRecovered,
}: {
  session: Session;
  recovery: boolean;
  onRecovered: () => void;
}) {
  const uid = session.user.id;
  const house = useHouseState(uid);
  const [day, setDay] = useState(localDay());
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [selected, setSelected] = useState<Room | null>(null);
  const [expanded, setExpanded] = useState<Room | null>(null);
  const [panel, setPanel] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  const [briefing, setBriefing] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const results = await Promise.all([
        supabase
          .from("daily_checkins")
          .upsert(
            { user_id: uid, day },
            { onConflict: "user_id,day", ignoreDuplicates: true },
          ),
        supabase
          .from("products")
          .select("*")
          .eq("user_id", uid)
          .order("created_at"),
        supabase.from("videos").select("*").eq("user_id", uid),
        supabase.from("hooks").select("*").eq("user_id", uid),
        supabase
          .from("product_metric_snapshots")
          .select("*")
          .eq("user_id", uid)
          .order("captured_at", { ascending: false }),
        supabase
          .from("briefings")
          .select("title,content")
          .eq("user_id", uid)
          .eq("day", day)
          .maybeSingle(),
      ]);
      for (const r of results) if (r.error) throw r.error;
      const c = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", uid)
        .eq("day", day)
        .single();
      if (c.error) throw c.error;
      setCheckin(c.data);
      setProducts(results[1].data as Product[]);
      setVideos(results[2].data as Video[]);
      setHooks(results[3].data as Hook[]);
      setMetrics(results[4].data as Metrics[]);
      const b = results[5].data as { title: string; content: string } | null;
      setBriefing(
        b
          ? `${b.title || ""}\n\n${b.content || ""}`
          : "Ainda não há um briefing para hoje. Seu diário está pronto para receber suas próprias ideias.",
      );
    } catch (e) {
      setError(failure(e));
    }
  }, [uid, day]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const timer = setInterval(() => setDay(localDay()), 15000);
    const visible = () => {
      if (document.visibilityState === "visible") setDay(localDay());
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  useEffect(() => {
    let alive = true;
    async function sign() {
      const pairs = await Promise.all(
        products
          .filter((p) => p.image_url)
          .map(async (p) => {
            const path = p.image_url!;
            if (path.startsWith("https://")) return [p.id, path];
            const { data } = await supabase.storage
              .from("product-images")
              .createSignedUrl(path, 3600);
            return [p.id, data?.signedUrl || ""];
          }),
      );
      if (alive) setImages(Object.fromEntries(pairs));
    }
    void sign();
    const id = setInterval(() => void sign(), 3000000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [products]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(id);
  }, [toast]);
  async function action(
    fn: () => Promise<void>,
    message = "Salvo no seu chalé.",
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
      setToast(message);
    } catch (e) {
      setError(failure(e));
    } finally {
      setBusy(false);
    }
  }
  async function updateCheck(patch: Partial<Checkin>) {
    if (!checkin) return;
    await action(async () => {
      const { error } = await supabase
        .from("daily_checkins")
        .update(patch)
        .eq("id", checkin.id)
        .eq("user_id", uid);
      if (error) throw error;
    });
  }
  function openProduct(p: Product) {
    setProduct(p);
    setPanel("product");
  }
  function submitProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void action(async () => {
      let path: string | null = null;
      const file = f.get("image") as File;
      if (file?.size) {
        if (file.size > 8 * 1024 * 1024)
          throw new Error("Escolha uma imagem de até 8 MB.");
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
          throw new Error("Use uma imagem JPG, PNG ou WebP.");
        path = `${uid}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type });
        if (error) throw error;
      }
      const { error } = await supabase.from("products").insert({
        user_id: uid,
        name: String(f.get("name")).trim(),
        brand: f.get("brand") || null,
        platform: f.get("platform"),
        acquisition_type: f.get("acquisition_type"),
        received_at: f.get("received_at") || null,
        deadline_at: f.get("deadline_at") || null,
        target_videos: Number(f.get("target_videos")),
        notes: f.get("notes") || null,
        image_url: path,
      });
      if (error) {
        if (path) await supabase.storage.from("product-images").remove([path]);
        throw error;
      }
      setPanel("shelf");
    }, "Uma nova amostra chegou à estante!");
  }
  const currentProduct = products.find((p) => p.id === product?.id) || product;
  const count = (id: string) =>
    videos.filter((v) => v.product_id === id && v.posted_at).length;
  const tasks = checkin
    ? [checkin.yoga_done, checkin.morning_routine_done].filter(Boolean).length
    : 0;
  return (
    <main className="home">
      <header className="home-header">
        <div className="brand">
          <span>⌂</span>
          <div>
            Pauli OS<small>SEU REFÚGIO NAS MONTANHAS</small>
          </div>
        </div>
        <div className="today">
          <span>☀</span>
          <div>
            {new Date(day + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            <small>Um bom dia para começar de novo.</small>
          </div>
        </div>
        <button
          className="quiet"
          disabled={busy}
          onClick={() =>
            void action(async () => {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            })
          }
        >
          Sair ↗
        </button>
      </header>
      <div className="world-top">
        <div>
          <span className="eyebrow">
            {expanded ? "UM CANTINHO SÓ SEU" : "LAR, DOCE LAR"}
          </span>
          <h1>
            {expanded
              ? rooms[expanded].name
              : "Bem-vinda ao seu pequeno mundo."}
          </h1>
        </div>
        {expanded ? (
          <button
            className="secondary"
            onClick={() => {
              setExpanded(null);
              setSelected(null);
            }}
          >
            ← Voltar à casa
          </button>
        ) : (
          <span className="day-badge">✿ {tasks}/2 cuidados de hoje</span>
        )}
      </div>
      <World
        uid={uid}
        fireplace={house.state.fireplace_on}
        onFire={() =>
          void house.save({ fireplace_on: !house.state.fireplace_on })
        }
        expanded={expanded}
        onSelect={setSelected}
        onAction={setPanel}
        products={products}
        images={images}
        onProduct={openProduct}
      />
      {house.error && (
        <p role="alert" className="inline-error">
          Estado da casa: {house.error}
        </p>
      )}
      {selected && (
        <section className="room-choice" aria-label="Cômodo selecionado">
          <div>
            <small>VOCÊ ESCOLHEU</small>
            <strong>{rooms[selected].name}</strong>
          </div>
          <button
            className="primary"
            onClick={() => {
              setExpanded(selected);
              setSelected(null);
            }}
          >
            Entrar / expandir cômodo ↗
          </button>
          <button
            aria-label="Cancelar seleção"
            className="icon-button"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
        </section>
      )}
      <footer className="home-footer">
        <span>♡ Uma vida bonita também é produtiva.</span>
        <span>Pauli & Gepetinho · em casa</span>
      </footer>
      {toast && (
        <div className="toast" role="status">
          ✦ {toast}
        </div>
      )}
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => void load()}>Tentar novamente</button>
          <button aria-label="Dispensar erro" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}
      {panel && (
        <Modal
          title={
            {
              routine: "Seu ritual de hoje",
              journal: "Diário da Pauli",
              shelf: "A estante do estúdio",
              new: "Uma nova amostra",
              product: currentProduct?.name || "Amostra",
              video: "Registrar vídeo publicado",
              hook: "Um novo gancho",
              metrics: "Atualizar resultados",
              rest: "Pode respirar. Você está em casa.",
              gpt: "Oficina de ideias do Gepetinho",
              stars: "O céu também é um lugar para pensar.",
            }[panel] ||
            contentTitles[panel] ||
            "Seu chalé"
          }
          onClose={() => setPanel("")}
        >
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          {toast && (
            <p className="inline-success" role="status">
              {toast}
            </p>
          )}
          {contentPanels.includes(panel) && (
            <HouseContent
              key={panel}
              panel={panel}
              uid={uid}
              day={day}
              checkin={checkin}
              updateCheck={updateCheck}
              onPanel={setPanel}
              house={house}
            />
          )}
          {panel === "routine" && (
            <>
              {checkin ? (
                <>
                  <p className="muted">
                    Pequenos cuidados contam.{" "}
                    {new Date(day + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                  {panel === "routine" && (
                    <>
                      <div className="rituals">
                        {(
                          [
                            ["morning_routine_done", "☀", "Rotina matinal"],
                            ["yoga_done", "✧", "Um tempo para yoga"],
                          ] as const
                        ).map(([key, icon, label]) => (
                          <label key={key}>
                            <span>
                              {icon} {label}
                            </span>
                            <input
                              type="checkbox"
                              checked={checkin[key]}
                              disabled={busy}
                              onChange={(e) =>
                                void updateCheck({ [key]: e.target.checked })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  <p>
                    Seu checklist pessoal. Para escrever sobre o dia, abra o
                    diário no criado-mudo.
                  </p>
                </>
              ) : (
                <p>Carregando o diário…</p>
              )}
            </>
          )}
          {panel === "shelf" && (
            <>
              <p className="muted">
                Cada objeto guarda uma história e uma próxima ideia.
              </p>
              <div className="physical-shelf">
                {products.map((p) => (
                  <button
                    className="sample"
                    key={p.id}
                    onClick={() => openProduct(p)}
                  >
                    {images[p.id] ? (
                      <img src={images[p.id]} alt={p.name} />
                    ) : (
                      <span className="bottle">{p.name.charAt(0)}</span>
                    )}
                    <strong>{p.name}</strong>
                    <small>
                      {count(p.id)} / {p.target_videos} vídeos
                    </small>
                  </button>
                ))}
                {!products.length && (
                  <p>Sua estante está esperando a primeira amostra.</p>
                )}
              </div>
              <button className="primary" onClick={() => setPanel("new")}>
                ＋ Colocar uma amostra na estante
              </button>
            </>
          )}
          {panel === "new" && (
            <form onSubmit={submitProduct}>
              <div className="form-grid">
                <Field label="Nome do produto" name="name" required />
                <Field label="Marca" name="brand" />
                <label>
                  Como chegou?
                  <select name="acquisition_type">
                    <option value="sample">Amostra</option>
                    <option value="purchased">Compra</option>
                    <option value="gifted">Presente</option>
                    <option value="other">Outro</option>
                  </select>
                </label>
                <label>
                  Plataforma
                  <select name="platform">
                    <option value="tiktok_shop">TikTok Shop</option>
                    <option value="shopee">Shopee</option>
                    <option value="other">Outra</option>
                  </select>
                </label>
                <Field
                  label="Recebido em"
                  name="received_at"
                  type="date"
                  value={day}
                />
                <Field label="Prazo" name="deadline_at" type="date" />
                <Field
                  label="Meta de vídeos"
                  name="target_videos"
                  type="number"
                  value={6}
                  required
                />
                <label>
                  Foto · até 8 MB
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </label>
              </div>
              <label>
                Notas
                <textarea name="notes" rows={3} />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? "Guardando…" : "Guardar na estante"}
              </button>
            </form>
          )}
          {panel === "product" &&
            currentProduct &&
            (() => {
              const p = currentProduct;
              const m = metrics.find((m) => m.product_id === p.id);
              return (
                <>
                  <div className="product-intro">
                    {images[p.id] && <img src={images[p.id]} alt={p.name} />}
                    <div>
                      <p>
                        {p.brand || "Sua amostra"} ·{" "}
                        {
                          {
                            sample: "Amostra",
                            purchased: "Compra",
                            gifted: "Presente",
                            other: "Outro",
                          }[p.acquisition_type]
                        }
                      </p>
                      <p className="muted">
                        Recebido: {p.received_at || "Não informado"}
                        <br />
                        Prazo: {p.deadline_at || "Sem prazo"}
                      </p>
                    </div>
                  </div>
                  <div className="progress-label">
                    <strong>
                      {count(p.id)} / {p.target_videos} vídeos publicados
                    </strong>
                    <span>{progress(count(p.id), p.target_videos)}%</span>
                  </div>
                  <progress value={count(p.id)} max={p.target_videos || 1} />
                  <div className="metrics">
                    <div>
                      <small>Visualizações</small>
                      <strong>
                        {m?.total_views.toLocaleString("pt-BR") || "0"}
                      </strong>
                    </div>
                    <div>
                      <small>Vendas</small>
                      <strong>{m?.total_units_sold || 0}</strong>
                    </div>
                    <div>
                      <small>GMV</small>
                      <strong>{money(m?.total_gmv || 0)}</strong>
                    </div>
                    <div>
                      <small>Comissão</small>
                      <strong>{money(m?.total_commission || 0)}</strong>
                    </div>
                  </div>
                  <p className="muted">
                    {m
                      ? `Último registro manual: ${new Date(m.captured_at).toLocaleString("pt-BR")}`
                      : "Sem resultados registrados ainda."}
                  </p>
                  <div className="actions">
                    <button
                      className="primary"
                      onClick={() => setPanel("video")}
                    >
                      ＋ Registrar vídeo
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setPanel("hook")}
                    >
                      ＋ Gancho
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setPanel("metrics")}
                    >
                      Atualizar resultados
                    </button>
                  </div>
                  <h3>Ganchos & descobertas</h3>
                  {hooks
                    .filter((h) => h.product_id === p.id)
                    .map((h) => (
                      <div className="hook" key={h.id}>
                        <p>{h.hook_text}</p>
                        <select
                          aria-label={`Status do gancho ${h.hook_text}`}
                          value={h.status}
                          disabled={busy}
                          onChange={(e) => {
                            const status = e.target.value;
                            void action(async () => {
                              const { error } = await supabase
                                .from("hooks")
                                .update({ status })
                                .eq("id", h.id)
                                .eq("user_id", uid);
                              if (error) throw error;
                            });
                          }}
                        >
                          <option value="idea">Ideia</option>
                          <option value="testing">Em teste</option>
                          <option value="winner">★ Vencedor</option>
                          <option value="retired">Arquivado</option>
                        </select>
                      </div>
                    ))}
                  {!hooks.some((h) => h.product_id === p.id) && (
                    <p className="muted">Qual seria uma boa primeira frase?</p>
                  )}
                  <h3>Vídeos publicados</h3>
                  {videos
                    .filter((v) => v.product_id === p.id)
                    .map((v) => (
                      <p key={v.id}>
                        {v.caption || "Vídeo"} · {v.platform}{" "}
                        {v.url && /^https?:\/\//.test(v.url) && (
                          <a href={v.url} target="_blank" rel="noreferrer">
                            Abrir ↗
                          </a>
                        )}
                      </p>
                    ))}
                  <h3>Notas</h3>
                  <p className="preserve">
                    {p.notes || "Nenhuma anotação ainda."}
                  </p>
                </>
              );
            })()}
          {panel === "video" && currentProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action(async () => {
                  const hook = hooks.find((h) => h.id === f.get("hook_id"));
                  const { error } = await supabase.from("videos").insert({
                    user_id: uid,
                    product_id: currentProduct.id,
                    platform: f.get("platform"),
                    posted_at: new Date(
                      String(f.get("posted_at")),
                    ).toISOString(),
                    url: f.get("url") || null,
                    caption: f.get("caption") || null,
                    hook_id: hook?.id || null,
                    hook_snapshot: hook?.hook_text || null,
                  });
                  if (error) throw error;
                  setPanel("product");
                }, "Mais um vídeo no mundo!");
              }}
            >
              <Field label="Título / legenda" name="caption" />
              <Field label="Link do vídeo" name="url" type="url" />
              <Field
                label="Publicado em"
                name="posted_at"
                type="datetime-local"
                value={day + "T12:00"}
                required
              />
              <label>
                Plataforma
                <select name="platform">
                  <option value="tiktok_shop">TikTok Shop</option>
                  <option value="shopee">Shopee</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Outra</option>
                </select>
              </label>
              <label>
                Gancho usado
                <select name="hook_id">
                  <option value="">Sem gancho vinculado</option>
                  {hooks
                    .filter((h) => h.product_id === currentProduct.id)
                    .map((h) => (
                      <option value={h.id} key={h.id}>
                        {h.hook_text}
                      </option>
                    ))}
                </select>
              </label>
              <p className="muted">
                O vídeo entra no progresso desta amostra. Os contadores do
                diário são registros independentes do seu dia.
              </p>
              <button className="primary" disabled={busy}>
                Registrar publicação
              </button>
            </form>
          )}
          {panel === "hook" && currentProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action(async () => {
                  const { error } = await supabase.from("hooks").insert({
                    user_id: uid,
                    product_id: currentProduct.id,
                    hook_text: f.get("hook_text"),
                    status: f.get("status"),
                  });
                  if (error) throw error;
                  setPanel("product");
                });
              }}
            >
              <label>
                A frase que faz parar o scroll
                <textarea name="hook_text" required rows={4} />
              </label>
              <label>
                Momento do gancho
                <select name="status">
                  <option value="idea">Ideia</option>
                  <option value="testing">Em teste</option>
                  <option value="winner">Vencedor</option>
                </select>
              </label>
              <button className="primary" disabled={busy}>
                Guardar gancho
              </button>
            </form>
          )}
          {panel === "metrics" && currentProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action(async () => {
                  const { error } = await supabase
                    .from("product_metric_snapshots")
                    .insert({
                      user_id: uid,
                      product_id: currentProduct.id,
                      total_views: Number(f.get("total_views")),
                      total_units_sold: Number(f.get("total_units_sold")),
                      total_gmv: Number(f.get("total_gmv")),
                      total_commission: Number(f.get("total_commission")),
                    });
                  if (error) throw error;
                  setPanel("product");
                });
              }}
            >
              <p className="muted">
                Registre os totais acumulados do produto. Cada atualização
                preserva o histórico anterior.
              </p>
              <div className="form-grid">
                {(
                  [
                    "total_views",
                    "total_units_sold",
                    "total_gmv",
                    "total_commission",
                  ] as const
                ).map((key, i) => (
                  <Field
                    key={key}
                    name={key}
                    label={
                      [
                        "Visualizações",
                        "Unidades vendidas",
                        "GMV (R$)",
                        "Comissão (R$)",
                      ][i]
                    }
                    type="number"
                    value={
                      metrics.find((m) => m.product_id === currentProduct.id)?.[
                        key
                      ] || 0
                    }
                    required
                  />
                ))}
              </div>
              <button className="primary" disabled={busy}>
                Guardar resultados
              </button>
            </form>
          )}
          {panel === "rest" && (
            <div className="story">
              <span>☕</span>
              <p>
                A lareira está acesa. O chá está quente.
                <br />
                Você não precisa produzir a cada minuto.
              </p>
              <p className="muted">
                Este será o espaço de encontro dos moradores da casa. Por hoje,
                aproveite a pausa.
              </p>
              <button className="secondary" onClick={() => setPanel("")}>
                Voltar devagar
              </button>
            </div>
          )}
          {panel === "gpt" && (
            <div className="story">
              <span>✦</span>
              <p>“Deixei uma luz acesa para a sua próxima ideia.”</p>
              <p className="muted">
                O Gepetinho já mora aqui e passeia pela casa. As conversas e a
                autonomia dos agentes chegam em uma próxima etapa.
              </p>
              <button className="secondary" onClick={() => setPanel("journal")}>
                Guardar uma ideia no diário
              </button>
            </div>
          )}
          {panel === "stars" && (
            <div className="story">
              <span>☾</span>
              <p>
                Entre as montanhas e as estrelas,
                <br />
                há espaço para todos os seus próximos capítulos.
              </p>
              <p className="muted">
                O observatório do Gepetinho é um cantinho para imaginar o que
                vem depois.
              </p>
            </div>
          )}
        </Modal>
      )}
      {recovery && (
        <Modal title="Uma nova chave para o chalé" onClose={onRecovered}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const password = String(
                new FormData(e.currentTarget).get("password"),
              );
              void action(async () => {
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                onRecovered();
              }, "Senha atualizada. Bem-vinda de volta!");
            }}
          >
            <label>
              Nova senha
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <button className="primary" disabled={busy}>
              Salvar nova senha
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
}

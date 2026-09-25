import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type FormEvent,
} from "react";
import { supabase, failure, type Checkin } from "./supabase";

import { safeUrl } from "./inhabitants.mjs";
import { houseAgent } from "./agents";
type RecordItem = {
  id: string;
  kind: string;
  day: string;
  title: string;
  content: string;
  url: string | null;
  image_url: string | null;
  category: string | null;
  duration_minutes: number | null;
  opened_at: string | null;
  read_at: string | null;
  completed_at: string | null;
};
type Brief = {
  id: string;
  day: string;
  title: string;
  content: string;
  categories: string[];
  sources: string[];
  opened_at: string | null;
  read_at: string | null;
};
export const contentPanels = [
  "fridge",
  "journal",
  "yoga",
  "remember",
  "computer",
  "briefing",
  "news",
  "radio",
  "archive",
  "idea",
  "chat",
  "experiment",
  "work",
  "task",
];
export const contentTitles: Record<string, string> = {
  fridge: "Geladeira · meu dia",
  journal: "Entre você e estas páginas",
  yoga: "Um tempo no seu tapete",
  remember: "Daily Remembers · pessoal",
  computer: "Computador · TikTok",
  briefing: "Daily Briefing",
  news: "O jornal da cozinha",
  radio: "O rádio da casa",
  archive: "Biblioteca de memórias",
  idea: "Coisas que o Gepetinho está pensando",
  chat: "Uma conversa à janela",
  experiment: "O porão das possibilidades",
  work: "Café Work · trabalho profissional",
  task: "Tarefas e planejamento · TikTok",
};
export type HouseState = {
  fireplace_on: boolean;
  radio_on: boolean;
  radio_volume: number;
};
export function useHouseState(uid: string) {
  const [state, setState] = useState<HouseState>({
    fireplace_on: false,
    radio_on: false,
    radio_volume: 50,
  });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let alive = true;
    void supabase
      .from("house_state")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(failure(error));
        else {
          if (data) setState(data);
          setReady(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [uid]);
  const save = async (patch: Partial<HouseState>) => {
    if (!ready || saving) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("house_state").upsert(
      {
        ...state,
        user_id: uid,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) setError(failure(error));
    else setState((s) => ({ ...s, ...patch }));
    setSaving(false);
  };
  return { state, save, error, ready, saving };
}
export default function HouseContent({
  panel,
  uid,
  day,
  checkin,
  updateCheck,
  onPanel,
  house,
}: {
  panel: string;
  uid: string;
  day: string;
  checkin: Checkin | null;
  updateCheck: (p: Partial<Checkin>) => Promise<void>;
  onPanel: (p: string) => void;
  house: ReturnType<typeof useHouseState>;
}) {
  const [date, setDate] = useState(day),
    [content, setContent] = useState(""),
    [mood, setMood] = useState("");
  const [items, setItems] = useState<RecordItem[]>([]),
    [briefs, setBriefs] = useState<Brief[]>([]),
    [opened, setOpened] = useState<RecordItem | null>(null),
    [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [archivedBrief, setArchivedBrief] = useState<Brief | null>(null);
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const request = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      if (panel === "journal") {
        const r = await supabase
          .from("journal_entries")
          .select("content,mood")
          .eq("user_id", uid)
          .eq("entry_date", date)
          .maybeSingle();
        if (request !== requestId.current) return;
        if (r.error) throw r.error;
        setContent(r.data?.content || "");
        setMood(r.data?.mood || "");
      } else if (panel === "briefing") {
        const r = await supabase
          .from("briefings")
          .select("*")
          .eq("user_id", uid)
          .eq("day", date)
          .maybeSingle();
        if (request !== requestId.current) return;
        if (r.error) throw r.error;
        setBrief(r.data);
        if (r.data && !r.data.opened_at) {
          const u = await supabase
            .from("briefings")
            .update({ opened_at: new Date().toISOString() })
            .eq("id", r.data.id)
            .eq("user_id", uid);
          if (u.error) throw u.error;
        }
      } else if (panel === "archive") {
        const [r, b] = await Promise.all([
          supabase
            .from("house_records")
            .select("*")
            .eq("user_id", uid)
            .in("kind", ["remember", "idea"])
            .order("day", { ascending: false }),
          supabase
            .from("briefings")
            .select("*")
            .eq("user_id", uid)
            .order("day", { ascending: false }),
        ]);
        if (request !== requestId.current) return;
        if (r.error) throw r.error;
        if (b.error) throw b.error;
        setItems(r.data || []);
        setBriefs(b.data || []);
      } else if (
        [
          "yoga",
          "remember",
          "news",
          "idea",
          "experiment",
          "work",
          "task",
        ].includes(panel)
      ) {
        let query = supabase
          .from("house_records")
          .select("*")
          .eq("user_id", uid)
          .eq("kind", panel)
          .order("day", { ascending: false })
          .order("created_at", { ascending: false });
        if (["yoga", "remember", "news"].includes(panel))
          query = query.eq("day", day);
        const r = await query;
        if (request !== requestId.current) return;
        if (r.error) throw r.error;
        setItems(r.data || []);
      }
    } catch (e) {
      if (request === requestId.current) setError(failure(e));
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [panel, uid, day, date]);
  useEffect(() => {
    void load();
    return () => {
      requestId.current++;
    };
  }, [load]);
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice("Guardado com carinho.");
      await load();
    } catch (e) {
      setError(failure(e));
    } finally {
      setBusy(false);
    }
  }
  async function mark(
    item: RecordItem,
    field: "opened_at" | "read_at" | "completed_at",
    reset = false,
  ) {
    const patch = { [field]: reset ? null : new Date().toISOString() };
    const r = await supabase
      .from("house_records")
      .update(patch)
      .eq("id", item.id)
      .eq("user_id", uid);
    if (r.error) throw r.error;
    setOpened({ ...item, ...patch });
  }
  function newRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    void run(async () => {
      const url = String(f.get("url") || ""),
        image = String(f.get("image_url") || "");
      if ((url && !safeUrl(url)) || (image && !safeUrl(image)))
        throw Error("Use um link completo começando com https://.");
      const r = await supabase.from("house_records").insert({
        user_id: uid,
        kind: panel,
        day: String(f.get("day") || day),
        title: String(f.get("title")),
        content: String(f.get("content") || ""),
        url: url || null,
        image_url: image || null,
        category: String(f.get("category") || "") || null,
        duration_minutes: Number(f.get("duration_minutes")) || null,
      });
      if (r.error) throw r.error;
      form.reset();
    });
  }
  const editor = (
    <details className="content-editor">
      <summary>Adicionar uma página</summary>
      <form onSubmit={newRecord}>
        <label>
          Título
          <input name="title" required maxLength={180} />
        </label>
        <label>
          Data
          <input name="day" type="date" defaultValue={day} required />
        </label>
        <label>
          Texto / detalhes
          <textarea name="content" rows={4} />
        </label>
        <button className="primary" disabled={busy}>
          Salvar
        </button>
      </form>
    </details>
  );
  const statuses = (i: RecordItem) => (
    <p className="content-status">
      {i.opened_at ? "Aberto ✓" : "Ainda não aberto"} ·{" "}
      {i.read_at ? "Lido ✓" : "Leitura não confirmada"} ·{" "}
      {i.completed_at ? "Concluído ✓" : "Não concluído"}
    </p>
  );
  return (
    <div className="house-content">
      {error && (
        <p role="alert" className="inline-error">
          {error} <button onClick={() => void load()}>Tentar novamente</button>
        </p>
      )}
      {notice && (
        <p role="status" className="inline-success">
          {notice}
        </p>
      )}
      {loading ? (
        <p>Preparando este cantinho…</p>
      ) : (
        <>
          {panel === "fridge" && (
            <QuickFood key={uid + day} uid={uid} day={day} />
          )}
          {panel === "journal" && (
            <div className="paper-panel">
              <p>
                Estas páginas são só suas. Pode escrever sem precisar resolver
                nada.
              </p>
              <label>
                Data da página
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value || day)}
                />
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const r = await supabase.from("journal_entries").upsert(
                      {
                        user_id: uid,
                        entry_date: date,
                        content,
                        mood,
                        updated_at: new Date().toISOString(),
                      },
                      { onConflict: "user_id,entry_date" },
                    );
                    if (r.error) throw r.error;
                  });
                }}
              >
                <label>
                  Como está seu coração?
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  >
                    <option value="">Prefiro só escrever</option>
                    {[
                      "Em paz",
                      "Feliz",
                      "Cansada",
                      "Ansiosa",
                      "Triste",
                      "Um pouco de tudo",
                    ].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Querido diário…
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="O que aconteceu hoje? Como isso fez você se sentir?"
                    rows={9}
                  />
                </label>
                <button className="primary" disabled={busy}>
                  Guardar esta página
                </button>
              </form>
            </div>
          )}
          {panel === "yoga" && (
            <div className="paper-panel">
              <h3>Respirar também é avançar.</h3>
              {items[0] ? (
                <>
                  <h3>{items[0].title}</h3>
                  <p>
                    {items[0].duration_minutes} minutos · {items[0].content}
                  </p>
                  <a
                    className="primary"
                    href={safeUrl(items[0].url)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => void run(() => mark(items[0], "opened_at"))}
                  >
                    Assistir no YouTube
                  </a>
                </>
              ) : (
                <p>O vídeo de hoje ainda não chegou 🌿</p>
              )}
              <label className="yoga-check">
                <input
                  type="checkbox"
                  checked={checkin?.yoga_done || false}
                  disabled={busy || !checkin}
                  onChange={(e) =>
                    void run(() => updateCheck({ yoga_done: e.target.checked }))
                  }
                />{" "}
                Yoga feito hoje
              </label>
            </div>
          )}
          {panel === "computer" && (
            <div className="computer-hub">
              <small>PAULI STUDIO · TIKTOK</small>
              <h3>Uma ideia de cada vez.</h3>
              <div className="hub-actions">
                <button className="primary" onClick={() => onPanel("shelf")}>
                  Produtos, vídeos e resultados
                </button>
                <button className="secondary" onClick={() => onPanel("new")}>
                  Nova amostra
                </button>
                <button
                  className="secondary"
                  onClick={() => onPanel("briefing")}
                >
                  Daily Briefing
                </button>
                <button className="secondary" onClick={() => onPanel("task")}>
                  Tarefas e planejamento
                </button>
              </div>
              <p>
                Os vídeos, hooks, vendas, views, GMV e comissões estão dentro de
                cada produto.
              </p>
              <label>
                Vídeos TikTok publicados hoje
                <input
                  type="number"
                  min="0"
                  defaultValue={checkin?.tiktok_videos_count || 0}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (
                      Number.isInteger(n) &&
                      n >= 0 &&
                      n !== checkin?.tiktok_videos_count
                    )
                      void updateCheck({ tiktok_videos_count: n });
                  }}
                />
              </label>
            </div>
          )}
          {panel === "briefing" && (
            <>
              <label>
                Dia do briefing
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value || day)}
                />
              </label>
              {brief ? (
                <article className="paper-panel">
                  <small>{brief.categories.join(" · ")}</small>
                  <h3>{brief.title}</h3>
                  <p className="preserve">{brief.content}</p>
                  {brief.sources
                    .filter((s) => safeUrl(s))
                    .map((s) => (
                      <p key={s}>
                        <a href={safeUrl(s)} target="_blank" rel="noreferrer">
                          {s}
                        </a>
                      </p>
                    ))}
                  <p className="content-status">
                    Abertura registrada ·{" "}
                    {brief.read_at
                      ? "Leitura confirmada"
                      : "Ainda não marcado como lido"}
                  </p>
                  <button
                    className="primary"
                    disabled={busy || !!brief.read_at}
                    onClick={() =>
                      void run(async () => {
                        const r = await supabase
                          .from("briefings")
                          .update({ read_at: new Date().toISOString() })
                          .eq("id", brief.id)
                          .eq("user_id", uid);
                        if (r.error) throw r.error;
                        if (date === day)
                          await updateCheck({ briefing_read: true });
                      })
                    }
                  >
                    Li este briefing
                  </button>
                </article>
              ) : (
                <p>O briefing deste dia ainda não chegou.</p>
              )}
            </>
          )}
          {panel === "radio" && (
            <div className="radio-face">
              <div className="radio-dial">
                {house.state.radio_on ? "◉ LIGADO" : "○ DESLIGADO"}
              </div>
              <p>Seu rádio espera uma trilha sonora.</p>
              <button
                className="secondary"
                disabled={!house.ready || house.saving}
                onClick={() =>
                  void house.save({ radio_on: !house.state.radio_on })
                }
              >
                {house.state.radio_on ? "Desligar" : "Ligar"} rádio
              </button>
              <label>
                Volume · {house.state.radio_volume}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={house.state.radio_volume}
                  onPointerUp={(e) =>
                    void house.save({
                      radio_volume: Number(e.currentTarget.value),
                    })
                  }
                  onKeyUp={(e) =>
                    void house.save({
                      radio_volume: Number(e.currentTarget.value),
                    })
                  }
                />
              </label>
              <p>
                Spotify ainda não conectado. Ligar o rádio, por enquanto, só
                altera seu estado visual.
              </p>
              <a
                href="https://open.spotify.com/"
                target="_blank"
                rel="noreferrer"
              >
                Abrir Spotify ↗
              </a>
              {house.error && <p role="alert">{house.error}</p>}
            </div>
          )}
          {panel === "news" && (
            <>
              <div className="newspaper">
                <small>
                  EDIÇÃO DO DIA ·{" "}
                  {new Date(day + "T12:00:00").toLocaleDateString("pt-BR")}
                </small>
                <h3>O Jornal do Chalé</h3>
                {items.length ? (
                  (() => {
                    const n = items[Math.min(page, items.length - 1)];
                    return (
                      <article key={n.id}>
                        {n.image_url && safeUrl(n.image_url) && (
                          <img src={safeUrl(n.image_url)} alt="" />
                        )}
                        <h2>{n.title}</h2>
                        <p>{n.content}</p>
                        <p>Fonte: {n.category || "Não informada"}</p>
                        <a
                          href={safeUrl(n.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ler mais ↗
                        </a>
                        <div className="page-nav">
                          <button
                            className="secondary"
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                          >
                            ← Anterior
                          </button>
                          <span>
                            {page + 1}/{items.length}
                          </span>
                          <button
                            className="secondary"
                            disabled={page >= items.length - 1}
                            onClick={() => setPage((p) => p + 1)}
                          >
                            Próxima →
                          </button>
                        </div>
                      </article>
                    );
                  })()
                ) : (
                  <p>O jornal de hoje ainda não chegou.</p>
                )}
              </div>
            </>
          )}
          {[
            "remember",
            "idea",
            "experiment",
            "work",
            "task",
            "archive",
          ].includes(panel) && (
            <>
              {panel === "work" && (
                <p>
                  Trabalho profissional/PJ. Este caderno fica separado do TikTok
                  e da vida pessoal.
                </p>
              )}
              {panel === "idea" && (
                <p>
                  Ideias deixadas manualmente na oficina. Nenhuma IA está
                  gerando conteúdo por aqui ainda.
                </p>
              )}
              {panel === "archive" ? (
                <div className="book-spines">
                  {briefs.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setArchivedBrief(b);
                        void run(async () => {
                          const r = await supabase
                            .from("briefings")
                            .update({
                              opened_at:
                                b.opened_at || new Date().toISOString(),
                            })
                            .eq("id", b.id)
                            .eq("user_id", uid);
                          if (r.error) throw r.error;
                        });
                      }}
                    >
                      {b.title}
                      <small>{b.day} · briefing</small>
                    </button>
                  ))}
                  {items.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => void run(() => mark(i, "opened_at"))}
                    >
                      {i.title}
                      <small>
                        {i.day} ·{" "}
                        {i.kind === "remember" ? "Daily Remembers" : "ideia"}
                      </small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="content-stack">
                  {items.map((i) => (
                    <article key={i.id}>
                      <h3>{i.title}</h3>
                      <small>{i.day}</small>
                      {statuses(i)}
                      <div className="actions">
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => void run(() => mark(i, "opened_at"))}
                        >
                          Abrir página
                        </button>
                        {["task", "work"].includes(panel) && (
                          <button
                            className="secondary"
                            disabled={busy}
                            onClick={() =>
                              void run(() =>
                                mark(i, "completed_at", !!i.completed_at),
                              )
                            }
                          >
                            {i.completed_at
                              ? "Reabrir tarefa"
                              : "Concluir tarefa"}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {!items.length && !(panel === "archive" && briefs.length > 0) && (
                <p>
                  Este cantinho ainda não tem páginas. Tudo começa com a
                  primeira.
                </p>
              )}
              {archivedBrief && panel === "archive" && (
                <article className="paper-panel">
                  <button
                    className="secondary"
                    onClick={() => setArchivedBrief(null)}
                  >
                    Fechar briefing
                  </button>
                  <small>{archivedBrief.day}</small>
                  <h3>{archivedBrief.title}</h3>
                  <p className="preserve">{archivedBrief.content}</p>
                  <button
                    className="primary"
                    disabled={busy || !!archivedBrief.read_at}
                    onClick={() =>
                      void run(async () => {
                        const read_at = new Date().toISOString();
                        const r = await supabase
                          .from("briefings")
                          .update({ read_at })
                          .eq("id", archivedBrief.id)
                          .eq("user_id", uid);
                        if (r.error) throw r.error;
                        setArchivedBrief({ ...archivedBrief, read_at });
                      })
                    }
                  >
                    {archivedBrief.read_at
                      ? "Leitura confirmada"
                      : "Li este briefing"}
                  </button>
                </article>
              )}
              {opened && (
                <article className="paper-panel">
                  <button className="secondary" onClick={() => setOpened(null)}>
                    Fechar página
                  </button>
                  <h3>{opened.title}</h3>
                  <p className="preserve">{opened.content}</p>
                  {statuses(opened)}
                  <div className="hub-actions">
                    <button
                      className="secondary"
                      disabled={busy || !!opened.read_at}
                      onClick={() => void run(() => mark(opened, "read_at"))}
                    >
                      Marcar como lido
                    </button>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(() =>
                          mark(opened, "completed_at", !!opened.completed_at),
                        )
                      }
                    >
                      {opened.completed_at
                        ? "Reabrir tarefa relacionada"
                        : "Concluir tarefa relacionada"}
                    </button>
                  </div>
                </article>
              )}
              {panel !== "archive" && editor}
            </>
          )}
          {panel === "chat" && (
            <div className="chat-placeholder">
              <h3>Gepetinho está em casa.</h3>
              <p>
                A janela de conversa está reservada. Por enquanto, ele vive sua
                rotina e deixa espaço para suas ideias.
              </p>
              <textarea
                aria-label="Mensagem para Gepetinho"
                placeholder="Conversa direta disponível em uma próxima etapa"
                disabled
              />
              <button className="secondary" disabled={!houseAgent.enabled}>
                Conversa ainda não ativada
              </button>
              <p>Nenhum serviço de IA conectado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const mealTypes = [
  ["breakfast", "Café da manhã"],
  ["lunch", "Almoço"],
  ["afternoon_snack", "Lanche da tarde"],
  ["dinner", "Jantar"],
  ["craving", "Vontade do dia"],
] as const;
type MealDraft = {
  id: string;
  meal_type: string;
  description: string;
  eaten: boolean;
  source: string;
  notes: string | null;
};
function QuickFood({ uid, day }: { uid: string; day: string }) {
  const [meals, setMeals] = useState<Record<string, MealDraft>>({});
  const [dirty, setDirty] = useState<string[]>([]),
    [waterDirty, setWaterDirty] = useState(false);
  const [bottles, setBottles] = useState(0),
    [bottleMl, setBottleMl] = useState(700);
  const [regimen, setRegimen] = useState<{ id: string; name: string } | null>(
      null,
    ),
    [taken, setTaken] = useState(false);
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [vitaminBusy, setVitaminBusy] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const savingRef = useRef(false),
    vitaminRef = useRef(false);
  useEffect(() => {
    let alive = true;
    async function loadFood() {
      setLoading(true);
      setError("");
      try {
        const results = await Promise.all([
          supabase
            .from("meal_entries")
            .select("id,meal_type,description,eaten,source,notes")
            .eq("user_id", uid)
            .eq("day", day)
            .order("created_at", { ascending: false }),
          supabase
            .from("hydration_daily")
            .select("bottles,bottle_ml")
            .eq("user_id", uid)
            .eq("day", day)
            .maybeSingle(),
          supabase
            .from("supplement_regimens")
            .select("id,name")
            .eq("user_id", uid)
            .eq("active", true)
            .eq("frequency", "daily")
            .eq("name", "A-Z Mulher")
            .lte("started_on", day)
            .order("created_at", { ascending: false })
            .limit(1),
        ]);
        for (const r of results) if (r.error) throw r.error;
        if (!alive) return;
        const rows = results[0].data as MealDraft[];
        setMeals(
          Object.fromEntries(
            mealTypes.map(([type]) => [
              type,
              rows.find((m) => m.meal_type === type) || {
                id: crypto.randomUUID(),
                meal_type: type,
                description: "",
                eaten: false,
                source: "home",
                notes: null,
              },
            ]),
          ),
        );
        const water = results[1].data as {
          bottles: number;
          bottle_ml: number;
        } | null;
        setBottles(Number(water?.bottles || 0));
        setBottleMl(water?.bottle_ml || 700);
        const active =
          (results[2].data as { id: string; name: string }[])[0] || null;
        if (active) {
          const r = await supabase
            .from("supplement_checkins")
            .select("taken")
            .eq("user_id", uid)
            .eq("regimen_id", active.id)
            .eq("day", day)
            .maybeSingle();
          if (r.error) throw r.error;
          if (alive) {
            setTaken(r.data?.taken || false);
            setRegimen(active);
          }
        }
      } catch (e) {
        if (alive) setError(failure(e));
      } finally {
        if (alive) setLoading(false);
      }
    }
    void loadFood();
    return () => {
      alive = false;
    };
  }, [uid, day]);
  function edit(type: string, patch: Partial<MealDraft>) {
    setMeals((m) => ({ ...m, [type]: { ...m[type], ...patch } }));
    setDirty((d) => (d.includes(type) ? d : [...d, type]));
    setNotice("");
  }
  async function saveFood(e: FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      // Stable primary IDs make retries idempotent without adding a database constraint.
      for (const type of dirty) {
        const r = await supabase
          .from("meal_entries")
          .upsert(
            {
              ...meals[type],
              user_id: uid,
              day,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          );
        if (r.error) throw r.error;
      }
      if (waterDirty) {
        const r = await supabase
          .from("hydration_daily")
          .upsert(
            {
              user_id: uid,
              day,
              bottle_ml: bottleMl,
              bottles,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,day" },
          );
        if (r.error) throw r.error;
      }
      setDirty([]);
      setWaterDirty(false);
      setNotice("Dia salvo.");
    } catch (e) {
      setError(failure(e));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  async function saveVitamin(value: boolean) {
    if (!regimen || vitaminRef.current) return;
    vitaminRef.current = true;
    setVitaminBusy(true);
    setError("");
    try {
      const r = await supabase
        .from("supplement_checkins")
        .upsert(
          {
            user_id: uid,
            regimen_id: regimen.id,
            day,
            taken: value,
            taken_at: value ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "regimen_id,day" },
        );
      if (r.error) throw r.error;
      setTaken(value);
      setNotice("Vitamina registrada.");
    } catch (e) {
      setError(failure(e));
    } finally {
      vitaminRef.current = false;
      setVitaminBusy(false);
    }
  }
  return (
    <div className="quick-food">
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="inline-success" role="status">
          {notice}
        </p>
      )}
      {loading ? (
        <p>Carregando seu dia…</p>
      ) : Object.keys(meals).length > 0 ? (
        <>
          <form onSubmit={saveFood}>
            <fieldset disabled={saving} className="food-fields">
              {mealTypes
                .filter(([type]) => type !== "craving")
                .map(([type, label]) => (
                  <div className="meal-line" key={type}>
                    <div className="meal-heading">
                      <strong>{label}</strong>
                      <label>
                        <input
                          type="checkbox"
                          checked={meals[type].eaten}
                          onChange={(e) =>
                            edit(type, { eaten: e.target.checked })
                          }
                          aria-label={`${label}: fiz`}
                        />{" "}
                        Fiz
                      </label>
                      {type !== "breakfast" && (
                        <label className="ifood">
                          <input
                            type="checkbox"
                            checked={meals[type].source === "ifood"}
                            onChange={(e) =>
                              edit(type, {
                                source: e.target.checked ? "ifood" : "home",
                              })
                            }
                            aria-label={`${label}: iFood`}
                          />{" "}
                          iFood
                        </label>
                      )}
                    </div>
                    <input
                      className="meal-description"
                      aria-label={`${label}: o que comi?`}
                      placeholder="o que comi? (opcional)"
                      maxLength={500}
                      value={meals[type].description}
                      onChange={(e) =>
                        edit(type, { description: e.target.value })
                      }
                    />
                  </div>
                ))}
              <div className="water-line">
                <strong>🥤 Água</strong>
                <button
                  type="button"
                  className="secondary"
                  aria-label="Menos uma garrafa"
                  disabled={bottles <= 0}
                  onClick={() => {
                    setBottles((b) => Math.max(0, b - 1));
                    setWaterDirty(true);
                    setNotice("");
                  }}
                >
                  −
                </button>
                <output aria-label="Garrafas de água">{bottles}</output>
                <button
                  type="button"
                  className="secondary"
                  aria-label="Mais uma garrafa"
                  onClick={() => {
                    setBottles((b) => b + 1);
                    setWaterDirty(true);
                    setNotice("");
                  }}
                >
                  +
                </button>
                <small>
                  {bottleMl} ml cada ·{" "}
                  {((bottles * bottleMl) / 1000).toLocaleString("pt-BR")} L
                </small>
              </div>
              <div className="meal-line">
                <strong>Vontade do dia</strong>
                <input
                  aria-label="Vontade do dia"
                  placeholder="Hoje fiquei com vontade de…"
                  maxLength={500}
                  value={meals.craving.description}
                  onChange={(e) =>
                    edit("craving", { description: e.target.value })
                  }
                />
                <div className="craving-options">
                  <label>
                    <input
                      type="radio"
                      name="craving-eaten"
                      checked={meals.craving.eaten}
                      onChange={() => edit("craving", { eaten: true })}
                    />{" "}
                    Comi
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="craving-eaten"
                      checked={!meals.craving.eaten}
                      onChange={() => edit("craving", { eaten: false })}
                    />{" "}
                    Não comi
                  </label>
                </div>
              </div>
              <button
                className="primary"
                disabled={saving || (!dirty.length && !waterDirty)}
              >
                {saving ? "Salvando…" : "Salvar dia"}
              </button>
            </fieldset>
          </form>
          {regimen && (
            <label className="vitamin-check">
              <span>💊 Vitamina {regimen.name}</span>
              <span>
                <input
                  type="checkbox"
                  checked={taken}
                  disabled={vitaminBusy}
                  onChange={(e) => void saveVitamin(e.target.checked)}
                />{" "}
                Tomei hoje
              </span>
            </label>
          )}
        </>
      ) : (
        <p>
          Não foi possível carregar os registros. Feche e abra a geladeira para
          tentar novamente.
        </p>
      )}
    </div>
  );
}

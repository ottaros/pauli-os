import { useEffect, useRef, useState } from "react";
import type { Product } from "./supabase";
import Avatar from "./Avatar";
import RoomArt from "./RoomArt";
import {
  approach,
  arrive,
  canEnter,
  leave,
  weatherKind,
  worldPath,
} from "./inhabitants.mjs";

import "./house.css";
export type Room =
  | "pauli"
  | "studio"
  | "living"
  | "gpt"
  | "kitchen"
  | "library"
  | "basement"
  | "cafe";
export const rooms: Record<
  Room,
  { name: string; subtitle: string; x: number; y: number; floor: number }
> = {
  pauli: {
    name: "Quarto da Pauli",
    subtitle: "Seu tempo. Seus sentimentos. Seu lugar.",
    x: 30,
    y: 29,
    floor: 48,
  },
  studio: {
    name: "Escritório + estúdio",
    subtitle: "TikTok, criação e pequenas conquistas.",
    x: 70,
    y: 29,
    floor: 48,
  },
  living: {
    name: "Sala de estar",
    subtitle: "Pausa também faz parte do caminho.",
    x: 30,
    y: 61,
    floor: 79,
  },
  gpt: {
    name: "Quarto do Gepetinho",
    subtitle: "Uma oficina para ideias ainda sem nome.",
    x: 70,
    y: 61,
    floor: 79,
  },
  kitchen: {
    name: "Cozinha",
    subtitle: "O café está quase pronto.",
    x: 14,
    y: 86,
    floor: 89,
  },
  library: {
    name: "Biblioteca",
    subtitle: "Tudo que vale a pena guardar.",
    x: 40,
    y: 86,
    floor: 89,
  },
  basement: {
    name: "Porão",
    subtitle: "Algumas ideias precisam de pouca luz.",
    x: 63,
    y: 86,
    floor: 89,
  },
  cafe: {
    name: "Café Work",
    subtitle: "Um lugar para o trabalho, outro ritmo para o dia.",
    x: 85,
    y: 92,
    floor: 95,
  },
};
type Pose = "idle" | "walking" | "sitting" | "lying" | "using" | "drinking";
type Resident = {
  room: Room;
  x: number;
  y: number;
  pose: Pose;
  target: string | null;
  coffee: boolean;
  mapX?: number;
  mapY?: number;
};
type ObjectSpec = {
  id: string;
  room: Room;
  label: string;
  x: number;
  y: number;
  pose: Pose;
  action?: string;
};
export const objects: ObjectSpec[] = [
  {
    id: "bed",
    room: "pauli",
    label: "Deitar na cama",
    x: 37,
    y: 61,
    pose: "lying",
  },
  {
    id: "routine",
    room: "pauli",
    label: "Rotina pessoal",
    x: 57,
    y: 64,
    pose: "using",
    action: "routine",
  },
  {
    id: "yoga",
    room: "pauli",
    label: "Tapete de yoga",
    x: 79,
    y: 83,
    pose: "sitting",
    action: "yoga",
  },
  {
    id: "journal",
    room: "pauli",
    label: "Meu diário",
    x: 19,
    y: 62,
    pose: "sitting",
    action: "journal",
  },
  {
    id: "remember",
    room: "pauli",
    label: "Daily Remembers",
    x: 67,
    y: 43,
    pose: "using",
    action: "remember",
  },
  {
    id: "sofa",
    room: "living",
    label: "Sentar no sofá",
    x: 57,
    y: 54,
    pose: "sitting",
  },
  { id: "fire", room: "living", label: "Lareira", x: 20, y: 61, pose: "using" },
  {
    id: "computer",
    room: "studio",
    label: "Abrir computador · TikTok",
    x: 34,
    y: 68,
    pose: "sitting",
    action: "computer",
  },
  {
    id: "shelf",
    room: "studio",
    label: "Estante de amostras",
    x: 77,
    y: 64,
    pose: "using",
    action: "shelf",
  },
  {
    id: "coffee",
    room: "kitchen",
    label: "Preparar café",
    x: 18,
    y: 67,
    pose: "using",
  },
  {
    id: "table",
    room: "kitchen",
    label: "Sentar à mesa",
    x: 52,
    y: 77,
    pose: "sitting",
  },
  {
    id: "newspaper",
    room: "kitchen",
    label: "Jornal do dia",
    x: 56,
    y: 67,
    pose: "sitting",
    action: "news",
  },
  {
    id: "radio",
    room: "kitchen",
    label: "Rádio",
    x: 29,
    y: 52,
    pose: "using",
    action: "radio",
  },
  {
    id: "archive",
    room: "library",
    label: "Livros e memórias",
    x: 23,
    y: 61,
    pose: "using",
    action: "archive",
  },
  {
    id: "reading",
    room: "library",
    label: "Sentar para ler",
    x: 52,
    y: 77,
    pose: "sitting",
  },
  {
    id: "ideas",
    room: "gpt",
    label: "Coisas que o Gepetinho está pensando",
    x: 22,
    y: 61,
    pose: "using",
    action: "idea",
  },
  {
    id: "armchair",
    room: "gpt",
    label: "Sentar na poltrona",
    x: 52,
    y: 77,
    pose: "sitting",
  },
  {
    id: "chat",
    room: "gpt",
    label: "Conversar com Gepetinho",
    x: 62,
    y: 62,
    pose: "using",
    action: "chat",
  },
  {
    id: "experiment",
    room: "basement",
    label: "Caixa de experimentos",
    x: 21,
    y: 69,
    pose: "using",
    action: "experiment",
  },
  {
    id: "work",
    room: "cafe",
    label: "Sentar e abrir trabalho",
    x: 52,
    y: 77,
    pose: "sitting",
    action: "work",
  },
];
const crops: Partial<Record<Room, string>> = {
  pauli: "230 230 590 270",
  studio: "850 250 480 255",
  living: "220 515 590 320",
  gpt: "850 520 480 315",
};
const initial: Resident = {
  room: "living",
  x: 64,
  y: 85,
  pose: "idle",
  target: null,
  coffee: false,
};
export default function World({
  expanded,
  onSelect,
  onAction,
  products,
  images,
  onProduct,
  fireplace = false,
  onFire,
}: {
  expanded: Room | null;
  onSelect: (r: Room) => void;
  onAction: (a: string) => void;
  products: Product[];
  images: Record<string, string>;
  onProduct: (p: Product) => void;
  uid?: string;
  fireplace?: boolean;
  onFire?: () => void;
}) {
  const [pauli, setPauli] = useState<Resident>(initial),
    [gpt, setGpt] = useState<Resident>({ ...initial, room: "gpt" });
  const [weather, setWeather] = useState({
    kind: "clear",
    night: false,
    label: "Birigui · atmosfera tranquila",
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const latest = useRef(pauli);
  latest.current = pauli;
  const npcLatest = useRef(gpt);
  npcLatest.current = gpt;
  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const refresh = async () => {
      const hour = Number(
        new Intl.DateTimeFormat("en", {
          timeZone: "America/Sao_Paulo",
          hour: "numeric",
          hourCycle: "h23",
        }).format(new Date()),
      );
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-21.2886&longitude=-50.3400&current=temperature_2m,is_day,weather_code&timezone=America%2FSao_Paulo",
          { signal: controller.signal },
        );
        if (!response.ok) throw Error();
        const data = await response.json();
        if (alive)
          setWeather({
            kind: weatherKind(data.current.weather_code),
            night: !data.current.is_day,
            label: `Birigui · ${Math.round(data.current.temperature_2m)}°C · ${!data.current.is_day ? "noite" : "dia"}`,
          });
      } catch {
        if (alive)
          setWeather({
            kind: "clear",
            night: hour < 6 || hour >= 18,
            label: "Birigui · clima indisponível, horário local",
          });
      }
    };
    void refresh();
    const id = setInterval(refresh, 900000);
    return () => {
      alive = false;
      controller.abort();
      clearInterval(id);
    };
  }, []);
  // NPC route uses only common rooms; the private room is rejected at the policy layer.
  useEffect(() => {
    const stops = [
      objects.find((o) => o.id === "coffee")!,
      objects.find((o) => o.id === "table")!,
      objects.find((o) => o.id === "sofa")!,
      objects.find((o) => o.id === "reading")!,
      objects.find((o) => o.id === "computer")!,
      objects.find((o) => o.id === "work")!,
      objects.find((o) => o.id === "armchair")!,
    ];
    let index = 0;
    const npcTimers: ReturnType<typeof setTimeout>[] = [];
    const id = setInterval(() => {
      const obj = stops[index++ % stops.length];
      if (!canEnter("gpt", obj.room)) return;
      const from = npcLatest.current,
        r = rooms[from.room],
        dest = rooms[obj.room];
      const target = {
        x: dest.x + (obj.x - 50) * 0.28,
        y: dest.floor + (obj.y - 80) * 0.17,
      };
      const path = worldPath(
        "gpt",
        { x: r.x + (from.x - 50) * 0.28, y: r.floor + (from.y - 80) * 0.17 },
        target,
        obj.room,
      );
      setGpt((p) => ({ ...p, pose: "walking" }));
      path.forEach((point: { x: number; y: number }, i: number) =>
        npcTimers.push(
          setTimeout(
            () => setGpt((p) => ({ ...p, mapX: point.x, mapY: point.y })),
            i * 1600,
          ),
        ),
      );
      npcTimers.push(
        setTimeout(() => {
          setGpt((p) => ({
            ...p,
            ...approach("gpt", obj),
            pose: "walking",
            mapX: undefined,
            mapY: undefined,
          }));
          npcTimers.push(
            setTimeout(
              () =>
                setGpt((p) => ({
                  ...p,
                  ...arrive(p, obj),
                  pose:
                    obj.pose === "sitting" && p.coffee ? "drinking" : obj.pose,
                  coffee:
                    obj.id === "coffee" || (obj.id !== "armchair" && p.coffee),
                })),
              1600,
            ),
          );
        }, path.length * 1600),
      );
    }, 12000);
    return () => {
      clearInterval(id);
      npcTimers.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    timers.current.forEach(clearTimeout);
    setPauli((p) =>
      p.room === expanded
        ? p
        : {
            ...p,
            mapX: undefined,
            mapY: undefined,
            room: expanded,
            x: 64,
            y: 86,
            pose: "idle",
            target: null,
          },
    );
  }, [expanded]);
  function useObject(obj: ObjectSpec) {
    timers.current.forEach(clearTimeout);
    const next = approach("pauli", obj);
    if (!next) return;
    setPauli((p) => ({ ...p, ...next, pose: "walking" }));
    schedule(() => {
      setPauli((p) => ({ ...p, ...arrive(p, obj) }));
      if (obj.id === "fire") onFire?.();
      else if (obj.id === "coffee") {
        schedule(
          () => setPauli((p) => ({ ...p, coffee: true, pose: "idle" })),
          1800,
        );
      } else if (obj.action) onAction(obj.action);
    }, 1500);
  }
  function renderResident(p: Resident, npc = false) {
    if (expanded && p.room !== expanded) return null;
    const r = rooms[p.room];
    const mainX = r.x + (p.x - 50) * 0.28,
      mainY = r.floor + (p.y - 80) * 0.17;
    return (
      <div
        className={`resident ${npc ? "npc" : ""} pose-${p.pose} ${p.coffee ? "has-coffee" : ""}`}
        style={{
          left: (expanded ? p.x : (p.mapX ?? mainX)) + "%",
          top: (expanded ? p.y : (p.mapY ?? mainY)) + "%",
        }}
        aria-label={`${npc ? "Gepetinho" : "Pauli"} · ${p.pose} · ${r.name}`}
      >
        <Avatar
          gpt={npc}
          pose={p.pose}
          back={p.room === "studio" && p.pose === "sitting"}
        />
        {p.coffee && <span className="held-cup">☕</span>}
        <span className="resident-name">{npc ? "Gepetinho" : "Pauli"}</span>
        {p.pose === "using" && p.room === "kitchen" && p.target === null && (
          <span className="steam">〰</span>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="weather-label">
        <span>
          {weather.night ? "☾" : "☀"} {weather.label}
          {weather.kind === "rain"
            ? " · chuva"
            : weather.kind === "storm"
              ? " · tempestade"
              : weather.kind === "cloud"
                ? " · nublado"
                : ""}
        </span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
      </div>
      <div
        className={`habitat ${expanded ? "room-view room-" + expanded : "house-map"} weather-${weather.kind} ${weather.night ? "night" : ""}`}
      >
        <div
          className="habitat-floor"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = Math.max(
                8,
                Math.min(92, ((e.clientX - r.left) / r.width) * 100),
              ),
              y = Math.max(
                70,
                Math.min(90, ((e.clientY - r.top) / r.height) * 100),
              );
            if (!expanded) {
              const rawY = ((e.clientY - r.top) / r.height) * 100;
              if (rawY < 30 || rawY > 83 || x < 16 || x > 88) return;
              const dest: Room =
                rawY < 51
                  ? x < 54
                    ? "pauli"
                    : "studio"
                  : x < 54
                    ? "living"
                    : "gpt";
              const target = { x, y: rawY < 51 ? 48 : 79 },
                from = latest.current,
                old = rooms[from.room];
              const path = worldPath(
                "pauli",
                {
                  x: old.x + (from.x - 50) * 0.28,
                  y: old.floor + (from.y - 80) * 0.17,
                },
                target,
                dest,
              );
              timers.current.forEach(clearTimeout);
              setPauli((p) => ({ ...p, pose: "walking" }));
              path.forEach((point: { x: number; y: number }, i: number) =>
                schedule(
                  () =>
                    setPauli((p) => ({ ...p, mapX: point.x, mapY: point.y })),
                  i * 1600,
                ),
              );
              schedule(
                () =>
                  setPauli((p) => ({
                    ...p,
                    room: dest,
                    x: 50 + (x - rooms[dest].x) / 0.28,
                    y: 80,
                    pose: "idle",
                    mapX: undefined,
                    mapY: undefined,
                  })),
                path.length * 1600,
              );
              return;
            }
            timers.current.forEach(clearTimeout);
            setPauli((p) => ({ ...p, x, y, pose: "walking", target: null }));
            schedule(() => setPauli((p) => ({ ...p, pose: "idle" })), 1500);
          }}
        >
          {!expanded ? (
            <img
              className="map-art"
              src="/chalet.webp"
              alt="O chalé completo nas montanhas"
            />
          ) : crops[expanded] ? (
            <svg
              className="room-art"
              viewBox={crops[expanded]}
              preserveAspectRatio="none"
              aria-label={rooms[expanded].name}
              role="img"
            >
              <image href="/chalet.webp" width="1536" height="1024" />
            </svg>
          ) : (
            <RoomArt room={expanded} />
          )}
          {expanded === "gpt" && (
            <svg
              className="gpt-details"
              viewBox="0 0 900 600"
              aria-hidden="true"
            >
              <g opacity=".94">
                <path
                  d="M20 38H265V190H20Z"
                  fill="#153346"
                  stroke="#b18851"
                  strokeWidth="5"
                />
                <text
                  x="142"
                  y="68"
                  textAnchor="middle"
                  fill="#d8ba7e"
                  fontFamily="serif"
                  fontSize="17"
                >
                  atlas das ideias improváveis
                </text>
                <path
                  d="m48 141 35-37 47 47 60-56 45 64M83 104l47 47 8-54"
                  stroke="#b79659"
                  fill="none"
                />
                {[
                  [48, 141],
                  [83, 104],
                  [130, 151],
                  [190, 95],
                  [235, 159],
                  [138, 97],
                ].map(([x, y]) => (
                  <circle key={x} cx={x} cy={y} r="4" fill="#ffe3a3" />
                ))}
                <path
                  d="M740 420v70m-38 0h76"
                  stroke="#a8824c"
                  strokeWidth="5"
                />
                <ellipse
                  cx="740"
                  cy="414"
                  rx="38"
                  ry="13"
                  fill="none"
                  stroke="#d9b477"
                  strokeWidth="3"
                  transform="rotate(-25 740 414)"
                />
                <ellipse
                  cx="740"
                  cy="414"
                  rx="15"
                  ry="36"
                  fill="none"
                  stroke="#d9b477"
                  strokeWidth="3"
                />
                <circle cx="740" cy="414" r="13" fill="#efd79a" />
                <path
                  d="M288 60h110v110H288Z"
                  fill="#e9d7b0"
                  transform="rotate(7 343 115)"
                />
                <text
                  x="301"
                  y="100"
                  fill="#594833"
                  fontSize="14"
                  fontFamily="serif"
                >
                  e se amanhã
                </text>
                <text
                  x="305"
                  y="122"
                  fill="#594833"
                  fontSize="14"
                  fontFamily="serif"
                >
                  tivesse outra
                </text>
                <text
                  x="312"
                  y="145"
                  fill="#594833"
                  fontSize="14"
                  fontFamily="serif"
                >
                  gravidade?
                </text>
              </g>
            </svg>
          )}
          {!expanded && (
            <div className="annex-art" aria-hidden="true">
              <span>⌂ cozinha</span>
              <span>▥ biblioteca</span>
              <span>◈ porão</span>
            </div>
          )}
          <div className="atmosphere" aria-hidden="true" />
          {(!expanded || expanded === "living") && (
            <div
              className={`hearth ${fireplace ? "lit" : ""}`}
              style={
                expanded
                  ? { left: "12.5%", top: "31%", width: "13%", height: "24%" }
                  : {
                      left: "19.15%",
                      top: "59.8%",
                      width: "4.3%",
                      height: "6.2%",
                    }
              }
            >
              <span>{fireplace ? "♨" : ""}</span>
            </div>
          )}
          {!expanded &&
            Object.entries(rooms).map(([id, r]) => (
              <button
                key={id}
                className={`map-sign sign-${id}`}
                style={{ left: r.x + "%", top: r.y + "%" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(id as Room);
                }}
              >
                {id === "cafe" ? "IR PARA CAFÉ WORK →" : r.name}
              </button>
            ))}
          {expanded &&
            objects
              .filter((o) => o.room === expanded)
              .map((obj) => (
                <button
                  key={obj.id}
                  aria-label={
                    obj.id === "fire"
                      ? fireplace
                        ? "Apagar lareira"
                        : "Acender lareira"
                      : obj.label
                  }
                  className={"furniture furniture-" + obj.id}
                  style={{ left: obj.x + "%", top: obj.y - 27 + "%" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    useObject(obj);
                  }}
                >
                  {obj.id === "fire"
                    ? fireplace
                      ? "Apagar lareira"
                      : "Acender lareira"
                    : obj.label}
                </button>
              ))}
          {(expanded === "studio" || !expanded) &&
            products.slice(0, 6).map((p, i) => (
              <button
                key={p.id}
                className="physical-sample"
                style={{
                  left: (expanded ? 66 + (i % 3) * 9 : 76 + (i % 3) * 3) + "%",
                  top:
                    (expanded
                      ? 39 + Math.floor(i / 3) * 13
                      : 37 + Math.floor(i / 3) * 4) + "%",
                }}
                aria-label={`Abrir amostra ${p.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onProduct(p);
                }}
              >
                {images[p.id] ? (
                  <img src={images[p.id]} alt="" />
                ) : (
                  p.name.slice(0, 1)
                )}
              </button>
            ))}
          {renderResident(pauli)}
          {renderResident(gpt, true)}
        </div>
        <div className="habitat-caption">
          {expanded
            ? rooms[expanded].subtitle
            : "Toque numa placa para escolher um ambiente. A casa continua sendo seu mapa."}
        </div>
      </div>
      {expanded && (
        <div className="interaction-bar" aria-live="polite">
          <span>
            {pauli.pose === "walking"
              ? "Pauli está se aproximando…"
              : pauli.pose === "lying"
                ? "Um descanso merecido."
                : pauli.pose === "sitting"
                  ? "Pauli está sentada."
                  : pauli.pose === "drinking"
                    ? "Um gole de calma."
                    : pauli.coffee
                      ? "Café pronto. Pode passear com a xícara."
                      : "Toque no chão para caminhar ou escolha um objeto."}
          </span>
          {["sitting", "lying", "using", "drinking"].includes(pauli.pose) && (
            <button
              className="secondary"
              onClick={() => {
                timers.current.forEach(clearTimeout);
                setPauli((p) => ({ ...p, ...leave(p) }));
              }}
            >
              Levantar / sair da interação
            </button>
          )}
          {pauli.coffee && (
            <>
              <button
                className="secondary"
                onClick={() => setPauli((p) => ({ ...p, pose: "drinking" }))}
              >
                Tomar café
              </button>
              <button
                className="secondary"
                onClick={() =>
                  setPauli((p) => ({ ...p, coffee: false, pose: "idle" }))
                }
              >
                Guardar xícara
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import type { Product } from "./supabase";
import Avatar from "./Avatar";

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
    x: 35,
    y: 22,
    floor: 36,
  },
  studio: {
    name: "Escritório + estúdio",
    subtitle: "TikTok, criação e pequenas conquistas.",
    x: 71,
    y: 23,
    floor: 36,
  },
  living: {
    name: "Sala de estar",
    subtitle: "Pausa também faz parte do caminho.",
    x: 34,
    y: 41,
    floor: 61,
  },
  gpt: {
    name: "Quarto do Gepetinho",
    subtitle: "Uma oficina para ideias ainda sem nome.",
    x: 72,
    y: 41,
    floor: 61,
  },
  kitchen: {
    name: "Cozinha",
    subtitle: "O café está quase pronto.",
    x: 23,
    y: 66,
    floor: 87,
  },
  library: {
    name: "Biblioteca",
    subtitle: "Tudo que vale a pena guardar.",
    x: 49,
    y: 66,
    floor: 87,
  },
  basement: {
    name: "Porão",
    subtitle: "Algumas ideias precisam de pouca luz.",
    x: 79,
    y: 66,
    floor: 87,
  },
  cafe: {
    name: "Café Work",
    subtitle: "Um lugar para o trabalho, outro ritmo para o dia.",
    x: 8,
    y: 88,
    floor: 94,
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
  activity?: string;
  hidden?: boolean;
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
    id: "fridge",
    room: "kitchen",
    label: "Geladeira · alimentação",
    x: 88,
    y: 70,
    pose: "using",
    action: "fridge",
  },
  {
    id: "bed",
    room: "pauli",
    label: "Deitar na cama",
    x: 39,
    y: 73,
    pose: "lying",
  },
  {
    id: "routine",
    room: "pauli",
    label: "Rotina pessoal",
    x: 57,
    y: 72,
    pose: "using",
    action: "routine",
  },
  {
    id: "yoga",
    room: "pauli",
    label: "Tapete de yoga",
    x: 78,
    y: 89,
    pose: "sitting",
    action: "yoga",
  },
  {
    id: "journal",
    room: "pauli",
    label: "Meu diário",
    x: 15,
    y: 72,
    pose: "sitting",
    action: "journal",
  },
  {
    id: "remember",
    room: "pauli",
    label: "Daily Remembers",
    x: 59,
    y: 43,
    pose: "using",
    action: "remember",
  },
  {
    id: "sofa",
    room: "living",
    label: "Sentar no sofá",
    x: 60,
    y: 70,
    pose: "sitting",
  },
  { id: "fire", room: "living", label: "Lareira", x: 23, y: 63, pose: "using" },
  {
    id: "computer",
    room: "studio",
    label: "Abrir computador · TikTok",
    x: 35,
    y: 76,
    pose: "sitting",
    action: "computer",
  },
  {
    id: "shelf",
    room: "studio",
    label: "Estante de amostras",
    x: 76,
    y: 68,
    pose: "using",
    action: "shelf",
  },
  {
    id: "coffee",
    room: "kitchen",
    label: "Preparar café",
    x: 21,
    y: 59,
    pose: "using",
  },
  {
    id: "table",
    room: "kitchen",
    label: "Sentar à mesa",
    x: 68,
    y: 80,
    pose: "sitting",
  },
  {
    id: "newspaper",
    room: "kitchen",
    label: "Jornal do dia",
    x: 60,
    y: 66,
    pose: "sitting",
    action: "news",
  },
  {
    id: "radio",
    room: "kitchen",
    label: "Rádio",
    x: 35,
    y: 52,
    pose: "using",
    action: "radio",
  },
  {
    id: "archive",
    room: "library",
    label: "Livros e memórias",
    x: 43,
    y: 47,
    pose: "using",
    action: "archive",
  },
  {
    id: "reading",
    room: "library",
    label: "Sentar para ler",
    x: 34,
    y: 75,
    pose: "sitting",
  },
  {
    id: "ideas",
    room: "gpt",
    label: "Coisas que o Gepetinho está pensando",
    x: 25,
    y: 53,
    pose: "using",
    action: "idea",
  },
  {
    id: "armchair",
    room: "gpt",
    label: "Sentar na poltrona",
    x: 28,
    y: 76,
    pose: "sitting",
  },
  {
    id: "chat",
    room: "gpt",
    label: "Conversar com Gepetinho",
    x: 60,
    y: 64,
    pose: "using",
    action: "chat",
  },
  {
    id: "experiment",
    room: "basement",
    label: "Caixa de experimentos",
    x: 51,
    y: 70,
    pose: "using",
    action: "experiment",
  },
  {
    id: "work",
    room: "cafe",
    label: "Sentar e abrir trabalho",
    x: 33,
    y: 86,
    pose: "sitting",
    action: "work",
  },
];
const crops: Record<Room, string> = {
  pauli: "198 145 490 200",
  studio: "700 176 390 170",
  living: "190 363 440 216",
  gpt: "704 362 390 217",
  kitchen: "76 603 392 235",
  library: "477 602 282 238",
  basement: "775 602 423 238",
  cafe: "290 955 820 299",
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
  const [claudinho, setClaudinho] = useState<Resident>({
    ...initial,
    room: "library",
    x: 60,
  });
  const [moss, setMoss] = useState<Resident>({
    ...initial,
    room: "kitchen",
    x: 82,
    y: 76,
    activity: "fridge",
  });
  const [digo, setDigo] = useState<Resident>({ ...initial, x: 76 });
  const [digoMessage, setDigoMessage] = useState("");
  const mossLatest = useRef(moss);
  mossLatest.current = moss;
  const digoLatest = useRef(digo);
  digoLatest.current = digo;
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
  const claudinhoLatest = useRef(claudinho);
  claudinhoLatest.current = claudinho;
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
    const residents = [
      {
        actor: "gpt",
        latest: npcLatest,
        set: setGpt,
        interacts: true,
        interval: 12000,
      },
      {
        actor: "claudinho",
        latest: claudinhoLatest,
        set: setClaudinho,
        interacts: false,
        interval: 15000,
      },
    ];
    residents.push(
      {
        actor: "moss",
        latest: mossLatest,
        set: setMoss,
        interacts: false,
        interval: 17000,
      },
      {
        actor: "digo",
        latest: digoLatest,
        set: setDigo,
        interacts: false,
        interval: 13000,
      },
    );
    const cleanups = residents.map((resident) => {
      let index = 0;
      const npcTimers: ReturnType<typeof setTimeout>[] = [];
      const id = setInterval(() => {
        npcTimers.splice(0).forEach(clearTimeout);
        const stop =
          stops[
            resident.interacts
              ? index++ % stops.length
              : Math.floor(Math.random() * stops.length)
          ];
        let obj = resident.interacts
          ? stop
          : { ...stop, id: "walk", x: 60, y: 85, pose: "idle" as Pose };
        if (resident.actor === "moss") {
          const spots = [
            { id: "fridge", x: 82, y: 76 },
            { id: "counter", x: 35, y: 69 },
            { id: "spoon", x: 58, y: 84 },
          ];
          obj = {
            ...obj,
            ...spots[Math.floor(Math.random() * spots.length)],
            room: "kitchen",
            pose: "idle",
          };
        }
        if (resident.actor === "digo") {
          setDigoMessage("");
          const roll = Math.random();
          if (!resident.latest.current.hidden && roll < 0.12) {
            resident.set((p) => ({
              ...p,
              pose: "walking",
              x: 94,
              y: 90,
              mapX: 96,
              mapY: 96,
            }));
            npcTimers.push(
              setTimeout(
                () =>
                  resident.set((p) => ({
                    ...p,
                    hidden: true,
                    pose: "idle",
                    mapX: undefined,
                    mapY: undefined,
                  })),
                1800,
              ),
            );
            return;
          }
          const follow = roll < 0.7;
          const owner = latest.current;
          obj = {
            ...obj,
            id: follow ? "cuddle" : "walk",
            room: follow ? owner.room : obj.room,
            x: follow ? Math.max(10, Math.min(90, owner.x + 10)) : 60,
            y: follow ? Math.max(72, Math.min(90, owner.y)) : 85,
            pose: "idle",
          };
        }
        if (
          !canEnter(
            resident.actor,
            obj.room,
            resident.actor === "digo" ? "cat" : "resident",
          )
        )
          return;
        const from = resident.latest.current,
          r = rooms[from.room],
          dest = rooms[obj.room];
        const target = {
          x: dest.x + (obj.x - 50) * 0.28,
          y: dest.floor + (obj.y - 80) * 0.17,
        };
        const path =
          (resident.actor === "moss" || resident.actor === "digo") &&
          from.room === obj.room
            ? [target]
            : worldPath(
                resident.actor,
                {
                  x: r.x + (from.x - 50) * 0.28,
                  y: r.floor + (from.y - 80) * 0.17,
                },
                target,
                obj.room,
              );
        resident.set((p) => ({
          ...p,
          hidden: false,
          activity: obj.id,
          pose: "walking",
        }));
        path.forEach((point: { x: number; y: number }, i: number) =>
          npcTimers.push(
            setTimeout(
              () =>
                resident.set((p) => ({ ...p, mapX: point.x, mapY: point.y })),
              i * 1600,
            ),
          ),
        );
        npcTimers.push(
          setTimeout(() => {
            resident.set((p) => ({
              ...p,
              ...approach(resident.actor, obj),
              pose: "walking",
              mapX: undefined,
              mapY: undefined,
            }));
            npcTimers.push(
              setTimeout(
                () =>
                  resident.set((p) => ({
                    ...p,
                    ...arrive(p, obj),
                    pose:
                      resident.interacts && obj.pose === "sitting" && p.coffee
                        ? "drinking"
                        : obj.pose,
                    coffee:
                      resident.interacts &&
                      (obj.id === "coffee" ||
                        (obj.id !== "armchair" && p.coffee)),
                  })),
                1600,
              ),
            );
          }, path.length * 1600),
        );
      }, resident.interval);
      return () => {
        clearInterval(id);
        npcTimers.forEach(clearTimeout);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
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
  function renderResident(
    p: Resident,
    npc = false,
    name = npc ? "Gepetinho" : "Pauli",
  ) {
    if (p.hidden) return null;
    if (expanded && p.room !== expanded) return null;
    if (!expanded && p.room === "cafe") return null;
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
        aria-label={`${name} · ${p.pose} · ${r.name}`}
      >
        <Avatar
          moss={name === "Moss"}
          digo={name === "Digo"}
          spoon={p.activity === "spoon"}
          gpt={npc}
          claudinho={name === "Claudinho"}
          pose={p.pose}
          back={p.room === "studio" && p.pose === "sitting"}
        />
        {name === "Digo" && p.pose === "idle" && p.room === pauli.room && (
          <button
            className="digo-pet"
            aria-label="Fazer carinho no Digo"
            onClick={(e) => {
              e.stopPropagation();
              setDigoMessage("♡");
              if (Math.random() < 0.4) {
                setDigoMessage("Miau ♡");
                const audio = new AudioContext();
                const voice = audio.createOscillator(),
                  volume = audio.createGain();
                voice.connect(volume);
                volume.connect(audio.destination);
                voice.frequency.setValueAtTime(660, audio.currentTime);
                voice.frequency.exponentialRampToValueAtTime(
                  420,
                  audio.currentTime + 0.28,
                );
                volume.gain.setValueAtTime(0.0001, audio.currentTime);
                volume.gain.exponentialRampToValueAtTime(
                  0.025,
                  audio.currentTime + 0.07,
                );
                volume.gain.exponentialRampToValueAtTime(
                  0.0001,
                  audio.currentTime + 0.38,
                );
                voice.start();
                voice.stop(audio.currentTime + 0.4);
                voice.onended = () => void audio.close();
              }
            }}
          >
            {digoMessage || "Carinho? ♡"}
          </button>
        )}
        {p.coffee && <span className="held-cup">☕</span>}
        <span className="resident-name">{name}</span>
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
              if (rawY < 23 || rawY > 89 || x < 10 || x > 93) return;
              const dest: Room =
                rawY < 37
                  ? x < 55
                    ? "pauli"
                    : "studio"
                  : rawY < 62
                    ? x < 55
                      ? "living"
                      : "gpt"
                    : x < 38
                      ? "kitchen"
                      : x < 61
                        ? "library"
                        : "basement";
              const target = { x, y: rooms[dest].floor },
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
          <svg
            className="room-art"
            viewBox={expanded ? crops[expanded] : "0 0 1254 946"}
            preserveAspectRatio="none"
            aria-label={
              expanded
                ? rooms[expanded].name
                : "O chalé completo com sete cômodos"
            }
            role="img"
          >
            <image href="/chalet-expanded.webp" width="1254" height="1254" />
          </svg>
          <div className="atmosphere" aria-hidden="true" />
          {(!expanded || expanded === "living") && (
            <div
              className={`hearth ${fireplace ? "lit" : ""}`}
              style={
                expanded
                  ? { left: "15.5%", top: "33%", width: "13%", height: "23%" }
                  : {
                      left: "20.6%",
                      top: "46.2%",
                      width: "4.5%",
                      height: "5.3%",
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
          {renderResident(claudinho, true, "Claudinho")}
          {renderResident(moss, true, "Moss")}
          {renderResident(digo, true, "Digo")}
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

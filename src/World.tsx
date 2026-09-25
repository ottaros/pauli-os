import { useEffect, useRef, useState } from "react";
import { route } from "./domain.mjs";
import type { Product } from "./supabase";
export type Room = "pauli" | "studio" | "living" | "gpt";
export const rooms: Record<
  Room,
  { name: string; subtitle: string; x: number; y: number; floor: number }
> = {
  pauli: {
    name: "Quarto da Pauli",
    subtitle: "Um pequeno cuidado, todos os dias.",
    x: 30,
    y: 29,
    floor: 48,
  },
  studio: {
    name: "Escritório + estúdio",
    subtitle: "Suas ideias ganham vida aqui.",
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
    subtitle: "Há sempre uma ideia acesa por aqui.",
    x: 70,
    y: 61,
    floor: 79,
  },
};
type Point = { x: number; y: number };
function Avatar({ gpt = false }: { gpt?: boolean }) {
  return (
    <svg viewBox="0 0 60 85" className="avatar-art" aria-hidden="true">
      <ellipse cx="30" cy="79" rx="18" ry="4" fill="#201e25" opacity=".3" />
      <path
        d="M20 62v14m20-14v14"
        stroke="#332627"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M16 54q14-16 28 0l2 16H14z"
        fill={gpt ? "#284d50" : "#edd7bd"}
        stroke="#523d36"
        strokeWidth="2"
      />
      <path
        d="M11 46V29Q9 4 30 5q25 0 21 31v23L40 56 18 58z"
        fill={gpt ? "#2a292d" : "#49312c"}
      />
      <ellipse cx="30" cy="33" rx="17" ry="20" fill="#f1cba7" />
      <path
        d="M13 30Q10 6 30 8q23-2 19 24L36 18l-5 9-8-6z"
        fill={gpt ? "#2a292d" : "#49312c"}
      />
      <ellipse cx="23" cy="35" rx="2" ry="3" fill="#2e282b" />
      <ellipse cx="38" cy="35" rx="2" ry="3" fill="#2e282b" />
      <path d="M27 44q4 3 8-1" fill="none" stroke="#ad655b" strokeWidth="2" />
      <circle cx="18" cy="41" r="3" fill="#e8a297" opacity=".7" />
      <circle cx="43" cy="41" r="3" fill="#e8a297" opacity=".7" />
      {gpt ? (
        <path d="m30 56 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#edc479" />
      ) : (
        <path d="M13 22q-8-8-7 1 0 8 9 2" fill="#c8878c" />
      )}
    </svg>
  );
}
export default function World({
  expanded,
  onSelect,
  onAction,
  products,
  onProduct,
  images,
}: {
  expanded: Room | null;
  onSelect: (r: Room) => void;
  onAction: (a: string) => void;
  products: Product[];
  images: Record<string, string>;
  onProduct: (p: Product) => void;
}) {
  const [pauli, setPauli] = useState<Point>({ x: 32, y: 79 });
  const [gpt, setGpt] = useState<Point>({ x: 73, y: 79 });
  const [walking, setWalking] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    let i = 0;
    const stops = [
      { x: 70, y: 79 },
      { x: 50, y: 79 },
      { x: 29, y: 79 },
      { x: 50, y: 79 },
      { x: 50, y: 48 },
      { x: 70, y: 48 },
      { x: 50, y: 48 },
      { x: 50, y: 79 },
    ];
    const id = setInterval(() => setGpt(stops[i++ % stops.length]), 6500);
    return () => clearInterval(id);
  }, []);
  function move(p: Point) {
    timers.current.forEach(clearTimeout);
    setWalking(true);
    const path = route(pauli, p);
    path.forEach((point: Point, i: number) =>
      timers.current.push(setTimeout(() => setPauli(point), i * 1000)),
    );
    timers.current.push(
      setTimeout(() => setWalking(false), path.length * 1000),
    );
  }
  const zone = expanded ? rooms[expanded] : null;
  return (
    <div className={`world-viewport ${expanded ? "expanded " + expanded : ""}`}>
      <div
        className="scene"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          if (x > 15 && x < 87 && y > 30 && y < 87) {
            move({ x: Math.max(20, Math.min(80, x)), y: y < 52 ? 48 : 79 });
            if (!expanded)
              onSelect(
                y < 52
                  ? x < 54
                    ? "pauli"
                    : "studio"
                  : x < 54
                    ? "living"
                    : "gpt",
              );
          }
        }}
      >
        <img
          className="chalet"
          src="/chalet.webp"
          alt="Chalé nas montanhas: quarto e estúdio no andar de cima, sala e biblioteca no andar de baixo"
          draggable="false"
        />
        <div className="glow glow-one" />
        <div className="glow glow-two" />
        <div className="fireflies" aria-hidden="true">
          ✦<i>✧</i>
          <b>·</b>
        </div>
        {Object.entries(rooms).map(([id, r]) => (
          <button
            key={id}
            className={"room-sign " + (expanded === id ? "active" : "")}
            style={{ left: r.x + "%", top: r.y + "%" }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id as Room);
            }}
          >
            {r.name}
            <span>⌁</span>
          </button>
        ))}
        <div
          className={"avatar pauli " + (walking ? "walking" : "")}
          style={{ left: pauli.x + "%", top: pauli.y + "%" }}
        >
          <Avatar />
          <span>Pauli</span>
        </div>
        <div
          className="avatar gepetinho"
          style={{ left: gpt.x + "%", top: gpt.y + "%" }}
        >
          <Avatar gpt />
          <span>Gepetinho</span>
        </div>
        {expanded === "pauli" && (
          <>
            <button
              className="object-pin"
              style={{ left: "24%", top: "42%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("routine");
              }}
            >
              ♡ Rotina matinal
            </button>
            <button
              className="object-pin"
              style={{ left: "39%", top: "49%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("routine");
              }}
            >
              ✧ Tapete de yoga
            </button>
            <button
              className="object-pin"
              style={{ left: "43%", top: "38%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("journal");
              }}
            >
              ✎ Diário
            </button>
          </>
        )}
        {expanded === "studio" && (
          <>
            <button
              className="object-pin"
              style={{ left: "65%", top: "43%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("shelf");
              }}
            >
              ▥ Minhas amostras
            </button>
            <button
              className="object-pin"
              style={{ left: "79%", top: "49%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("new");
              }}
            >
              ＋ Nova amostra
            </button>
          </>
        )}
        {expanded === "living" && (
          <button
            className="object-pin"
            style={{ left: "33%", top: "74%" }}
            onClick={(e) => {
              e.stopPropagation();
              onAction("rest");
            }}
          >
            ☕ Sentar um pouco
          </button>
        )}
        {expanded === "gpt" && (
          <>
            <button
              className="object-pin"
              style={{ left: "66%", top: "71%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("gpt");
              }}
            >
              ✦ Oficina de ideias
            </button>
            <button
              className="object-pin"
              style={{ left: "78%", top: "66%" }}
              onClick={(e) => {
                e.stopPropagation();
                onAction("stars");
              }}
            >
              ☾ Observatório
            </button>
          </>
        )}
        {products.slice(0, 6).map((p, i) => (
          <button
            key={p.id}
            className="shelf-sample"
            aria-label={`Abrir amostra ${p.name}`}
            style={{
              left: 76 + (i % 3) * 3 + "%",
              top: 37 + Math.floor(i / 3) * 4 + "%",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onProduct(p);
            }}
          >
            {images[p.id] ? (
              <img src={images[p.id]} alt="" />
            ) : (
              <span>{p.name.slice(0, 1)}</span>
            )}
          </button>
        ))}
      </div>
      <div className="scene-caption">
        {zone
          ? zone.subtitle
          : "Toque em um cômodo para explorar · Toque no chão para caminhar"}
      </div>
    </div>
  );
}

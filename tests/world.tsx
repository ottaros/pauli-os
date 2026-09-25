// Local-only visual fixture: not an entry point of the production build.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import World, { rooms, type Room } from "../src/World";
import "../src/styles.css";
function Fixture() {
  const [room, setRoom] = useState<Room | null>(null);
  const [selected, setSelected] = useState<Room | null>(null);
  const [action, setAction] = useState("");
  return (
    <main className="home">
      <header className="home-header">
        <div className="brand">⌂ Pauli OS</div>
        <small>Teste visual local</small>
      </header>
      <div className="world-top">
        <h1>{room ? rooms[room].name : "Bem-vinda ao seu pequeno mundo."}</h1>
        {room && (
          <button onClick={() => setRoom(null)} className="secondary">
            ← Voltar à casa
          </button>
        )}
      </div>
      <World
        expanded={room}
        onSelect={setSelected}
        onAction={setAction}
        products={[]}
        images={{}}
        onProduct={() => {}}
      />
      {selected && (
        <section className="room-choice">
          <strong>{rooms[selected].name}</strong>
          <button
            className="primary"
            onClick={() => {
              setRoom(selected);
              setSelected(null);
            }}
          >
            Expandir / entrar no cômodo ↗
          </button>
        </section>
      )}
      <p role="status">{action}</p>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);

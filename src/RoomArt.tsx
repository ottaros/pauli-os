// Vector scenery keeps the new wings light and lets furniture remain actual objects.
export default function RoomArt({ room }: { room: string }) {
  const dark = room === "basement" || room === "gpt",
    books = room === "library" || room === "gpt";
  return (
    <svg
      className="room-art"
      viewBox="0 0 900 600"
      preserveAspectRatio="none"
      aria-label={`Interior de ${room}`}
      role="img"
    >
      <defs>
        <linearGradient id="wall" x2="0" y2="1">
          <stop stopColor={dark ? "#142d40" : "#8c7650"} />
          <stop offset="1" stopColor={dark ? "#273d40" : "#c1a47c"} />
        </linearGradient>
        <linearGradient id="wood" x2="0" y2="1">
          <stop stopColor="#95633f" />
          <stop offset="1" stopColor="#392b27" />
        </linearGradient>
        <radialGradient id="lamp">
          <stop stopColor="#ffcf75" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffd677" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="900" height="600" fill="url(#wall)" />
      <path d="M0 390H900V600H0Z" fill="url(#wood)" />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M0 ${400 + i * 25}H900 M${i * 110} 390L${i * 135 - 100} 600`}
          stroke="#34251f"
          opacity=".35"
        />
      ))}
      <path
        d="M25 0V405M875 0V405M0 20H900M0 380H900"
        stroke="#513a2b"
        strokeWidth="26"
      />
      <rect
        x="340"
        y="65"
        width="230"
        height="240"
        rx="95"
        fill="#203b54"
        stroke="#533e2e"
        strokeWidth="16"
      />
      <path
        d="M345 260 402 155 480 240 531 167 566 250V300H345"
        fill="#668793"
      />
      <path d="M345 300 417 221 462 276 520 210 566 300" fill="#284f50" />
      <circle cx="501" cy="111" r="22" fill="#eee0ad" />
      <path d="M455 68V300M342 202H568" stroke="#644a32" strokeWidth="8" />
      <ellipse
        cx="465"
        cy="490"
        rx="250"
        ry="70"
        fill={dark ? "#263747" : "#aa7d71"}
        stroke="#d3b28d"
        strokeWidth="6"
      />
      <ellipse
        cx="465"
        cy="490"
        rx="229"
        ry="57"
        fill="none"
        stroke="#bd976c"
        strokeDasharray="6 8"
        strokeWidth="3"
      />
      {[90, 780].map((x) => (
        <g key={x}>
          <circle cx={x} cy="190" r="140" fill="url(#lamp)" />
          <path d={`M${x} 0V145`} stroke="#302924" strokeWidth="4" />
          <path d={`M${x - 32} 170Q${x} 110 ${x + 32} 170Z`} fill="#d0a263" />
          <ellipse cx={x} cy="172" rx="30" ry="7" fill="#ffdb88" />
        </g>
      ))}
      {books ? (
        <>
          {[70, 640].map((x, k) => (
            <g key={x}>
              <rect
                x={x}
                y="90"
                width="185"
                height="310"
                fill="#352a24"
                stroke="#795334"
                strokeWidth="12"
              />
              {Array.from({ length: 4 }, (_, row) => (
                <g key={row}>
                  <path
                    d={`M${x} ${160 + row * 72}h185`}
                    stroke="#a5764d"
                    strokeWidth="9"
                  />
                  {Array.from({ length: 9 }, (_, i) => (
                    <rect
                      key={i}
                      x={x + 10 + i * 19}
                      y={110 + row * 72 + (i % 3) * 5}
                      width="14"
                      height={45 - (i % 3) * 5}
                      rx="2"
                      fill={
                        ["#687c64", "#a1705c", "#365669", "#c0a26d"][
                          (i + k + row) % 4
                        ]
                      }
                    />
                  ))}
                </g>
              ))}
            </g>
          ))}
          <path
            d="M665 110V400M755 110V400M650 155H770M650 220H770M650 285H770M650 350H770"
            stroke="#b28759"
            strokeWidth="8"
          />
        </>
      ) : room === "kitchen" ? (
        <>
          <rect
            x="65"
            y="280"
            width="245"
            height="130"
            rx="5"
            fill="#36534a"
            stroke="#b9a480"
            strokeWidth="6"
          />
          <path d="M55 280H322" stroke="#dec8a0" strokeWidth="16" />
          <path d="M185 288V403" stroke="#839477" strokeWidth="3" />
          <circle cx="167" cy="310" r="5" fill="#cfa065" />
          <circle cx="202" cy="310" r="5" fill="#cfa065" />
          <rect
            x="94"
            y="209"
            width="80"
            height="67"
            rx="9"
            fill="#463c34"
            stroke="#bd905f"
            strokeWidth="5"
          />
          <path d="M112 227H152V244H112" fill="#9eafa3" />
          <path d="M110 259h40" stroke="#e4d5b1" strokeWidth="12" />
          <rect x="220" y="227" width="72" height="43" rx="7" fill="#966a46" />
          <circle cx="243" cy="249" r="14" fill="#3c3c34" />
          <path d="M261 242h22m-22 7h22" stroke="#dbbd8d" strokeWidth="3" />
          <path
            d="M655 180h145M655 250h145"
            stroke="#62452c"
            strokeWidth="12"
          />
          {[680, 725, 770].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="133"
                width="23"
                height="40"
                rx="6"
                fill="#ad8c58"
              />
              <path d={`M${x} 134h23`} stroke="#52432d" strokeWidth="6" />
            </g>
          ))}
        </>
      ) : room === "basement" ? (
        <>
          <path
            d="M100 300h160v120H100Z"
            fill="#61452f"
            stroke="#b0844f"
            strokeWidth="5"
          />
          <path d="M180 300v120M100 350h160" stroke="#372e24" strokeWidth="6" />
          <circle
            cx="695"
            cy="266"
            r="65"
            fill="#396363"
            stroke="#b48750"
            strokeWidth="6"
          />
          <path d="m670 280 26-54 28 54Z" fill="#aadba6" opacity=".7" />
          <text
            x="695"
            y="360"
            textAnchor="middle"
            fill="#dbc49b"
            fontSize="18"
          >
            coisas quase possíveis
          </text>
        </>
      ) : (
        <>
          <path
            d="M70 110h165v230H70Z"
            fill="#273f3d"
            stroke="#ae8256"
            strokeWidth="9"
          />
          <text
            x="152"
            y="165"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="28"
            fill="#e9d6b3"
          >
            Café Work
          </text>
          <text
            x="152"
            y="210"
            textAnchor="middle"
            fontSize="17"
            fill="#c4b78f"
          >
            um café, um foco
          </text>
          <path d="M665 200h125v140H665Z" fill="#965f42" />
          <path d="M650 200h155" stroke="#d0a779" strokeWidth="10" />
        </>
      )}
      <path d="M330 395v125M595 395v125" stroke="#412f24" strokeWidth="15" />
      <ellipse
        cx="462"
        cy="400"
        rx="158"
        ry="38"
        fill="#946a45"
        stroke="#c09b69"
        strokeWidth="7"
      />
      {room === "cafe" ? (
        <g>
          <path
            d="M415 317h97l10 72H407Z"
            fill="#263e40"
            stroke="#b4bca6"
            strokeWidth="5"
          />
          <path d="M407 389h120" stroke="#b4bca6" strokeWidth="9" />
          <circle cx="463" cy="351" r="9" fill="#e8c589" />
        </g>
      ) : (
        <path
          d="M420 374h81v36H420Z"
          fill="#ead8ad"
          stroke="#b7a17e"
          strokeWidth="2"
        />
      )}
      <path
        d="M394 443Q463 415 529 443v68H394Z"
        fill="#4c6b57"
        stroke="#b39b69"
        strokeWidth="7"
      />
      <path d="M410 512v42m101-42v42" stroke="#513827" strokeWidth="10" />
      {[42, 820].map((x) => (
        <g key={x}>
          <path d={`M${x} 365h46l-6 55h-34Z`} fill="#a77451" />
          <path
            d={`M${x + 23} 370v-108m0 50q-70-40-35-55 42 4 35 55m0 22q70-42 39-62-40 6-39 62`}
            fill="#496a45"
            stroke="#536c42"
            strokeWidth="5"
          />
        </g>
      ))}
      {room === "gpt" && (
        <g>
          <ellipse cx="730" cy="465" rx="45" ry="25" fill="#304b49" />
          <path d="m700 448 10-33 20 25 20-25 10 33" fill="#637c67" />
          <circle cx="722" cy="454" r="5" fill="#efd480" />
          <circle cx="741" cy="454" r="5" fill="#efd480" />
          <text x="750" y="532" fill="#dbc18e" fontSize="15">
            o guardião das ideias
          </text>
        </g>
      )}
    </svg>
  );
}

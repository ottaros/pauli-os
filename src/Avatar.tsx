export default function Avatar({
  moss = false,
  digo = false,
  spoon = false,
  gpt = false,
  claudinho = false,
  pose = "idle",
  back = false,
}: {
  moss?: boolean;
  digo?: boolean;
  spoon?: boolean;
  gpt?: boolean;
  claudinho?: boolean;
  pose?: string;
  back?: boolean;
}) {
  if (moss)
    return (
      <svg viewBox="0 0 60 85" className="avatar-art" aria-hidden="true">
        <ellipse cx="30" cy="78" rx="19" ry="4" fill="#24332c" opacity=".25" />
        <path
          d="M14 66Q3 47 16 30L12 17 27 26Q48 19 49 45L47 69Q38 79 31 71 21 81 14 66"
          fill="#849777"
          stroke="#455b48"
          strokeWidth="2"
        />
        <path d="M22 27q-3-14 11-16-1 10-11 16" fill="#b5bd88" />
        <ellipse cx="22" cy="43" rx="6" ry="7" fill="#f3e9c9" />
        <ellipse cx="39" cy="41" rx="5" ry="6" fill="#f3e9c9" />
        <circle cx="24" cy="44" r="2" fill="#28372c" />
        <circle cx="40" cy="42" r="2" fill="#28372c" />
        <path d="M27 54q5 4 8-1" fill="none" stroke="#455b48" strokeWidth="2" />
        {spoon && (
          <g stroke="#c6a77c" strokeWidth="3">
            <path d="M47 69V44" />
            <ellipse cx="47" cy="39" rx="5" ry="7" fill="#e4ceb0" />
          </g>
        )}
      </svg>
    );
  if (digo)
    return (
      <svg viewBox="0 0 60 85" className="avatar-art" aria-hidden="true">
        <ellipse cx="30" cy="78" rx="20" ry="4" fill="#d7ebf2" opacity=".2" />
        <g opacity=".83" stroke="#e9e7db" strokeWidth="1.5">
          <path
            d="M44 63q20 0 10-22"
            fill="none"
            stroke="#fff7de"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M15 71Q10 47 22 44q24-10 24 22l-4 10-7-4-7 5-7-4z"
            fill="#fffaf0"
          />
          <path
            d="M32 46q11 1 11 17l-7 4q3-12-4-21"
            fill="#efe2af"
            stroke="none"
          />
          <path
            d="M12 43 13 22 25 31q6-2 11 0l12-9-1 24q-18 17-35-3"
            fill="#fff9ec"
          />
          <path d="m16 27 7 7-7 3m28-10-7 7 7 3" fill="#e8b68c" stroke="none" />
        </g>
        <ellipse cx="23" cy="42" rx="3" ry="4" fill="#7ab7d3" />
        <ellipse cx="38" cy="42" rx="3" ry="4" fill="#7ab7d3" />
        <circle cx="24" cy="41" r="1" fill="white" />
        <circle cx="39" cy="41" r="1" fill="white" />
        <path
          d="m28 48 3 2 3-2m-3 2v3"
          fill="none"
          stroke="#d6a8a4"
          strokeLinecap="round"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 60 85" className="avatar-art" aria-hidden="true">
      <ellipse cx="30" cy="79" rx="18" ry="4" fill="#201e25" opacity=".3" />
      <path
        d={
          pose === "sitting" || pose === "drinking"
            ? "M20 62l-8 8 3 8m25-16 8 8-3 8"
            : "M20 62v14m20-14v14"
        }
        stroke="#332627"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M16 54q14-16 28 0l2 16H14z"
        fill={claudinho ? "#bf795b" : gpt ? "#284d50" : "#edd7bd"}
        stroke="#523d36"
        strokeWidth="2"
      />
      <path
        d="M11 46V29Q9 4 30 5q25 0 21 31v23L40 56 18 58z"
        fill={claudinho ? "#835443" : gpt ? "#2a292d" : "#49312c"}
      />
      <ellipse
        cx="30"
        cy="33"
        rx="17"
        ry="20"
        fill={back ? "#49312c" : "#f1cba7"}
      />
      <path
        d="M13 30Q10 6 30 8q23-2 19 24L36 18l-5 9-8-6z"
        fill={claudinho ? "#835443" : gpt ? "#2a292d" : "#49312c"}
      />
      {claudinho && !back && (
        <g fill="none" stroke="#704e36" strokeWidth="1.5">
          <circle cx="23" cy="35" r="6" />
          <circle cx="38" cy="35" r="6" />
          <path d="M29 35h3" />
        </g>
      )}
      {!back && (
        <g className="avatar-face">
          <ellipse
            cx="23"
            cy="35"
            rx="2"
            ry={pose === "lying" ? "0.6" : "3"}
            fill="#2e282b"
          />
          <ellipse
            cx="38"
            cy="35"
            rx="2"
            ry={pose === "lying" ? "0.6" : "3"}
            fill="#2e282b"
          />
          <path
            d="M27 44q4 3 8-1"
            fill="none"
            stroke="#ad655b"
            strokeWidth="2"
          />
          <circle cx="18" cy="41" r="3" fill="#e8a297" opacity=".7" />
          <circle cx="43" cy="41" r="3" fill="#e8a297" opacity=".7" />
          <circle cx="23.5" cy="34" r=".8" fill="#fff" />
          <circle cx="38.5" cy="34" r=".8" fill="#fff" />
        </g>
      )}
      <path
        d={
          pose === "using" ? "M16 55 9 48m35 7 8-7" : "M16 55 10 65m34-10 7 10"
        }
        stroke="#efc9a6"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {!gpt && (
        <path
          d="M17 52q13 8 26 0"
          fill="none"
          stroke="#b88282"
          strokeWidth="3"
        />
      )}
      {gpt ? (
        <path d="m30 56 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#edc479" />
      ) : (
        <path d="M13 22q-8-8-7 1 0 8 9 2" fill="#c8878c" />
      )}
    </svg>
  );
}

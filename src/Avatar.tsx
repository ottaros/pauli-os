export default function Avatar({
  gpt = false,
  claudinho = false,
  pose = "idle",
  back = false,
}: {
  gpt?: boolean;
  claudinho?: boolean;
  pose?: string;
  back?: boolean;
}) {
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

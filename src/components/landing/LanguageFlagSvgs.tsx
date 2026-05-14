/** Simplified flag art for marketing cards (~80×60). */

const vb = "0 0 80 60";

function FlagUkraine() {
  return (
    <svg viewBox={vb} width={80} height={60} className="shrink-0" aria-hidden>
      <rect width={80} height={30} fill="#0057B7" />
      <rect y={30} width={80} height={30} fill="#FFD700" />
    </svg>
  );
}

function FlagSpain() {
  return (
    <svg viewBox={vb} width={80} height={60} className="shrink-0" aria-hidden>
      <rect width={80} height={15} fill="#AA151B" />
      <rect y={15} width={80} height={30} fill="#F1BF00" />
      <rect y={45} width={80} height={15} fill="#AA151B" />
    </svg>
  );
}

function FlagPortugal() {
  return (
    <svg viewBox={vb} width={80} height={60} className="shrink-0" aria-hidden>
      <rect width={32} height={60} fill="#006600" />
      <rect x={32} width={48} height={60} fill="#FF0000" />
      <circle cx={32} cy={30} r={11} fill="none" stroke="#FFD700" strokeWidth={1.5} />
      <circle cx={32} cy={30} r={6} fill="#FFD700" />
    </svg>
  );
}

function FlagPoland() {
  return (
    <svg viewBox={vb} width={80} height={60} className="shrink-0" aria-hidden>
      <rect width={80} height={30} fill="#FFFFFF" />
      <rect y={30} width={80} height={30} fill="#DC143C" />
    </svg>
  );
}

function FlagChina() {
  return (
    <svg viewBox={vb} width={80} height={60} className="shrink-0" aria-hidden>
      <rect width={80} height={60} fill="#DE2910" />
      <polygon
        fill="#FFDE00"
        points="12,8 14.5,15.5 22,15.5 16,20 18.5,27.5 12,23 5.5,27.5 8,20 2,15.5 9.5,15.5"
      />
      <polygon fill="#FFDE00" points="24,4 25,8 29,8 25.8,10.5 27,14 24,11.5 21,14 22.2,10.5 19,8 23,8" />
      <polygon fill="#FFDE00" points="24,18 25,22 29,22 25.8,24.5 27,28 24,25.5 21,28 22.2,24.5 19,22 23,22" />
      <polygon fill="#FFDE00" points="24,32 25,36 29,36 25.8,38.5 27,42 24,39.5 21,42 22.2,38.5 19,36 23,36" />
      <polygon fill="#FFDE00" points="18,12 19,16 23,16 19.8,18.5 21,22 18,19.5 15,22 16.2,18.5 13,16 17,16" />
    </svg>
  );
}

type Props = { id: string };

export function LanguageFlagSvg({ id }: Props) {
  switch (id) {
    case "ukrainian":
      return <FlagUkraine />;
    case "spanish":
      return <FlagSpain />;
    case "portuguese":
      return <FlagPortugal />;
    case "polish":
      return <FlagPoland />;
    case "chinese":
      return <FlagChina />;
    default:
      return <FlagUkraine />;
  }
}

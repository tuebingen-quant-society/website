import { content, type Locale } from "@/i18n";

function arrow(direction: "up" | "down" | "flat") {
  if (direction === "up") return "▲";
  if (direction === "down") return "▼";
  return "◆";
}

export function Ticker({ locale }: { locale: Locale }) {
  const items = content[locale].ticker;
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[0, 1].map((copy) => (
          <div className="ticker__group" key={copy}>
            {items.map((item) => (
              <span className="ticker__item" key={`${copy}-${item.sym}`}>
                <span className="ticker__sym">{item.sym}</span>
                <span className={`ticker__val ticker__val--${item.dir}`}>
                  {arrow(item.dir)} {item.val}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

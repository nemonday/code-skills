import type { ReactNode } from "react";
import "./pixel-game.css";

type PixelLoginSceneProps = {
  title: string;
  description?: string;
  productName?: string;
  children: ReactNode;
};

export function PixelLoginScene({
  title,
  description,
  productName = "PLAYER PORTAL",
  children,
}: PixelLoginSceneProps) {
  return (
    <main className="pixel-login-scene beautify-root">
      <section className="pixel-login-world" aria-label="产品介绍">
        <div className="clouds-layer" aria-hidden="true">
          <span className="pixel-cloud c1" />
          <span className="pixel-cloud c2" />
          <span className="pixel-cloud c3" />
        </div>

        <div className="pixel-world-copy">
          <span className="pixel-kicker">{productName}</span>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>

        <div className="pixel-world-stage" aria-hidden="true">
          <span className="pixel-tree left-tree" />
          <span className="pixel-hero-character" />
          <span className="pixel-tree right-tree" />
        </div>
        <div className="pixel-ground-bar" aria-hidden="true" />
      </section>

      <section className="pixel-login-panel-wrap">
        <div className="pixel-login-panel pixel-business-safe-zone">
          {children}
        </div>
      </section>
    </main>
  );
}

/*
Usage:
<PixelLoginScene
  productName="TCL PRICE BOOK"
  title="欢迎回来"
  description="保留原来的业务说明，不改变登录逻辑。"
>
  <ExistingLoginForm />
</PixelLoginScene>

Rules:
1. Keep the existing form state, validation, submit handler, API calls and routing.
2. Remove conflicting large-radius, blur and translucent-glass utility classes from the login shell.
3. Do not place decorative nodes inside the form. Decorations remain aria-hidden and pointer-events:none through generated CSS.
*/

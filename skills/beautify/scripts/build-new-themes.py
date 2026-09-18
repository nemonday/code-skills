from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "templates"
BASE = json.loads((TEMPLATES / "classic-blue-white.json").read_text(encoding="utf-8"))


def merge(target: dict, patch: dict) -> dict:
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            merge(target[key], value)
        else:
            target[key] = value
    return target


def build(theme_id: str, name: str, description: str, patch: dict) -> None:
    theme = copy.deepcopy(BASE)
    theme.update({"id": theme_id, "name": name, "description": description, "version": "1.0.0"})
    merge(theme, patch)
    theme.pop("dynamicBackground", None)
    out = TEMPLATES / f"{theme_id}.json"
    out.write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(out)


build(
    "neomorphism",
    "Neomorphism-新拟态",
    "同色浅灰表面通过亮暗双向阴影形成凸起与凹陷，适合设置面板、轻量控制台和专注型工具。",
    {
        "tokens": {
            "colors": {
                "primary": {"50": "#eef0ff", "100": "#dde1ff", "200": "#c5cbff", "400": "#8794f5", "500": "#667eea", "600": "#5368d4", "700": "#4455b5", "800": "#34418f", "900": "#252f68"},
                "neutral": {"0": "#e8edf3", "50": "#e4e9f0", "100": "#dde3eb", "200": "#d2dae4", "300": "#bec8d4", "400": "#98a6b6", "500": "#687789", "600": "#536173", "700": "#3d4958", "800": "#2b3542", "900": "#1f2731"},
                "success": {"bg": "#dfece8", "text": "#257c69", "border": "#b9d9d0"},
                "warning": {"bg": "#eee7d9", "text": "#9b6b20", "border": "#dfcfaa"},
                "danger": {"bg": "#f0dfe3", "text": "#a24c62", "border": "#dfbdc6"},
                "info": {"bg": "#e0e4f3", "text": "#5368d4", "border": "#c9cfea"}
            },
            "typography": {"fontFamily": "'Avenir Next', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif", "letterSpacing": {"tight": "-0.02em", "normal": "0", "wide": "0.04em"}},
            "radii": {"sm": "10px", "md": "14px", "lg": "18px", "xl": "22px", "pill": "999px", "hero": "28px"},
            "shadows": {"sm": "4px 4px 9px #bec8d4, -4px -4px 9px #ffffff", "md": "7px 7px 15px #bec8d4, -7px -7px 15px #ffffff", "lg": "10px 10px 22px #bec8d4, -10px -10px 22px #ffffff", "xl": "14px 14px 30px #b8c2cf, -14px -14px 30px #ffffff", "hero": "18px 18px 38px #b8c2cf, -18px -18px 38px #ffffff"},
            "animation": {"duration": {"fast": "0.14s", "normal": "0.24s", "slow": "0.38s"}, "easing": {"default": "cubic-bezier(0.2, 0.8, 0.2, 1)", "smooth": "cubic-bezier(0.4, 0, 0.2, 1)", "bounce": "cubic-bezier(0.2, 1.2, 0.4, 1)"}}
        },
        "components": {
            "button": {
                "primary": {"bg": "linear-gradient(145deg, #7189f5, #5b70dc)", "text": "#ffffff", "border": "0", "radius": "{radii.md}", "padding": "10px 18px", "fontSize": "{typography.scale.sm}", "fontWeight": "{typography.weights.bold}", "shadow": "6px 6px 12px #b8c2cf, -6px -6px 12px #ffffff", "hover": {"bg": "linear-gradient(145deg, #7890ff, #6077e8)", "shadow": "8px 8px 16px #b8c2cf, -8px -8px 16px #ffffff", "transform": "translateY(-1px)"}, "active": {"bg": "#667eea", "shadow": "inset 4px 4px 8px #4f61b8, inset -4px -4px 8px #819aff", "transform": "translateY(1px)"}},
                "secondary": {"bg": "#e4e9f0", "text": "#536173", "border": "0", "radius": "{radii.md}", "padding": "10px 18px", "fontSize": "{typography.scale.sm}", "fontWeight": "{typography.weights.semibold}", "shadow": "{shadows.sm}", "hover": {"bg": "#e8edf3", "shadow": "{shadows.md}"}}
            },
            "card": {"default": {"bg": "#e4e9f0", "border": "0", "radius": "{radii.xl}", "shadow": "{shadows.lg}", "padding": "{spacing.xl}", "hover": {"shadow": "{shadows.xl}", "transform": "translateY(-2px)"}}, "soft": {"bg": "#e4e9f0", "border": "0", "radius": "{radii.xl}", "shadow": "inset 5px 5px 11px #c1cad6, inset -5px -5px 11px #ffffff", "padding": "{spacing.lg}"}},
            "input": {"bg": "#e4e9f0", "border": "0", "radius": "{radii.md}", "padding": "11px 14px", "fontSize": "{typography.scale.base}", "shadow": "inset 4px 4px 9px #c1cad6, inset -4px -4px 9px #ffffff", "focus": {"border": "#667eea", "bg": "#e7ebf2", "shadow": "inset 4px 4px 9px #c1cad6, inset -4px -4px 9px #ffffff, 0 0 0 3px rgba(102,126,234,.18)"}},
            "table": {"headerBg": "#e4e9f0", "headerText": "#536173", "headerWeight": "750", "border": "1px solid rgba(152,166,182,.28)", "rowHover": "#e9edf3", "radius": "{radii.lg}", "cellPadding": "12px 10px", "fontSize": "{typography.scale.sm}"},
            "statCard": {"bg": "#e4e9f0", "border": "0", "radius": "{radii.lg}", "padding": "18px 20px", "shadow": "{shadows.md}", "labelColor": "#687789", "valueColor": "#2b3542"},
            "leaderboard": {"itemBg": "#e4e9f0", "itemBorder": "0", "itemRadius": "{radii.lg}", "itemHover": "#e8edf3", "shadow": "{shadows.sm}", "rank1": {"bg": "linear-gradient(145deg,#ffe99f,#e2b957)", "text": "#76520b", "border": "0"}, "rank2": {"bg": "linear-gradient(145deg,#ffffff,#c9d1dc)", "text": "#52606e", "border": "0"}, "rank3": {"bg": "linear-gradient(145deg,#ffc49f,#d7855a)", "text": "#733719", "border": "0"}, "rankOther": {"bg": "#e4e9f0", "text": "#687789", "border": "0"}},
            "progress": {"bg": "#e4e9f0", "border": "0", "height": "10px", "radius": "{radii.pill}", "fill": "linear-gradient(90deg,#667eea,#8d74e8)", "shadow": "inset 3px 3px 6px #c1cad6, inset -3px -3px 6px #ffffff"},
            "switch": {"width": "48px", "height": "26px", "bg": "#d8dee7", "border": "0", "handleBg": "#eaf0f6", "activeBg": "linear-gradient(135deg,#667eea,#8d74e8)"},
            "dropdown": {"bg": "#e4e9f0", "border": "0", "radius": "{radii.lg}", "shadow": "{shadows.lg}", "itemHover": "#dce2eb", "itemHoverText": "#5368d4", "itemPadding": "10px 14px", "itemRadius": "{radii.md}"},
            "modal": {"overlayBg": "rgba(52,65,82,.28)", "boxBg": "#e4e9f0", "border": "0", "radius": "{radii.xl}", "shadow": "{shadows.xl}", "headerPadding": "18px 22px", "bodyPadding": "22px", "footerPadding": "14px 22px", "headerBorder": "none", "footerBorder": "none"}
        },
        "layouts": {"hero": {"bg": "#e4e9f0", "text": "#2b3542", "radius": "{radii.hero}", "shadow": "{shadows.hero}", "decorations": {"circleRight": "rgba(102,126,234,.16)", "circleBottom": "rgba(255,255,255,.55)"}}, "page": {"bg": "#e4e9f0", "maxWidth": "1920px", "padding": "24px 28px 36px"}},
        "cssVariables": {"--bg-page": "#e4e9f0", "--bg-card": "#e4e9f0", "--bg-card-soft": "#e4e9f0", "--bg-chart": "#e4e9f0", "--bg-insight": "#e0e4f3", "--bg-table-header": "#e4e9f0", "--bg-row-hover": "#e9edf3", "--bg-filter": "#e4e9f0", "--bg-warning-card": "#eee7d9", "--bg-danger-card": "#f0dfe3", "--text-primary": "#2b3542", "--text-muted": "#687789", "--text-on-hero": "#2b3542", "--border-default": "rgba(152,166,182,.28)", "--border-chart": "rgba(152,166,182,.24)", "--scrollbar-thumb": "#aeb9c6", "--line-chart-grid": "#cdd5df", "--bar-primary": "linear-gradient(180deg,#8794f5,#667eea)", "--bar-green": "linear-gradient(180deg,#5cb8a4,#257c69)", "--bar-orange": "linear-gradient(180deg,#d4a34f,#9b6b20)", "--bar-purple": "linear-gradient(180deg,#a58bee,#7d62ca)"}
    }
)

build(
    "retro-y2k",
    "Retro-Y2K千禧风",
    "粉紫青糖果渐变、Chrome 金属光泽、气泡轮廓与星芒闪烁组成的怀旧未来主义界面。",
    {
        "tokens": {
            "colors": {
                "primary": {"50": "#fff0f7", "100": "#ffd5e8", "200": "#ffabd2", "400": "#ff7aad", "500": "#ff4f9a", "600": "#e83786", "700": "#bd226b", "800": "#8d1751", "900": "#5d1238"},
                "neutral": {"0": "#ffffff", "50": "#fff9ff", "100": "#f7efff", "200": "#e9d9f6", "300": "#d8c1e8", "400": "#9e84b5", "500": "#745e8a", "600": "#59466f", "700": "#402f55", "800": "#291c3c", "900": "#160d28"},
                "success": {"bg": "#d9fff4", "text": "#007c70", "border": "#7ee8d4"},
                "warning": {"bg": "#fff4c8", "text": "#8a5b00", "border": "#ffd76b"},
                "danger": {"bg": "#ffe0ed", "text": "#b72162", "border": "#ff9fc8"},
                "info": {"bg": "#dff9ff", "text": "#007a9e", "border": "#87e6f8"}
            },
            "typography": {"fontFamily": "'Trebuchet MS', 'Arial Rounded MT Bold', 'PingFang SC', sans-serif", "fontMono": "'Courier New', monospace", "letterSpacing": {"tight": "-0.03em", "normal": "0.01em", "wide": "0.12em"}},
            "radii": {"sm": "12px", "md": "18px", "lg": "24px", "xl": "30px", "pill": "999px", "hero": "36px"},
            "shadows": {"sm": "0 5px 0 rgba(102,55,151,.14), 0 10px 22px rgba(198,106,255,.16)", "md": "0 8px 0 rgba(102,55,151,.16), 0 18px 36px rgba(198,106,255,.20)", "lg": "0 10px 0 rgba(102,55,151,.18), 0 24px 48px rgba(255,79,154,.22)", "xl": "0 14px 0 rgba(102,55,151,.20), 0 32px 70px rgba(0,212,255,.22)", "hero": "0 16px 0 rgba(102,55,151,.18), 0 36px 80px rgba(198,106,255,.28)"},
            "animation": {"duration": {"fast": "0.12s", "normal": "0.25s", "slow": "0.55s"}, "easing": {"default": "cubic-bezier(0.2, 0.9, 0.3, 1.2)", "smooth": "cubic-bezier(0.4, 0, 0.2, 1)", "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)"}}
        },
        "components": {
            "button": {
                "primary": {"bg": "linear-gradient(135deg,#ff6b9d 0%,#c66aff 52%,#00d4ff 100%)", "text": "#ffffff", "border": "2px solid rgba(255,255,255,.88)", "radius": "{radii.pill}", "padding": "11px 20px", "fontSize": "{typography.scale.sm}", "fontWeight": "{typography.weights.bold}", "letterSpacing": ".05em", "shadow": "0 6px 0 #8b3dbd, 0 14px 28px rgba(198,106,255,.30)", "hover": {"bg": "linear-gradient(135deg,#ff82b0,#d77cff,#22ddff)", "shadow": "0 8px 0 #8b3dbd, 0 18px 34px rgba(198,106,255,.38)", "transform": "translateY(-2px)"}, "active": {"bg": "linear-gradient(135deg,#ff5d96,#bc59f2,#00c4ef)", "shadow": "0 2px 0 #8b3dbd, 0 8px 16px rgba(198,106,255,.24)", "transform": "translateY(4px)"}},
                "secondary": {"bg": "rgba(255,255,255,.86)", "text": "#8d2bb5", "border": "2px solid #d96dff", "radius": "{radii.pill}", "padding": "11px 20px", "fontSize": "{typography.scale.sm}", "fontWeight": "{typography.weights.bold}", "shadow": "0 5px 0 rgba(141,43,181,.18)", "hover": {"bg": "#ffffff", "border": "2px solid #00d4ff", "shadow": "0 7px 0 rgba(0,160,194,.20)"}}
            },
            "card": {"default": {"bg": "linear-gradient(145deg,rgba(255,255,255,.96),rgba(255,241,252,.88))", "border": "2px solid rgba(255,255,255,.96)", "radius": "{radii.xl}", "shadow": "{shadows.lg}", "padding": "{spacing.xl}", "hover": {"shadow": "{shadows.xl}", "transform": "translateY(-4px) rotate(-.25deg)"}}, "soft": {"bg": "linear-gradient(135deg,rgba(255,255,255,.74),rgba(234,245,255,.76))", "border": "2px solid rgba(255,255,255,.9)", "radius": "{radii.xl}", "shadow": "{shadows.md}", "padding": "{spacing.lg}"}},
            "input": {"bg": "rgba(255,255,255,.88)", "border": "2px solid #e7b6ff", "radius": "{radii.pill}", "padding": "11px 16px", "fontSize": "{typography.scale.base}", "shadow": "inset 0 2px 6px rgba(198,106,255,.12)", "focus": {"border": "#00d4ff", "bg": "#ffffff", "shadow": "0 0 0 4px rgba(0,212,255,.18), 0 8px 20px rgba(198,106,255,.18)"}},
            "table": {"headerBg": "linear-gradient(90deg,#fff1f8,#edfaff)", "headerText": "#6b367e", "headerWeight": "800", "border": "1px solid #efd9f7", "rowHover": "#fff3fb", "radius": "{radii.lg}", "cellPadding": "12px 10px", "fontSize": "{typography.scale.sm}"},
            "statCard": {"bg": "linear-gradient(145deg,#ffffff,#fff1fb)", "border": "2px solid rgba(255,255,255,.95)", "radius": "{radii.xl}", "padding": "20px 22px", "shadow": "{shadows.md}", "labelColor": "#745e8a", "valueColor": "#402f55"},
            "leaderboard": {"itemBg": "linear-gradient(135deg,#ffffff,#fff3fb)", "itemBorder": "2px solid rgba(255,255,255,.95)", "itemRadius": "{radii.lg}", "itemHover": "#fff0fa", "shadow": "{shadows.sm}", "rank1": {"bg": "linear-gradient(135deg,#fff6a5,#ffb85c)", "text": "#7d4700", "border": "2px solid #ffffff"}, "rank2": {"bg": "linear-gradient(135deg,#ffffff,#b8c8df)", "text": "#46566c", "border": "2px solid #ffffff"}, "rank3": {"bg": "linear-gradient(135deg,#ffc8b7,#ff8e9f)", "text": "#7f2740", "border": "2px solid #ffffff"}, "rankOther": {"bg": "linear-gradient(135deg,#f5e8ff,#dff9ff)", "text": "#745e8a", "border": "1px solid #ffffff"}},
            "progress": {"bg": "rgba(255,255,255,.72)", "border": "2px solid #ffffff", "height": "12px", "radius": "{radii.pill}", "fill": "linear-gradient(90deg,#ff6b9d,#c66aff,#00d4ff)", "shimmer": "linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)"},
            "switch": {"width": "50px", "height": "26px", "bg": "#dfc8ec", "border": "2px solid #ffffff", "handleBg": "linear-gradient(145deg,#ffffff,#e6efff)", "activeBg": "linear-gradient(90deg,#ff6b9d,#c66aff,#00d4ff)"},
            "dropdown": {"bg": "rgba(255,255,255,.96)", "border": "2px solid #ffffff", "radius": "{radii.lg}", "shadow": "{shadows.lg}", "backdropFilter": "blur(18px)", "itemHover": "linear-gradient(90deg,#fff0f7,#e8faff)", "itemHoverText": "#a52cbb", "itemPadding": "10px 14px", "itemRadius": "{radii.md}"},
            "modal": {"overlayBg": "rgba(39,17,64,.45)", "boxBg": "linear-gradient(145deg,#ffffff,#fff0fa)", "border": "2px solid #ffffff", "radius": "{radii.xl}", "shadow": "{shadows.xl}", "backdropFilter": "blur(16px)", "headerPadding": "20px 24px", "bodyPadding": "24px", "footerPadding": "16px 24px", "headerBorder": "none", "footerBorder": "none"}
        },
        "layouts": {"hero": {"bg": "linear-gradient(135deg,#ff6b9d 0%,#c66aff 48%,#00d4ff 100%)", "text": "#ffffff", "radius": "{radii.hero}", "shadow": "{shadows.hero}", "decorations": {"circleRight": "rgba(255,255,255,.28)", "circleBottom": "rgba(255,238,99,.28)"}}, "page": {"bg": "radial-gradient(circle at 12% 10%,#ffd9ec 0,transparent 28%),radial-gradient(circle at 88% 18%,#c9f7ff 0,transparent 30%),linear-gradient(145deg,#fff8fc,#f3eaff 54%,#e7fbff)", "maxWidth": "1920px", "padding": "24px 28px 40px"}},
        "cssVariables": {"--bg-page": "radial-gradient(circle at 12% 10%,#ffd9ec 0,transparent 28%),radial-gradient(circle at 88% 18%,#c9f7ff 0,transparent 30%),linear-gradient(145deg,#fff8fc,#f3eaff 54%,#e7fbff)", "--bg-card": "rgba(255,255,255,.94)", "--bg-card-soft": "linear-gradient(145deg,#ffffff,#fff1fb)", "--bg-chart": "linear-gradient(180deg,#ffffff,#f8f0ff)", "--bg-insight": "#fff0fa", "--bg-table-header": "linear-gradient(90deg,#fff1f8,#edfaff)", "--bg-row-hover": "#fff3fb", "--bg-filter": "rgba(255,255,255,.30)", "--bg-warning-card": "#fff6d7", "--bg-danger-card": "#ffe0ed", "--text-primary": "#402f55", "--text-muted": "#745e8a", "--text-on-hero": "#ffffff", "--border-default": "#efd9f7", "--border-chart": "#ead9f5", "--scrollbar-thumb": "#c66aff", "--line-chart-grid": "#e9d8f3", "--bar-primary": "linear-gradient(180deg,#ff6b9d,#c66aff)", "--bar-green": "linear-gradient(180deg,#61e9d0,#00bfa8)", "--bar-orange": "linear-gradient(180deg,#ffe56d,#ffad4d)", "--bar-purple": "linear-gradient(180deg,#db8bff,#994cff)"}
    }
)

build(
    "claymorphism",
    "Claymorphism-粘土风",
    "柔和粉嫩表面、超大圆角、白色高光边与无模糊彩色位移阴影构成的软 3D 粘土界面。",
    {
        "tokens": {
            "colors": {
                "primary": {"50": "#f3f0ff", "100": "#e4ddff", "200": "#cfc2ff", "400": "#9b80ff", "500": "#7c5cfc", "600": "#6848e6", "700": "#5235bd", "800": "#3f2990", "900": "#2e2066"},
                "neutral": {"0": "#ffffff", "50": "#f8f8fb", "100": "#f0f0f3", "200": "#e3e3e9", "300": "#d3d3dc", "400": "#a7a7b3", "500": "#777785", "600": "#5e5e6a", "700": "#44444f", "800": "#303039", "900": "#202027"},
                "success": {"bg": "#dff9ec", "text": "#207a55", "border": "#a9e7cb"},
                "warning": {"bg": "#fff0d7", "text": "#9a6020", "border": "#ffd29a"},
                "danger": {"bg": "#ffe1e8", "text": "#ac3b5a", "border": "#ffb2c4"},
                "info": {"bg": "#e9e2ff", "text": "#6848e6", "border": "#cfc2ff"}
            },
            "typography": {"fontFamily": "'Nunito', 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif", "letterSpacing": {"tight": "-0.025em", "normal": "0", "wide": "0.04em"}},
            "radii": {"sm": "16px", "md": "20px", "lg": "24px", "xl": "30px", "pill": "999px", "hero": "38px"},
            "shadows": {"sm": "5px 6px 0 rgba(124,92,252,.12), inset 0 2px 0 rgba(255,255,255,.9)", "md": "8px 9px 0 rgba(124,92,252,.14), 0 18px 28px rgba(91,70,170,.10), inset 0 2px 0 rgba(255,255,255,.9)", "lg": "10px 12px 0 rgba(124,92,252,.15), 0 24px 38px rgba(91,70,170,.12), inset 0 2px 0 rgba(255,255,255,.92)", "xl": "14px 16px 0 rgba(124,92,252,.16), 0 30px 54px rgba(91,70,170,.14), inset 0 3px 0 rgba(255,255,255,.94)", "hero": "16px 18px 0 rgba(124,92,252,.16), 0 36px 64px rgba(91,70,170,.15), inset 0 3px 0 rgba(255,255,255,.94)"},
            "animation": {"duration": {"fast": "0.14s", "normal": "0.28s", "slow": "0.48s"}, "easing": {"default": "cubic-bezier(0.2, 0.85, 0.25, 1.15)", "smooth": "cubic-bezier(0.4, 0, 0.2, 1)", "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)"}}
        },
        "components": {
            "button": {
                "primary": {"bg": "linear-gradient(145deg,#8f72ff,#7353f2)", "text": "#ffffff", "border": "2px solid rgba(255,255,255,.82)", "radius": "{radii.pill}", "padding": "11px 20px", "fontSize": "{typography.scale.sm}", "fontWeight": "{typography.weights.bold}", "shadow": "0 7px 0 #5137bd, 0 14px 24px rgba(124,92,252,.22), inset 0 2px 0 rgba(255,255,255,.35)", "hover": {"bg": "linear-gradient(145deg,#9c82ff,#7c5cfc)", "shadow": "0 9px 0 #5137bd, 0 18px 28px rgba(124,92,252,.28), inset 0 2px 0 rgba(255,255,255,.4)", "transform": "translateY(-2px)"}, "active": {"bg": "linear-gradient(145deg,#7657ef,#6848e6)", "shadow": "0 3px 0 #5137bd, 0 8px 14px rgba(124,92,252,.18), inset 0 2px 0 rgba(255,255,255,.25)", "transform": "translateY(4px) scale(.99)"}},
                "secondary": {"bg": "linear-gradient(145deg,#ffffff,#f3f3f7)", "text": "#6848e6", "border": "2px solid rgba(255,255,255,.95)", "radius": "{radii.pill}", "padding": "11px 20px", "fontSize": "{typography.scale.sm}", "fontWeight": "{typography.weights.bold}", "shadow": "0 6px 0 rgba(124,92,252,.12), inset 0 2px 0 #ffffff", "hover": {"bg": "#ffffff", "border": "2px solid #e9e2ff", "shadow": "0 8px 0 rgba(124,92,252,.15), inset 0 2px 0 #ffffff"}}
            },
            "card": {"default": {"bg": "linear-gradient(145deg,#ffffff,#f8f7ff)", "border": "2px solid rgba(255,255,255,.92)", "radius": "{radii.xl}", "shadow": "{shadows.lg}", "padding": "{spacing.xl}", "hover": {"shadow": "{shadows.xl}", "transform": "translateY(-3px) rotate(-.15deg)"}}, "soft": {"bg": "linear-gradient(145deg,#fff5f8,#f2efff)", "border": "2px solid rgba(255,255,255,.92)", "radius": "{radii.xl}", "shadow": "{shadows.md}", "padding": "{spacing.lg}"}},
            "input": {"bg": "#ffffff", "border": "2px solid rgba(255,255,255,.96)", "radius": "{radii.md}", "padding": "11px 15px", "fontSize": "{typography.scale.base}", "shadow": "inset 3px 4px 8px rgba(76,62,128,.11), inset -2px -2px 0 rgba(255,255,255,.85)", "focus": {"border": "#cfc2ff", "bg": "#ffffff", "shadow": "inset 3px 4px 8px rgba(76,62,128,.10), 0 0 0 4px rgba(124,92,252,.16)"}},
            "table": {"headerBg": "#f2efff", "headerText": "#5e5e6a", "headerWeight": "800", "border": "1px solid #ece8f7", "rowHover": "#faf7ff", "radius": "{radii.lg}", "cellPadding": "12px 10px", "fontSize": "{typography.scale.sm}"},
            "statCard": {"bg": "linear-gradient(145deg,#ffffff,#f8f6ff)", "border": "2px solid rgba(255,255,255,.95)", "radius": "{radii.xl}", "padding": "20px 22px", "shadow": "{shadows.md}", "labelColor": "#777785", "valueColor": "#303039"},
            "leaderboard": {"itemBg": "linear-gradient(145deg,#ffffff,#f9f7ff)", "itemBorder": "2px solid rgba(255,255,255,.95)", "itemRadius": "{radii.lg}", "itemHover": "#f8f4ff", "shadow": "{shadows.sm}", "rank1": {"bg": "linear-gradient(145deg,#ffe985,#ffbd4a)", "text": "#805000", "border": "2px solid rgba(255,255,255,.8)"}, "rank2": {"bg": "linear-gradient(145deg,#ffffff,#d5dde7)", "text": "#53606e", "border": "2px solid rgba(255,255,255,.8)"}, "rank3": {"bg": "linear-gradient(145deg,#ffc0a8,#f28b6a)", "text": "#74351f", "border": "2px solid rgba(255,255,255,.8)"}, "rankOther": {"bg": "#eee9ff", "text": "#6848e6", "border": "2px solid rgba(255,255,255,.8)"}},
            "progress": {"bg": "#e7e3ef", "border": "2px solid #ffffff", "height": "12px", "radius": "{radii.pill}", "fill": "linear-gradient(90deg,#7c5cfc,#ff6b8a,#ffb347)", "shimmer": "linear-gradient(90deg,transparent,rgba(255,255,255,.58),transparent)"},
            "switch": {"width": "50px", "height": "28px", "bg": "#ddd9e7", "border": "2px solid #ffffff", "handleBg": "linear-gradient(145deg,#ffffff,#eeeaf8)", "activeBg": "linear-gradient(135deg,#7c5cfc,#ff6b8a)"},
            "dropdown": {"bg": "#ffffff", "border": "2px solid rgba(255,255,255,.96)", "radius": "{radii.lg}", "shadow": "{shadows.lg}", "itemHover": "#f2efff", "itemHoverText": "#6848e6", "itemPadding": "10px 14px", "itemRadius": "{radii.md}"},
            "modal": {"overlayBg": "rgba(48,48,57,.32)", "boxBg": "linear-gradient(145deg,#ffffff,#f7f5ff)", "border": "2px solid rgba(255,255,255,.96)", "radius": "{radii.xl}", "shadow": "{shadows.xl}", "headerPadding": "20px 24px", "bodyPadding": "24px", "footerPadding": "16px 24px", "headerBorder": "none", "footerBorder": "none"}
        },
        "layouts": {"hero": {"bg": "linear-gradient(145deg,#8f72ff 0%,#7c5cfc 50%,#ff7f9b 100%)", "text": "#ffffff", "radius": "{radii.hero}", "shadow": "{shadows.hero}", "decorations": {"circleRight": "rgba(255,255,255,.26)", "circleBottom": "rgba(255,196,120,.28)"}}, "page": {"bg": "linear-gradient(145deg,#f0f0f3,#f7f2ff 55%,#fff1f5)", "maxWidth": "1920px", "padding": "24px 28px 40px"}},
        "cssVariables": {"--bg-page": "linear-gradient(145deg,#f0f0f3,#f7f2ff 55%,#fff1f5)", "--bg-card": "#ffffff", "--bg-card-soft": "linear-gradient(145deg,#fff5f8,#f2efff)", "--bg-chart": "linear-gradient(180deg,#ffffff,#faf7ff)", "--bg-insight": "#f2efff", "--bg-table-header": "#f2efff", "--bg-row-hover": "#faf7ff", "--bg-filter": "rgba(255,255,255,.48)", "--bg-warning-card": "#fff0d7", "--bg-danger-card": "#ffe1e8", "--text-primary": "#303039", "--text-muted": "#777785", "--text-on-hero": "#ffffff", "--border-default": "#ece8f7", "--border-chart": "#eeeaf7", "--scrollbar-thumb": "#b9acee", "--line-chart-grid": "#e6e1f0", "--bar-primary": "linear-gradient(180deg,#9b80ff,#7c5cfc)", "--bar-green": "linear-gradient(180deg,#63d6a4,#30a776)", "--bar-orange": "linear-gradient(180deg,#ffc36d,#ff9f43)", "--bar-purple": "linear-gradient(180deg,#ff91aa,#ff6b8a)"}
    }
)

import { defineConfig, presetWind4, transformerVariantGroup } from "unocss";
import { presetKobalte } from "unocss-preset-primitives";

export default defineConfig({
  presets: [presetWind4({ dark: 'class' }), presetKobalte()],
  transformers: [transformerVariantGroup()],

  theme: {
    colors: {
      red: "rgb(var(--custom-color))"
    },

    breakpoint: {
      sm: "436px",
      tablet: "768px",
      "laptop-sm": "1024px",
      "laptop-lg": "1440px",
    },

    animation: {
      keyframes: {
        "scale-in": "{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}",
        "scale-out": "{from{opacity:1;transform:scale(&)}to{opacity:0;transform:scale(0.96)}}"
      }
    }
  }
});

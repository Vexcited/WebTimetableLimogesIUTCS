/* @refresh reload */
import "@unocss/reset/tailwind.css";
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import "virtual:uno.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "satone/client";
import { render } from "solid-js/web";

import {
  createEffect,
  Suspense,
  onMount
} from "solid-js";

import { Meta, MetaProvider } from "@solidjs/meta";

import { getUserCustomizationKey } from "~/stores/preferences";

import UpdaterModal from "~/components/modals/Updater";
import LessonModal from "~/components/modals/Lesson";

import { initializeNowRefresh } from "~/stores/temporary";
import { rgbToHex } from "~/utils/colors";

render(() => {
  const primaryColor = () => getUserCustomizationKey("primary_color");
  const primaryColorHEX = () => primaryColor()
    .split(",")
    .map(i => Number(i)) as [r: number, g: number, b: number];

  onMount(initializeNowRefresh);
  createEffect(() => {
    const root = document.querySelector(':root') as HTMLElement;
    root.style.setProperty('--custom-color', primaryColor());
  });

  return (
    <Router root={(props) =>
      <MetaProvider>
        <Meta name="theme-color" content={rgbToHex(...primaryColorHEX())} />

        <UpdaterModal />
        <LessonModal />

        <Suspense>{props.children}</Suspense>
      </MetaProvider>
    }>
      <FileRoutes />
    </Router>
  );
}, document.getElementById("root") as HTMLElement);

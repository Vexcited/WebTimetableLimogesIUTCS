import { DateTime } from "luxon";
import { createEffect, createMemo, createSignal, For, on, onMount, Show, type Component } from "solid-js";
import { now } from "~/stores/temporary";
import { getDayWeekNumber, getLatestWeekNumber, getTemporaryTimetablesStore, refreshTimetableForWeekNumber } from "~/stores/timetables";
import { ITimetableLesson } from "~/types/api";
import { APIError, APIErrorType } from "~/utils/errors";
import { getLessonGroup } from "~/utils/lessons";
import MdiCheck from '~icons/mdi/check'

const Page: Component = () => {
  // Signals for week numbers. We use `-1` as a default value, that should be handled as a loading state.
  // Whenever an error is thrown we keep the `-1` value and set the `error()` signal.
  const [currentWeekNumber, setCurrentWeekNumber] = createSignal(-1);
  const [isCurrentlyInVacation, setCurrentlyInVacation] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const currentWeekTimetableA1 = createMemo(() => getTemporaryTimetablesStore(1, currentWeekNumber()));
  const currentWeekTimetableA2 = createMemo(() => getTemporaryTimetablesStore(2, currentWeekNumber()));
  const currentWeekTimetableA3 = createMemo(() => getTemporaryTimetablesStore(3, currentWeekNumber()));

  const layout = {
    rdc: [
      "R46",
      "R52",
      "R51",
      "R50"
    ],
    roof1: [
      "103",
      "104",
      "105",
      "112",
      "111",
      "110",
      "109",
      "108"
    ],
    roof2: [
      "205",
      "206",
      "209",
      "208"
    ],
    theaters: [
      "AA",
      "AB",
      "AC",
    ]
  }

  const rooms = createMemo(on([currentWeekTimetableA1, currentWeekTimetableA2, currentWeekTimetableA3], (timetables) => {
    const rooms: Record<string, Array<ITimetableLesson>> = {
      // RDC
      "R46": [], // = R47 +> 60 seats
      "R52": [], // +> 30 seats
      "R51": [], // Windows PC / Labo +> 16 seats
      "R50": [], // +> 30 seats ; +> 15 computer seats

      // 1st roof
      "103": [], // +> 30 seats ; 14 computer seats
      "104": [], // +> 16 computer seats
      "105": [], // +> 14 computer seats
      "112": [], // +> 14 computer seats
      "111": [], // +> 14 computer seats
      "110": [],
      "109": [], // +> 8 computer seats
      "108": [], // +> 8 computer seats

      // 2nd roof
      "205": [], // +> 36 seats ; +> 16 computer seats
      "206": [], // +> 14 computer seats
      "209": [], // +> 30 seats
      "208": [], // +> 30 seats

      // Theaters
      "AA": [], // +> 163 seats
      "AB": [], // +> 157 seats
      "AC": [] // +> 120 seats
    };

    for (const timetable of timetables) {
      if (!timetable) continue;

      for (const lesson of timetable.lessons) {
        let room = lesson.content.room;
        const keys: Array<string> = [];

        if (room === ".")
          continue;

        if (room === "R47")
          room = "R46";

        if (room.includes("-")) {
          let [initial, extended] = room.split("-");
          keys.push(initial);

          const chars = initial.split("");
          for (let i = extended.length - 1, j = 1; i >= 0; i--, j++) {
            chars[chars.length - j] = extended[i];
          }

          keys.push(chars.join(""))
        }
        else keys.push(room)

        for (const room of keys) {
          if (room in rooms) {
            rooms[room].push(lesson);
          }
          else {
            rooms[room] = [lesson]
          }
        }
      }
    }

    return rooms;
  }));

  /**
   * Handles the current week number signal, and
   * also handles vacation weeks.
   *
   * @returns - Current week number or `-1` whenever an error has been thrown.
   * In that case, an error overlay should be displayed in the UI using the `error()` signal.
   */
  const refreshCurrentWeekNumber = async (): Promise<void> => {
    try {
      // Reset the vacation state.
      setCurrentlyInVacation(false);

      // We get the current week number using timetables meta.
      const currentWeekNumber = await getDayWeekNumber(now(), 1);

      // We don't await the refresh.
      refreshTimetableForWeekNumber(1, currentWeekNumber);
      refreshTimetableForWeekNumber(2, currentWeekNumber);
      refreshTimetableForWeekNumber(3, currentWeekNumber);

      // We set the current week number signal.
      setCurrentWeekNumber(currentWeekNumber);
    }
    catch (error) {
      if (error instanceof APIError) {
        // Whenever we don't find the current week in the timetables meta,
        // it means that we're in vacation.
        // When that's the case, we'll display the latest week as the current.
        if (error.type === APIErrorType.NOT_FOUND) {
          const currentWeekNumber = await getLatestWeekNumber(1);

          // We don't await the refresh.
          refreshTimetableForWeekNumber(1, currentWeekNumber);
          refreshTimetableForWeekNumber(2, currentWeekNumber);
          refreshTimetableForWeekNumber(3, currentWeekNumber);

          setCurrentlyInVacation(true);
          setCurrentWeekNumber(currentWeekNumber);
        }

        // Otherwise we don't have any cache so let's just let it die.
        setCurrentWeekNumber(-1);
        setError(error.message);
      }

      setCurrentWeekNumber(-1);
      console.error("unhandled:", error);
      setError("Erreur inconnue(2): voir la console.");
    }
  };

  // Let's refresh the current week number on page load
  // and select the current week by default.
  onMount(() => refreshCurrentWeekNumber());

  /**
   * Handle whenever the current week number changes
   * while we are in the app.
   *
   * Example: The app is opened Sunday at 23:59, and
   * the week changes to the next one. We'll update
   * the current week number.
   */
  let lastNow = now();
  createEffect(on(now, (now) => {
    if (now.weekNumber === lastNow.weekNumber) return;
    lastNow = now;

    refreshCurrentWeekNumber();
  }));

  const filtered = createMemo(() => {
    const filtered: Record<string, ITimetableLesson | undefined> = {};

    for (const key of Object.keys(rooms())) {
      const lesson = rooms()[key].find(lesson =>
        now().toMillis() >= DateTime.fromISO(lesson.start_date).toMillis()
        && now().toMillis() < DateTime.fromISO(lesson.end_date).toMillis()
      )

      filtered[key] = lesson;
    }

    return filtered;
  })

  const Room: Component<{
    name: string
    lesson?: ITimetableLesson
  }> = (props) => {
    const group = () => {
      let year: number;

      if (currentWeekTimetableA1()?.lessons.includes(props.lesson!)) {
        year = 1;
      }
      if (currentWeekTimetableA2()?.lessons.includes(props.lesson!)) {
        year = 2;
      }
      if (currentWeekTimetableA3()?.lessons.includes(props.lesson!)) {
        year = 3;
      }

      return getLessonGroup(props.lesson!, year!);
    }

    return (
      <div class="flex flex-col justify-between sm:max-w-170px h-105px w-full rd-lg px-4 py-3"
        classList={{
          "border border-red bg-red/5": !props.lesson,
          "border border-[rgb(140,140,140)] opacity-75": !!props.lesson
        }}
      >
        <p class="text-2xl font-bold">
          {props.name}
        </p>

        <Show when={props.lesson} fallback={
          <p class="text-red flex items-center gap-2"><MdiCheck/> Disponible</p>
        }>
          {lesson => (
            <div>
              <p>Prise par {group()}</p>
              <p class="text-sm text-[rgb(120,120,120)]">{lesson().type} avec {lesson().content.teacher}</p>

            </div>
          )}
        </Show>
      </div>
    )
  };

  const Floor: Component<{
    label: string
    layout: keyof typeof layout
  }> = (props) => (
    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-bold uppercase italic text-center">{props.label}</h2>
      <div class="flex justify-center flex-wrap gap-6">
        <For each={layout[props.layout]}>
          {(room) => <Room name={room} lesson={filtered()[room]} />}
        </For>
      </div>
    </section>
  );

  return (
    <main class="p-8">
      <div class="flex flex-col gap-8 max-w-895px w-full mx-auto">
        <Floor label="Rez-de-chaussée" layout="rdc" />
        <Floor label="1er Étage" layout="roof1" />
        <Floor label="2ème Étage" layout="roof2" />
        <Floor label="Amphithéâtres" layout="theaters" />
      </div>

    </main>
  )
}
export default Page

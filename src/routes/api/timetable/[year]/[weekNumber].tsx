import { TimetableYear } from "unilim/iut/cs/timetable";

import {
  connectDatabase,
  getCachedEntries,
  getCachedTimetable,
  getEntryAsIs
} from "~/database";

import type { ITimetable } from "~/types/api";
import { api } from "satone/server";
import { t } from "elysia";

export const server = api((app, path) =>
  app.get(path, async ({ params: { year, weekNumber }, query: { asIs }, status }) => {
    const entries = await getCachedEntries(year);

    const timetable_entry = entries.find(entry => entry.weekNumber === weekNumber);
    if (!timetable_entry) {
      return status(404, {
        success: false,
        message: "Timetable not found, are you sure this week has been published?"
      })
    }

    let timetable: ITimetable;

    if (asIs) {
      timetable = await getEntryAsIs(timetable_entry);
    }
    else {
      await connectDatabase();
      timetable = await getCachedTimetable(timetable_entry);
    }

    return {
      success: true,
      data: timetable
    }
  }, {
    params: t.Object({
      year: t.Enum(TimetableYear),
      weekNumber: t.Number({ minimum: 1, maximum: 52 }),
    }),
    query: t.Object({
      asIs: t.Optional(t.Boolean())
    })
  })
);

import { TimetableYear } from "unilim/iut/cs/timetable";
import type { ApiTimetableMeta } from "~/types/api";

import {
  connectDatabase,
  getCachedEntries,
  getCachedTimetable
} from "~/database";
import { api } from "satone/server";
import { t } from "elysia";

export const server = api((app, path) =>
  app.get(path, async ({ params: { year } }) => {
    const entries = await getCachedEntries(year);

    await connectDatabase();
    const timetables = await Promise.all(entries.map(
      entry => getCachedTimetable(entry)
    ));

    const metadataOfTimetables: ApiTimetableMeta["data"] = timetables.map(
      timetable => ({
        ...timetable.header,
        last_update: timetable.last_update
      })
    );

    return {
      success: true,
      data: metadataOfTimetables
    };
  }, {
    params: t.Object({
      year: t.Enum(TimetableYear),
    })
  })
);

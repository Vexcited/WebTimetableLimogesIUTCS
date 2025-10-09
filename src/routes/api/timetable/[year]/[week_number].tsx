import { type APIEvent } from "@solidjs/start/server";
import { TimetableYear } from "unilim/iut/cs/timetable";
import { jsonWithCors } from "~/utils/cors";

import {
  connectDatabase,
  getCachedEntries,
  getCachedTimetable,
  getEntryAsIs
} from "~/database";

import type { ITimetable } from "~/types/api";

export const GET = async ({ params, request }: APIEvent) => {
  const year = params.year as TimetableYear;
  const asIs = new URL(request.url).searchParams.has("asIs");

  if (Object.values(TimetableYear).indexOf(year) === -1) {
    return jsonWithCors({
      success: false,
      message: "Invalid year."
    }, 400);
  }

  const week_number = parseInt(params.week_number);

  if (isNaN(week_number) || week_number < 1 || week_number > 52) {
    return jsonWithCors({
      success: false,
      message: "Invalid week number."
    }, 400);
  }

  const entries = await getCachedEntries(year);

  const timetable_entry = entries.find(entry => entry.weekNumber === week_number);
  if (!timetable_entry) {
    return jsonWithCors({
      success: false,
      message: "Timetable not found."
    }, 404);
  }

  let timetable: ITimetable;

  if (asIs) {
    timetable = await getEntryAsIs(timetable_entry);
  }
  else {
    await connectDatabase();
    timetable = await getCachedTimetable(timetable_entry);
  }

  return jsonWithCors({
    success: true,
    data: timetable
  }, 200);
};

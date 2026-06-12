import {
  selectMeetingMinuteByDate,
  selectPublicCurrentMeetingMinute,
  sortMeetingMinutesByDate,
} from "@/app/reunion-sacramental/selectMeetingMinute";
import type { MeetingMinute } from "@/components/meeting-minutes/MeetingMinuteView";

const minute = (date: string, id = date): MeetingMinute => ({ id, date });

describe("selectMeetingMinuteByDate", () => {
  it("sorts minutes by parsed DD-MM-YYYY date in ascending order", () => {
    const sortedMinutes = sortMeetingMinutesByDate([
      minute("14-06-2026"),
      minute("31-05-2026"),
      minute("07-06-2026"),
    ]);

    expect(sortedMinutes.map((currentMinute) => currentMinute.date)).toEqual([
      "31-05-2026",
      "07-06-2026",
      "14-06-2026",
    ]);
  });

  it("handles dates with surrounding spaces when sorting", () => {
    const sortedMinutes = sortMeetingMinutesByDate([
      minute(" 14-06-2026 "),
      minute("07-06-2026"),
    ]);

    expect(sortedMinutes.map((currentMinute) => currentMinute.date)).toEqual([
      "07-06-2026",
      " 14-06-2026 ",
    ]);
  });

  it("keeps the current Sunday minute before 13:00 in Buenos Aires", () => {
    const selectedMinute = selectMeetingMinuteByDate(
      [minute("07-06-2026"), minute("14-06-2026")],
      new Date("2026-06-07T15:59:59.000Z")
    );

    expect(selectedMinute?.date).toBe("07-06-2026");
  });

  it("selects the next available future minute after 13:00 in Buenos Aires", () => {
    const selectedMinute = selectMeetingMinuteByDate(
      [minute("07-06-2026"), minute("14-06-2026")],
      new Date("2026-06-07T16:00:00.000Z")
    );

    expect(selectedMinute?.date).toBe("14-06-2026");
  });

  it("falls back to the latest available minute when there is no future minute", () => {
    const selectedMinute = selectMeetingMinuteByDate(
      [minute("31-05-2026"), minute("07-06-2026")],
      new Date("2026-06-07T16:00:00.000Z")
    );

    expect(selectedMinute?.date).toBe("07-06-2026");
  });

  it("does not return an expired minute for the public-current endpoint behavior", () => {
    const selectedMinute = selectPublicCurrentMeetingMinute(
      [minute("31-05-2026"), minute("07-06-2026")],
      new Date("2026-06-07T16:00:00.000Z")
    );

    expect(selectedMinute).toBeNull();
  });
});

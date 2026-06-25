import { APP_TIME_ZONE } from "@/lib/constants";

export function getTodayDateString(timeZone = APP_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function addDaysToDateString(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateBR(dateString: string | null | undefined) {
  if (!dateString) {
    return "-";
  }

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

export function getDateRangeForLocalDay(dateString: string) {
  const nextDay = addDaysToDateString(dateString, 1);

  return {
    start: `${dateString} 00:00:00`,
    end: `${nextDay} 00:00:00`
  };
}

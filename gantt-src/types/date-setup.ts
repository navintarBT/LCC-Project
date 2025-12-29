import { ViewMode } from "./public-types";

export interface DateSetup {
  filter(arg0: (date: number) => boolean): Date[];
  dates: Date[];
  viewMode: ViewMode;
}

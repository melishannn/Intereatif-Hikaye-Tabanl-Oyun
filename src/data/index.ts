import { EVENTS as roomEvents } from "./events/room";
import { EVENTS as commonEvents } from "./events/common";
import { EVENTS as vocalEvents } from "./events/vocal";
import { EVENTS as danceEvents } from "./events/dance";
import { EVENTS as interviewEvents } from "./events/interview";
import { EVENTS as stageEvents } from "./events/stage";
import { LocationId, GameEvent } from "../types";

export * from "./constants";
export * from "./quotes";

export const EVENTS: Partial<Record<LocationId, GameEvent[]>> = {
  room: roomEvents,
  common: commonEvents,
  vocal: vocalEvents,
  dance: danceEvents,
  interview: interviewEvents,
  stage: stageEvents,
};

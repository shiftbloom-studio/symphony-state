import type {
  Conductor,
  DerivedSectionDefinition,
  Scheduler,
  SectionDefinition
} from "../core/types";
import { createConductor } from "../core/conductor";
import { SymphonyProvider } from "./SymphonyProvider";
import { useSection, useSelector } from "./hooks";

type AnySectionDefinition =
  | SectionDefinition<unknown>
  | DerivedSectionDefinition<unknown>;

type SectionValues<Sections extends Record<string, AnySectionDefinition>> = {
  [K in keyof Sections]: Sections[K] extends SectionDefinition<infer T>
    ? T
    : Sections[K] extends DerivedSectionDefinition<infer T>
      ? T
      : never;
};

export type CreateSymphonyConfig<Sections extends Record<string, AnySectionDefinition>> = {
  sections: Sections;
  scheduler?: Scheduler;
  bootstrap?: Record<string, unknown> | (() => Record<string, unknown> | undefined);
};

export type SymphonyInstance<Sections extends Record<string, AnySectionDefinition>> = {
  conductor: Conductor;
  Provider: typeof SymphonyProvider;
  useSection: <K extends keyof Sections>(
    key: K
  ) => ReturnType<typeof useSection<SectionValues<Sections>[K]>>;
  useSelector: <K extends keyof Sections, S>(
    key: K,
    selector: (value: SectionValues<Sections>[K]) => S,
    equality?: (a: S, b: S) => boolean
  ) => S;
};

export const createSymphony = <
  Sections extends Record<string, AnySectionDefinition>
>(
  config: CreateSymphonyConfig<Sections>
): SymphonyInstance<Sections> => {
  const sectionEntries = Object.values(config.sections);
  const sections: SectionDefinition<any>[] = [];
  const derived: DerivedSectionDefinition<any>[] = [];

  for (const entry of sectionEntries) {
    if ("source" in entry) {
      sections.push(entry as SectionDefinition<unknown>);
    } else {
      derived.push(entry as DerivedSectionDefinition<unknown>);
    }
  }

  const conductor = createConductor({
    sections,
    derived,
    scheduler: config.scheduler,
    bootstrap: config.bootstrap
  });

  return {
    conductor,
    Provider: SymphonyProvider,
    useSection: (key) => useSection(String(key)),
    useSelector: (key, selector, equality) =>
      useSelector(String(key), selector, equality)
  };
};

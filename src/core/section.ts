// SPDX-License-Identifier: AGPL-3.0-or-later
import type { DerivedSectionDefinition, PersistConfig, SectionDefinition } from "./types";

export const defineSection = <T>(definition: SectionDefinition<T>) => definition;

export const defineDerivedSection = <T>(definition: DerivedSectionDefinition<T>) => definition;

export const createStorageSink = <T>(options: PersistConfig<T>) => options;

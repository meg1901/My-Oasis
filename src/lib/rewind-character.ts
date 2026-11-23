import type { Profile } from "./types";

export type CharacterAppearance = "male" | "female";

/** Explicit preferences take priority over gender; demo films always retain Ansh. */
export function resolveCharacter(profile: Pick<Profile, "gender" | "character_preference">, demo = false): CharacterAppearance {
  if (demo) return "male";
  if (profile.character_preference === "male" || profile.character_preference === "female") return profile.character_preference;
  return /^(woman|female)$/i.test(profile.gender ?? "") ? "female" : "male";
}
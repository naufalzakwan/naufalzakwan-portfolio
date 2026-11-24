import { aboutStories } from "@/data/personal-storytelling";

import { MemoriesIntro, MemoriesStory } from "./memories-story";
import { MemoriesOpening } from "./memories-opening";
import { HometownStory } from "./hometown-story";
import { FamilyStory } from "./family-story";
import { PiscesStory } from "./pisces-story";
import styles from "./storytelling.module.css";
import journeyStyles from "./story-journey.module.css";

export function AboutStories() {
  return (
    <div className={styles.stories} data-story-group="about">
      {aboutStories.map((story) => story.id === "hometown"
        ? <HometownStory key={story.id} />
        : <FamilyStory key={story.id} />)}
    </div>
  );
}

export function BeyondStories() {
  return (
    <div className={styles.stories} data-story-group="beyond">
      <div className={journeyStyles.journey} data-story-journey id="zodiak-saya">
        <div className={journeyStyles.viewport} data-journey-viewport>
          <div className={journeyStyles.track} data-journey-track>
            <PiscesStory />
          </div>
          <MemoriesOpening />
          <MemoriesIntro />
          <MemoriesStory shared />
        </div>
      </div>
    </div>
  );
}

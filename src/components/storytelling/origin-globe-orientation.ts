import { originRotation } from "@/data/origin-globe";
import { originCamera } from "./origin-globe-projection";

export type OriginOrientation = {
  longitude: number;
  latitude: number;
  mode: "empty" | "auto" | "scroll" | "locked";
};

// The only writer of the rendered orientation. GSAP supplies progress, never
// a second rotation tween. Longitude remains unwrapped through mode changes.
export class OriginOrientationController {
  private previousProgress = 0;
  private autoOffset = 0;
  private handoff: { turn: number; longitude: number; tangent: number } | null = null;
  private orientation: OriginOrientation = { longitude: -45, latitude: 18, mode: "empty" };

  advance(progress: number, deltaSeconds: number): Readonly<OriginOrientation> {
    const camera = originCamera(progress);
    const { revealStart, takeOver, settleAt, degreesPerSecond } = originRotation;
    if (progress <= revealStart) {
      this.autoOffset = 0; this.handoff = null;
      this.orientation.longitude = camera.longitude;
      this.orientation.mode = "empty";
    } else if (progress < takeOver) {
      if (this.handoff) {
        // Scrolling back reaches exactly the captured exploration orientation.
        this.autoOffset = this.handoff.longitude - originCamera(takeOver).longitude;
        this.handoff = null;
      }
      this.autoOffset += Math.max(0, Math.min(.1, deltaSeconds)) * degreesPerSecond;
      this.orientation.longitude = camera.longitude + this.autoOffset;
      this.orientation.mode = "auto";
    } else {
      if (!this.handoff) {
        const boundary = originCamera(takeOver);
        // Continue the last actual angle to the crossing point, including all
        // accumulated idle rotation. A fast scroll can cross it in one frame.
        const actual = this.previousProgress > revealStart && this.previousProgress < takeOver
          ? this.orientation.longitude + boundary.longitude - originCamera(this.previousProgress).longitude
          : boundary.longitude + this.autoOffset;
        const target = originCamera(settleAt).longitude;
        // Pick the equivalent target on the nearest turn, avoiding a 360° chase.
        const turn = 360 * Math.round((actual - target) / 360);
        const travel = target + turn - actual;
        const slope = (originCamera(takeOver + .0001).longitude - originCamera(takeOver - .0001).longitude) / .0002;
        // Preserve forward scroll velocity where possible, but constrain the
        // tangent so a short handoff cannot overshoot and swivel back.
        const tangent = travel > 0 ? Math.min(slope * (settleAt - takeOver), 3 * travel) : 0;
        this.handoff = { turn, longitude: actual, tangent };
      }
      const fraction = Math.max(0, Math.min(1, (progress - takeOver) / (settleAt - takeOver)));
      const blend = fraction * fraction * (3 - 2 * fraction);
      const target = originCamera(settleAt).longitude + this.handoff.turn;
      this.orientation.longitude = progress < settleAt
        ? this.handoff.longitude * (1 - blend) + target * blend
          + this.handoff.tangent * fraction * (1 - fraction) ** 2
        : camera.longitude + this.handoff.turn;
      this.orientation.mode = progress >= .94 ? "locked" : "scroll";
    }
    this.orientation.latitude = camera.latitude;
    this.previousProgress = progress;
    return this.orientation;
  }
}

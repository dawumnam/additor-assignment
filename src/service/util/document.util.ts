import Delta from "quill-delta";
import { plainTextDeltaToString } from "../../util/util";

interface HandleUpdateRes {
  content: string;
  invertedDelta: Delta;
}

export const handleUpdateToLatestVersion = (
  latestDocDelta: Delta,
  delta: Delta
): HandleUpdateRes => {
  const newDocDelta = latestDocDelta.compose(delta);
  const newDocContent = plainTextDeltaToString(newDocDelta);
  const inverted = delta.invert(latestDocDelta);

  return {
    content: newDocContent,
    invertedDelta: inverted,
  };
};

export const handleUpdateToPreviousVersion = (
  latestDocDelta: Delta,
  currLatestVer: number,
  version: number,
  delta: Delta,
  changes: Record<number, string>
): HandleUpdateRes => {
  let tempDelta = new Delta();
  Object.assign(tempDelta, latestDocDelta);

  for (let i = currLatestVer - 1; i >= version; i--) {
    const change = changes[i];
    const changeDelta = new Delta(JSON.parse(change));
    tempDelta = tempDelta.compose(changeDelta);
  }

  const diff = tempDelta.diff(latestDocDelta);
  const transform = diff.transform(delta, false);
  const newDocDelta = latestDocDelta.compose(transform);
  const newDocContent = plainTextDeltaToString(newDocDelta);

  const inverted = latestDocDelta.diff(newDocDelta).invert(latestDocDelta);
  return { content: newDocContent, invertedDelta: inverted };
};

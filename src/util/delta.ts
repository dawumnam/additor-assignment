import Delta from "quill-delta";
import { isDeletionLength, isInsertion } from "./util";

export const createDelta = (
  index: number,
  insertion: string | undefined,
  deletionLength: number | undefined
): Delta => {
  const delta = new Delta();

  if (isInsertion(insertion)) {
    delta.retain(index).insert(insertion);
  }

  if (isDeletionLength(deletionLength)) {
    delta.retain(index).delete(deletionLength);
  }

  return delta;
};

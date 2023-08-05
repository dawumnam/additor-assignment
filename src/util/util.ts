import Delta from "quill-delta";

export const plainTextDeltaToString = (delta: Delta): string => {
  const ops = delta.ops;
  let str = "";
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (typeof op.insert === "string") {
      str += op.insert;
    }
  }
  return str;
};
export const stringToPlainTextDelta = (str: string): Delta => {
  return new Delta().insert(str);
};

export const isDeletionLength = (
  deletionLength: number | undefined
): deletionLength is number => {
  return deletionLength !== undefined && deletionLength >= 0;
};

export const isInsertion = (
  insertion: string | undefined
): insertion is string => {
  return insertion !== undefined && insertion.length >= 0;
};

export interface ContentProvider {
  id: string;
  label: string;
  contentType: string;
  supportsImages: boolean;
  matches: (c: unknown) => boolean;
  toMarkdown: (
    content: unknown,
    ctx: ReadCtx,
  ) => Promise<{ markdown: string; lost: string[] }>;
  fromMarkdown: (markdown: string, ctx: WriteCtx) => unknown;
}

export interface ReadCtx {
  fetchBlob: (ref: unknown) => Promise<Uint8Array>;
}

export interface WriteCtx {
  previousContent: unknown;
  uploadedImages?: Map<string, HarvestedImage>;
}

export interface HarvestedImage {
  ref: any; // Simplified for this context, relying on actual implementation
  owner: Record<string, unknown>;
}

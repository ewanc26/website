export interface OgImageOptions {
  title: string;
  subtitle?: string;
  metaLine?: string;
  author?: {
    name?: string;
    handle?: string;
    did?: string;
    avatar?: string;
  };
  extraMeta?: (string | Date)[];
  banner?: string;
  customChildren?: any;
}

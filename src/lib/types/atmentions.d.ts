declare module "atmentions" {
  export interface ReactionSubjects {
    url?: string;
    aturi?: string;
    bsky?: string;
  }

  export interface ReactionGroup {
    type: string;
    icon: string;
    count: number;
    label: string;
    verb: string;
    app: string;
    appId: string;
    collection: string;
    path: string;
    subjectKind: string;
  }

  export interface ReactionResult {
    total: number;
    groups: ReactionGroup[];
    errors: Array<{ target: string; message: string }>;
  }

  export interface Reactor {
    did: string;
    recordUri: string;
    handle: string;
    displayName: string;
    avatar: string;
  }

  export interface FetchReactionsOptions {
    indexEndpoint?: string;
    appview?: string;
    userAgent?: string;
    fetchImpl?: typeof fetch;
  }

  export function fetchReactions(
    subjects: ReactionSubjects,
    opts?: FetchReactionsOptions,
  ): Promise<ReactionResult>;

  export function resolveReactors(
    group: ReactionGroup,
    subjects: ReactionSubjects,
    opts?: FetchReactionsOptions,
  ): Promise<Reactor[]>;

  export function mount(
    el: HTMLElement,
    opts?: FetchReactionsOptions,
  ): Promise<void>;

  export function register(): void;

  export const DEFAULTS: {
    indexEndpoint: string;
    appview: string;
    userAgent: string;
  };
}

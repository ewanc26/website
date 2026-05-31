export type KibunStatusData = {
    emoji: string;
    text: string;
    createdAt: string;
};

export type BlogPost = {
    title: string;
    content?: string;
    textContent?: string;
    createdAt: string;
    publicationRkey: string;
    rkey: string;
    url: string;
};

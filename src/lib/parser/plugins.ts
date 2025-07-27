import type { Node, Root, Element, Plugin } from "./types";

// Automatically enforce https on PDS images. Heavily inspired by WhiteWind's blob replacer:
// https://github.com/whtwnd/whitewind-blog/blob/7eb8d4623eea617fd562b93d66a0e235323a2f9a/frontend/src/services/DocProvider.tsx#L90
// In theory we could also use their cache, but I'd like to rely on their API as little as possible, opting to pull from the PDS instead.
const upgradeImage = (child: Node): void => {
  if (child.type !== "element") {
    return;
  }
  const elem = child as Element;
  if (elem.tagName === "img") {
    // Ensure https
    const src = elem.properties.src;
    if (src !== undefined && typeof src === "string") {
      elem.properties.src = src.replace(/http:\/\//, "https://");
    }
  }
  elem.children.forEach((child) => upgradeImage(child));
};

export const rehypeUpgradeImage: Plugin<[], Root, Node> = () => {
  return (tree) => {
    tree.children.forEach((child) => upgradeImage(child));
  };
};
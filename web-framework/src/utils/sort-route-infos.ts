import { RouteInfo } from "../types";

export function sortRouteInfos(routeInfos: RouteInfo[]) {
  function getPathScore(p: string) {
    let sum = 0;

    p.split("/").forEach((x) => {
      if (x.startsWith(":")) {
        sum += 100;
      }

      sum += x.length > 0 ? 10 : 0;
    });

    return sum;
  }

  const sortedRouteInfos = routeInfos.sort((a, b) => {
    const s1 = getPathScore(a.path);
    const s2 = getPathScore(b.path);

    if (s1 === s2) {
      return a.path < b.path ? -1 : 1;
    }

    return s1 - s2;
  });

  return sortedRouteInfos;
}

import type { NewsItem } from "common/types";
import create from "zustand";
import { combine } from "zustand/middleware";

export const useNewsFeed = create(
  combine(
    {
      error: null as any,
      fetching: false,
      newsItems: [] as NewsItem[],
    },
    (set) => ({
      update: () => {
        console.log("Fetching news articles...");
        set({ fetching: true });

        window.electron.common
          .fetchNewsFeed()
          .then((newsItems) => {
            set({ newsItems });
          })
          .catch((err) => {
            set({ error: err });
          })
          .finally(() => {
            set({ fetching: false });
          });
      },
    }),
  ),
);

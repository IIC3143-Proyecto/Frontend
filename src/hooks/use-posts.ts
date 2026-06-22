import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getPostsBySeller } from "@/lib/api/post";
import type { PostDto } from "@/lib/types/post";

const byNewest = (a: PostDto, b: PostDto) =>
  (b.createdAtUtcMinus3 ?? "").localeCompare(a.createdAtUtcMinus3 ?? "");

export const usePosts = (sellerId: string) =>
  useQuery({
    queryKey: ["posts", sellerId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getPostsBySeller(sellerId, accessToken);
    },
    select: (posts) => [...posts].sort(byNewest),
    enabled: !!sellerId,
  });

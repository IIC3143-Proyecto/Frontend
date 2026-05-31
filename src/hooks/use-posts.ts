import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getPostsBySeller } from "@/lib/api/post";

export const usePosts = (sellerId: string) =>
  useQuery({
    queryKey: ["posts", sellerId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getPostsBySeller(sellerId, accessToken);
    },
    enabled: !!sellerId,
  });

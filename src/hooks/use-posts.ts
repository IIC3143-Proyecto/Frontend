import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api/post";

export const usePosts = () =>
  useQuery({ queryKey: ["posts"], queryFn: getPosts });

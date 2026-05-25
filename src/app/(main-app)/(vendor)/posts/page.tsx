import { Plus } from "lucide-react";
import { PostsList } from "@/components/vendor/posts-list";

export default function PostsPage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-black uppercase text-lg tracking-wider">
        Mis Publicaciones
      </h1>

      <PostsList />

      <button
        type="button"
        aria-label="Nueva publicación"
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full cursor-pointer items-center z-50 p-3"
      >
        <Plus className="w-6 h-6 md:w-10 md:h-10" />
      </button>
    </div>
  );
}

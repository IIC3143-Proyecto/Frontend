"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFeed, useSearchByTags } from "@/hooks/use-feed";
import { useCreateInteraction, useRemoveInteraction } from "@/hooks/use-interaction";
import { useSellerRating } from "@/hooks/use-seller-rating";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { useFeedNavigation } from "@/hooks/use-feed-navigation";
import { fetchTags } from "@/lib/api/tag";
import { fetchPostTags } from "@/lib/api/post";
import { getAccessToken } from "@/actions/auth";
import type { PostDto } from "@/lib/types/post";
import type { TagCategories } from "@/lib/types/tag";

const AVAILABLE_TAGS = [
  "Abrigo", "Invierno", "Nuevo", "Femenino",
  "Polera", "Nike", "Casual",
  "Pantalón", "Azul", "M", "Casi nuevo",
  "Adidas", "Deportivo",
  "Falda", "Chaqueta", "Denim", "XL", "Vintage", "Negro",
  "Shorts", "Verde", "Bolso", "Cuero",
];

function JsonBox({ data }: { data: unknown }) {
  return (
    <pre className="mt-2 max-h-64 overflow-auto rounded bg-zinc-900 p-3 text-xs text-green-400">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-700 p-4">
      <h2 className="mb-3 font-mono text-sm font-bold text-zinc-300">{title}</h2>
      {children}
    </section>
  );
}

function PostCard({ post }: { post: PostDto }) {
  return (
    <div className="rounded border border-zinc-600 p-2 text-xs">
      <p className="font-semibold text-white">{post.title}</p>
      <p className="text-zinc-400">${post.priceClp.toLocaleString("es-CL")} CLP</p>
      <p className="text-zinc-500">ID: {post.id}</p>
    </div>
  );
}

// ─── Sección 1: Feed ─────────────────────────────────────────────────────────
function FeedSection() {
  const { data, isFetching, error, refetch } = useFeed(20, false);

  return (
    <Section title="1. GET /api/post/feed">
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
      >
        {isFetching ? "Cargando…" : data ? "Recargar feed" : "Cargar feed (20 posts)"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{String(error)}</p>}
      {data && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {data.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </Section>
  );
}

// ─── Sección 2: Buscar por tags ───────────────────────────────────────────────
function SearchSection() {
  const [selected, setSelected] = useState<string[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const { data, isLoading, error } = useSearchByTags(applied);

  function toggle(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <Section title="2. GET /api/post/search?tags=…">
      <div className="flex flex-wrap gap-1">
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`rounded px-2 py-0.5 text-xs ${
              selected.includes(tag)
                ? "bg-blue-600 text-white"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <button
        onClick={() => setApplied(selected)}
        disabled={selected.length === 0}
        className="mt-2 rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
      >
        Aplicar filtros ({selected.length} seleccionados)
      </button>
      {isLoading && <p className="mt-2 text-xs text-zinc-400">Buscando…</p>}
      {error && <p className="mt-2 text-xs text-red-400">{String(error)}</p>}
      {data && (
        <div className="mt-2">
          <p className="text-xs text-zinc-400">{data.length} resultado(s)</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {data.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Sección 3: Like / Unlike ─────────────────────────────────────────────────
function LikeSection() {
  const [postId, setPostId] = useState("feed_1");
  const [result, setResult] = useState<Record<string, unknown>>({ estado: "sin resultado aún" });
  const create = useCreateInteraction();
  const remove = useRemoveInteraction();

  async function handle(action: "like" | "unlike") {
    try {
      if (action === "like") {
        await create.mutateAsync({ postId, type: "Liked" });
        setResult({ ok: true, action: "Liked creado" });
      } else {
        await remove.mutateAsync({ postId, type: "Liked" });
        setResult({ ok: true, action: "Like eliminado" });
      }
    } catch (err) {
      setResult({ error: String(err) });
    }
  }

  return (
    <Section title="3. POST/DELETE /api/interaction/:id_post — Like">
      <input
        value={postId}
        onChange={(e) => setPostId(e.target.value)}
        placeholder="postId"
        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => handle("like")}
          className="rounded bg-green-700 px-3 py-1 text-xs text-white hover:bg-green-600"
        >
          👍 Like
        </button>
        <button
          onClick={() => handle("unlike")}
          className="rounded bg-red-700 px-3 py-1 text-xs text-white hover:bg-red-600"
        >
          ✕ Unlike
        </button>
      </div>
      <JsonBox data={result} />
    </Section>
  );
}

// ─── Sección 4: Guardar / Quitar guardado ─────────────────────────────────────
function SaveSection() {
  const [postId, setPostId] = useState("feed_2");
  const [result, setResult] = useState<Record<string, unknown>>({ estado: "sin resultado aún" });
  const create = useCreateInteraction();
  const remove = useRemoveInteraction();

  async function handle(action: "save" | "unsave") {
    try {
      if (action === "save") {
        await create.mutateAsync({ postId, type: "Saved" });
        setResult({ ok: true, action: "Saved creado" });
      } else {
        await remove.mutateAsync({ postId, type: "Saved" });
        setResult({ ok: true, action: "Saved eliminado" });
      }
    } catch (err) {
      setResult({ error: String(err) });
    }
  }

  return (
    <Section title="4. POST/DELETE /api/interaction/:id_post — Guardar">
      <input
        value={postId}
        onChange={(e) => setPostId(e.target.value)}
        placeholder="postId"
        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => handle("save")}
          className="rounded bg-yellow-700 px-3 py-1 text-xs text-white hover:bg-yellow-600"
        >
          🔖 Guardar
        </button>
        <button
          onClick={() => handle("unsave")}
          className="rounded bg-zinc-600 px-3 py-1 text-xs text-white hover:bg-zinc-500"
        >
          ✕ Quitar guardado
        </button>
      </div>
      <JsonBox data={result} />
    </Section>
  );
}

// ─── Sección 5: Navegación del feed (dislike / retroceder) ───────────────────
function NavigationSection() {
  const { data: posts } = useFeed(8);
  const { currentIndex, canGoBack, history, advance, goBack } = useFeedNavigation();
  const create = useCreateInteraction();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const post = posts?.[currentIndex];

  async function handleAction(type: "Liked" | "Saved" | null) {
    if (!post) return;
    if (type) {
      try {
        await create.mutateAsync({ postId: post.id, type });
        setLastResult(`${type} en "${post.title}"`);
      } catch {
        setLastResult(`Error al registrar ${type}`);
      }
    } else {
      setLastResult(`Skip en "${post.title}"`);
    }
    advance(post.id, type);
  }

  async function handleBack() {
    setLastResult("Deshaciendo interacción anterior…");
    await goBack();
    setLastResult("Retrocedido");
  }

  return (
    <Section title="5. Navegación feed: dislike/skip + retroceder">
      {!posts && <p className="text-xs text-zinc-400">Cargando posts…</p>}
      {post && (
        <div className="rounded border border-zinc-600 bg-zinc-800 p-3">
          <p className="text-xs text-zinc-500">Post {currentIndex + 1} / {posts?.length}</p>
          <p className="font-semibold text-white">{post.title}</p>
          <p className="text-xs text-zinc-400">${post.priceClp.toLocaleString("es-CL")} · ID: {post.id}</p>
        </div>
      )}
      {!post && posts && (
        <p className="text-xs text-zinc-400">No hay más posts en el feed.</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="rounded bg-zinc-600 px-3 py-1 text-xs text-white hover:bg-zinc-500 disabled:opacity-40"
        >
          ← Retroceder
        </button>
        <button
          onClick={() => handleAction("Liked")}
          disabled={!post}
          className="rounded bg-green-700 px-3 py-1 text-xs text-white hover:bg-green-600 disabled:opacity-40"
        >
          👍 Like + avanzar
        </button>
        <button
          onClick={() => handleAction("Saved")}
          disabled={!post}
          className="rounded bg-yellow-700 px-3 py-1 text-xs text-white hover:bg-yellow-600 disabled:opacity-40"
        >
          🔖 Guardar + avanzar
        </button>
        <button
          onClick={() => handleAction(null)}
          disabled={!post}
          className="rounded bg-red-800 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-40"
        >
          👎 Dislike / Skip
        </button>
      </div>
      {lastResult && <p className="mt-2 text-xs text-zinc-400">{lastResult}</p>}
      {history.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-zinc-500">Historial:</p>
          <JsonBox data={history} />
        </div>
      )}
    </Section>
  );
}

// ─── Sección 6: Hacer oferta ──────────────────────────────────────────────────
function OfferSection() {
  const [postId, setPostId] = useState("feed_1");
  const [price, setPrice] = useState("15000");
  const [comment, setComment] = useState("");
  const [result, setResult] = useState<Record<string, unknown>>({ estado: "sin resultado aún" });
  const createOffer = useCreateOffer();

  async function handle() {
    try {
      await createOffer.mutateAsync({
        postId,
        priceClp: parseInt(price, 10),
        comment: comment || undefined,
      });
      setResult({ ok: true, action: "Oferta enviada" });
    } catch (err) {
      setResult({ error: String(err) });
    }
  }

  return (
    <Section title="6. POST /api/offer">
      <div className="flex flex-col gap-2">
        <input
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder="postId"
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio (CLP, mín 1000)"
          type="number"
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
        />
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentario (opcional)"
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
        />
      </div>
      <button
        onClick={handle}
        disabled={createOffer.isPending}
        className="mt-2 rounded bg-purple-700 px-3 py-1 text-xs text-white hover:bg-purple-600 disabled:opacity-40"
      >
        Enviar oferta
      </button>
      <JsonBox data={result} />
    </Section>
  );
}

// ─── Sección 7: Rating del vendedor ───────────────────────────────────────────
function SellerRatingSection() {
  const [sellerId, setSellerId] = useState("seller-mock-1");
  const [queryId, setQueryId] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useSellerRating(queryId);

  return (
    <Section title="7. GET /api/seller/rating/:id_seller">
      <div className="flex gap-2">
        <input
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          placeholder="sellerId"
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
        />
        <button
          onClick={() => setQueryId(sellerId)}
          className="rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-600"
        >
          Consultar
        </button>
      </div>
      {isLoading && <p className="mt-2 text-xs text-zinc-400">Cargando…</p>}
      {error && <p className="mt-2 text-xs text-red-400">{String(error)}</p>}
      {data && (
        <div className="mt-2 text-xs text-white">
          <p>⭐ Score: <strong>{data.score}</strong> / 5</p>
          <p>🏅 Tier: <strong>{data.tier}</strong></p>
          <p>📊 Calificado {data.timesRated} veces</p>
        </div>
      )}
      <JsonBox data={data ?? { estado: "sin resultado aún" }} />
    </Section>
  );
}

// ─── Sección 8: Ver fotos del post ────────────────────────────────────────────
function PhotosSection() {
  const [postId, setPostId] = useState("feed_3");
  const [queryId, setQueryId] = useState<string | undefined>(undefined);
  const { data: posts } = useFeed(8);

  const post = queryId ? posts?.find((p) => p.id === queryId) : undefined;
  const images = post?.imagesUrls
    ? post.imagesUrls.split(",").map((u) => u.trim()).filter(Boolean)
    : [];

  return (
    <Section title="8. Fotos del post (imagesUrls de PostDto)">
      <div className="flex gap-2">
        <input
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder="postId del feed (ej: feed_3)"
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
        />
        <button
          onClick={() => setQueryId(postId)}
          className="rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-600"
        >
          Ver fotos
        </button>
      </div>
      {queryId && !post && (
        <p className="mt-2 text-xs text-zinc-400">
          Post no encontrado en el feed cargado. Carga primero el feed (sección 1).
        </p>
      )}
      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Foto ${i + 1}`}
              className="h-32 w-24 rounded object-cover"
            />
          ))}
        </div>
      )}
      {post && images.length === 0 && (
        <p className="mt-2 text-xs text-zinc-400">Este post no tiene fotos.</p>
      )}
    </Section>
  );
}

// ─── Sección 9: Info + tags de un post específico ────────────────────────────
function PostDetailSection() {
  const [input, setInput] = useState("feed_1");
  const [postId, setPostId] = useState<string | null>(null);

  // Info del post: leída del cache del feed (sección 1), sin request extra
  const { data: feedPosts } = useFeed(20, false);
  const post = postId ? (feedPosts?.find((p) => p.id === postId) ?? null) : null;

  // Tags: endpoint separado GET /api/tag/post/:id
  const { data: tags, isFetching, error: tagsError } = useQuery({
    queryKey: ["postDetailTags", postId],
    queryFn: async () => {
      const token = await getAccessToken();
      return fetchPostTags(postId!, token);
    },
    enabled: !!postId,
  });

  return (
    <Section title="9. Info y tags de un post específico">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="postId (ej: feed_1)"
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white"
        />
        <button
          onClick={() => setPostId(input)}
          disabled={isFetching}
          className="rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
        >
          {isFetching ? "Cargando tags…" : "Consultar"}
        </button>
      </div>
      {postId && !post && (
        <p className="mt-1 text-xs text-zinc-500">
          Post no encontrado en cache — carga primero el feed (sección 1).
        </p>
      )}
      {tagsError && <p className="mt-2 text-xs text-red-400">Tags: {String(tagsError)}</p>}
      <p className="mt-3 text-xs font-semibold text-zinc-400">Info del post (cache feed)</p>
      <JsonBox data={post ?? { estado: "sin resultado aún" }} />
      <p className="mt-3 text-xs font-semibold text-zinc-400">Tags del post (GET /api/tag/post/:id)</p>
      <JsonBox data={tags ?? { estado: "sin resultado aún" }} />
    </Section>
  );
}

// ─── Sección 10: Tags globales por categoría ─────────────────────────────────
function TagsSection() {
  const { data, isFetching, error, refetch } = useQuery<TagCategories>({
    queryKey: ["tags-categories"],
    queryFn: fetchTags,
    enabled: false,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Section title="9. GET /api/tag — Tags por categoría">
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
      >
        {isFetching ? "Cargando…" : data ? "Recargar tags" : "Cargar tags"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{String(error)}</p>}
      {data && (
        <div className="mt-2 space-y-2">
          {Object.entries(data).map(([category, tags]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-zinc-300">{category}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <JsonBox data={data ?? { estado: "sin resultado aún" }} />
    </Section>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function TestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <h1 className="mb-1 font-mono text-lg font-bold">Feed — Test endpoints</h1>
      <p className="mb-6 text-xs text-zinc-500">
        MSW activo · Los requests van a los handlers mock · Revisa Network en DevTools
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <FeedSection />
        <SearchSection />
        <LikeSection />
        <SaveSection />
        <NavigationSection />
        <OfferSection />
        <SellerRatingSection />
        <PhotosSection />
        <PostDetailSection />
        <TagsSection />
      </div>
    </div>
  );
}

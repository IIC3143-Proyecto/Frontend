import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export function ProductImages({ images }: { images: string[] }) {
  let content;

  if (images.length > 1) {
    content = <MultipleImagesContainer images={images} />;
  } else {
    content = <SingleImageContainer image={images[0]} />;
  }

  return content;
}

function SingleImageContainer({ image }: { image: string }) {
  return (
    <Image
      src={image}
      alt="imagen del producto"
      fill
      className="object-contain"
    />
  );
}

function MultipleImagesContainer({ images }: { images: string[] }) {
  return (
    <Carousel>
      <CarouselContent>
        {images.map((src, i) => (
          <CarouselItem key={i}>
            <SingleImageContainer image={src} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

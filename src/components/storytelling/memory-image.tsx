import Image from "next/image";
import type { Memory } from "@/data/memories";
import styles from "./memories.module.css";

export function MemoryImage({ memory, sizes }: { memory: Memory; sizes: string }) {
  return memory.image ? (
    <Image alt={memory.alt} className={styles.image} draggable={false} fill
      sizes={sizes} src={memory.image} style={{ objectPosition: memory.imagePosition }} />
  ) : (
    <div aria-label="Foto belum tersedia" className={styles.placeholder} role="img" />
  );
}

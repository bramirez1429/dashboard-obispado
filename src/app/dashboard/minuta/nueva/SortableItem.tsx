"use client";

import { HolderOutlined } from "@ant-design/icons";
import {
  defaultAnimateLayoutChanges,
  useSortable,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";
import styles from "./SortableItem.module.css";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({
    ...args,
    wasDragging: true,
  });

type SortableItemProps = {
  id: string;
  children: ReactNode;
};

export default function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease, box-shadow 180ms ease",
    opacity: isDragging ? 0.97 : 1,
    zIndex: isDragging ? 30 : "auto",
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isDragging ? styles.dragging : ""}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Mover"
      >
        <HolderOutlined />
      </button>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

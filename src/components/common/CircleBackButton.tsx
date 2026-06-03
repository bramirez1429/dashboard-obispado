"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";

type CircleBackButtonProps = {
  href: string;
  ariaLabel?: string;
  className?: string;
};

export default function CircleBackButton({
  href,
  ariaLabel = "Volver",
  className = "minute-circle-back-link",
}: CircleBackButtonProps) {
  return (
    <Link className={className} href={href} prefetch={false} aria-label={ariaLabel}>
      <ArrowLeftOutlined aria-hidden="true" />
    </Link>
  );
}

"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

type BackCircleButtonProps = {
  href: string;
  ariaLabel?: string;
  className?: string;
};

export default function BackCircleButton({
  href,
  ariaLabel = "Volver",
  className,
}: BackCircleButtonProps) {
  return (
    <Link className={className} href={href} prefetch={false}>
      <Button
        aria-label={ariaLabel}
        icon={<ArrowLeftOutlined />}
        shape="circle"
      />
    </Link>
  );
}

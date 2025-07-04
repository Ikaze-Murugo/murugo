"use client";
import { menuItems } from "@/data/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((item, index) => (
        <li
          key={index}
          className={`dropdown2 ${
            item.links.some(
              (el) => el.href.split("/")[1] == pathname.split("/")[1]
            )
              ? "current"
              : ""
          }`}
        >
          <a>{item.title}</a>
          <ul>
            {item.links.map((link, linkIndex) => (
              <li
                key={linkIndex}
                className={
                  link.href.split("/")[1] == pathname.split("/")[1]
                    ? "current"
                    : ""
                }
              >
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <div className="dropdown2-btn"></div>
        </li>
      ))}
    </>
  );
}

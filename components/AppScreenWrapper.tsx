"use client";

import { ReactNode } from "react";
import "app/app-screen-wrapper.css";

type Props = {
  children: ReactNode;
};

export default function AppScreenWrapper({ children }: Props) {
  return (
    <div className="app-screen">
      <div className="app-screen-inner">{children}</div>
    </div>
  );
}

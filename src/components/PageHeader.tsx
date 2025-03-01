import * as React from "react";

export const PageHeader: React.FC = ({ children }) => (
  <h1 className="text-3xl text-primary font-light my-6">{children}</h1>
);

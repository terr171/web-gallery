import React from "react";

const Layout = ({
  children,
  projectModal,
}: {
  children: React.ReactNode;
  projectModal: React.ReactNode;
}) => {
  return (
    <div>
      {children}
      {projectModal}
    </div>
  );
};
export default Layout;

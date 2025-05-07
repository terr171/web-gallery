import React from "react";

const Layout = async ({
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

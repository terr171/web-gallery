import React from "react";

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="max-w-lg p-6 mx-auto bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
        <h2 className="font-semibold text-lg mb-2">{message}</h2>
        <p className="mt-4 text-sm">Try refreshing the page</p>
      </div>
    </div>
  );
};
export default ErrorMessage;

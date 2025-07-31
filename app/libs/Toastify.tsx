import React from "react";
import { Bounce, ToastContainer, ToastPosition } from "react-toastify";

export default function Toastify({ position }: { position?: ToastPosition }) {
  return (
    <ToastContainer
      position={`${position || "bottom-right"}`}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      autoClose={1000}
      draggable
      pauseOnHover
      // theme="dark"
      transition={Bounce}
    />
  );
}

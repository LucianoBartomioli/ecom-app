export const metadata = {
  title: "Render Room",
  description: "Sala de control de producción de creativos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#0B0B0C" }}>{children}</body>
    </html>
  );
}

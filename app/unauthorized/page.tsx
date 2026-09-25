export default function UnauthorizedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1>Private Space</h1>

        <p>
          This website is private and your account
          doesn't have access.
        </p>
      </div>
    </main>
  );
}
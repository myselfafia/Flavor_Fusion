import { useEffect, useState } from "react";
import { useCarbonFootprint } from "react-carbon-footprint";

const CarbonFootprintDisplay = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint();
  const [isMinimized, setIsMinimized] = useState(false);
  const [footerOffset, setFooterOffset] = useState(16);

  useEffect(() => {
    const updatePosition = () => {
      const footer = document.querySelector("footer");
      if (!footer) {
        setFooterOffset(16);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When the footer enters the viewport, lift the badge above the footer
      if (footerRect.top < windowHeight) {
        const visibleFooterHeight = windowHeight - footerRect.top;
        setFooterOffset(visibleFooterHeight + 16);
      } else {
        setFooterOffset(16);
      }
    };

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    updatePosition();

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const formattedBytes =
    bytesTransferred > 1048576
      ? `${(bytesTransferred / 1048576).toFixed(2)} MB`
      : bytesTransferred > 1024
        ? `${(bytesTransferred / 1024).toFixed(1)} KB`
        : null;

  const emissionsGrams = (gCO2 || 0).toFixed(2);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        aria-label="Expand carbon footprint indicator"
        title="Click to view carbon footprint details"
        style={{
          position: "fixed",
          bottom: `${footerOffset}px`,
          right: "16px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(7, 93, 61, 0.2)",
          borderRadius: "999px",
          padding: "7px 14px",
          boxShadow: "0 4px 16px rgba(6, 45, 32, 0.15)",
          color: "#075d3d",
          fontSize: "13px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          zIndex: 1000,
          transition:
            "bottom 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ fontSize: "15px" }}>🌱</span>
        <span>{emissionsGrams}g CO₂eq</span>
        <span style={{ fontSize: "10px", color: "#526159" }}>▲</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: `${footerOffset}px`,
        right: "16px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(7, 93, 61, 0.18)",
        borderRadius: "12px",
        boxShadow: "0 6px 22px rgba(6, 45, 32, 0.14)",
        padding: "12px 16px",
        zIndex: 1000,
        fontFamily: "'Work Sans', sans-serif",
        maxWidth: "310px",
        color: "#062d20",
        transition: "bottom 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          gap: "8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            color: "#075d3d",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>🌱</span> Network Carbon Footprint
        </h3>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          title="Minimize"
          aria-label="Minimize carbon footprint indicator"
          style={{
            background: "transparent",
            border: "none",
            color: "#526159",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: 1,
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          −
        </button>
      </div>

      <p style={{ margin: "4px 0", fontSize: "13px" }}>
        <strong>Bytes Transferred:</strong> {bytesTransferred ?? 0} bytes
        {formattedBytes ? ` (${formattedBytes})` : ""}
      </p>
      <p style={{ margin: "4px 0", fontSize: "13px" }}>
        <strong>CO2 Emissions:</strong> {emissionsGrams} grams CO2eq
      </p>
      <p
        style={{
          fontSize: "11px",
          color: "#526159",
          margin: "8px 0 0 0",
          borderTop: "1px solid rgba(7, 93, 61, 0.12)",
          paddingTop: "6px",
          lineHeight: 1.35,
        }}
      >
        (Estimates based on network data transfer during this session)
      </p>
    </div>
  );
};

export default CarbonFootprintDisplay;

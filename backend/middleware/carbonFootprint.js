import { co2 } from "@tgwf/co2";

// Initialize CO2.js with the Sustainable Web Design model
const co2Emission = new co2({ model: "swd" });

// Middleware to calculate data transfer size and CO2 emissions
const carbonFootprintMiddleware = (req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  // Calculate request size
  if (req.body) {
    requestBytes = Buffer.byteLength(JSON.stringify(req.body), "utf8");
  }
  if (req.query) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.query), "utf8");
  }
  if (req.headers) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.headers), "utf8");
  }

  // Override res.write to calculate response size
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, "utf8");
    }
    return originalWrite.apply(res, [chunk, ...args]);
  };

  res.end = function (chunk, ...args) {
    if (chunk && typeof chunk !== "function") {
      responseBytes += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, "utf8");
    }

    // Store total bytes
    res.locals.totalBytes = requestBytes + responseBytes;

    // Calculate carbon emissions
    const greenHost = false; // Set to true if your server is hosted on a green host
    const emissions = co2Emission.perByte(res.locals.totalBytes, greenHost);
    res.locals.emissions = emissions;

    console.log(`Data transferred: ${res.locals.totalBytes} bytes`);
    console.log(`Estimated CO2 emissions: ${emissions.toFixed(3)} grams`);

    return originalEnd.apply(res, [chunk, ...args]);
  };

  next();
};

export default carbonFootprintMiddleware;

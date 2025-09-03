// OpenTelemetry auto-instrumentation preloader (CommonJS)
const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')

const exporter = new OTLPTraceExporter({})
const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('OTel SDK failed to start', err)
})

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0))
})


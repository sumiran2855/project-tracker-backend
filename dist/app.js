import dns from 'dns';
// Force standard Node.js lookup to prefer IPv4
dns.setDefaultResultOrder('ipv4first');
// Monkeypatch IPv6 DNS resolvers to force fallback to IPv4
const mockResolve6 = (hostname, ...args) => {
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
        callback(null, []);
    }
};
dns.resolve6 = mockResolve6;
if (dns.Resolver && dns.Resolver.prototype) {
    dns.Resolver.prototype.resolve6 = mockResolve6;
}
if (dns.promises) {
    dns.promises.resolve6 = async () => [];
    if (dns.promises.Resolver && dns.promises.Resolver.prototype) {
        dns.promises.Resolver.prototype.resolve6 = async () => [];
    }
}
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
// Middlewares
app.use(cors());
app.use(express.json());
// Routes
app.use('/api', apiRouter);
// Healthcheck Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Fallback Route
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});
// Error handling middleware (must be registered last)
app.use(errorHandler);
// Connect database and start server
async function bootstrap() {
    await connectDatabase();
    app.listen(env.PORT, () => {
        console.log(`🚀 Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
}
bootstrap().catch(err => {
    console.error('❌ Failed to start the server:', err);
    process.exit(1);
});
export default app;

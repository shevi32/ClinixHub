import Fastify from 'fastify';
import dotenv from 'dotenv';
import { authRoutes } from './routes/authRoutes'; // מייבאים את הראוטים שיצרנו

dotenv.config();

const fastify = Fastify({ logger: true });

// כאן אנחנו רושמים את הנתיבים לשרת (Integration)
fastify.register(authRoutes);

fastify.get('/health', async () => {
  return { status: 'Server is running' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { TransformInterceptor } from './interceptor/transform.interceptor';
// import { HttpAdapterHost } from '@nestjs/core';
// import { AllExceptionsFilter } from './filters/all-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn', 'log', 'debug', 'verbose']
        : ['error', 'warn'],
  });
  app.setGlobalPrefix('api');
  // app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  app.useGlobalFilters(new HttpExceptionFilter());
  //根模块注册了，这里就需要了，不然会重叠
  // app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});

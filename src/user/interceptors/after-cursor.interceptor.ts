import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as qs from 'qs';

@Injectable()
export class AfterCursorQueryParseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Если originalUrl присутствует, то берём часть после "?"
    const originalUrl = request.originalUrl ?? '';
    const queryString = originalUrl.split('?')[1] || '';

    if (queryString) {
      try {
        // Парсим query-строку с помощью qs
        const parsedQuery = qs.parse(queryString);
        // Переопределяем свойство req.query с новым значением,
        // используя Object.defineProperty, чтобы сделать его перезаписываемым.
        Object.defineProperty(request, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch (error) {
        console.error('QueryParseInterceptor error:', error);
      }
    }

    return next.handle();
  }
}

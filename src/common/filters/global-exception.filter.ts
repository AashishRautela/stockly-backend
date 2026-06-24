import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { ErrorResponse } from '../responses/error-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof AppError) {
      return response.status(exception.statusCode).json(
        ErrorResponse(exception.message, {
          statusCode: exception.statusCode,
          explanation: exception.explanation,
          path: request.url,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const payload =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse, explanation: [exceptionResponse] }
          : (exceptionResponse as Record<string, unknown>);

      const message =
        typeof payload.message === 'string'
          ? payload.message
          : Array.isArray(payload.message) && payload.message.length > 0
            ? 'Validation failed'
            : 'Request failed';

      const explanation = Array.isArray(payload.message)
        ? payload.message
        : typeof payload.message === 'string'
          ? [payload.message]
          : ['Request failed'];

      return response.status(statusCode).json(
        ErrorResponse(message, {
          statusCode,
          explanation,
          path: request.url,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      ErrorResponse(message, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        explanation: [message],
        path: request.url,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

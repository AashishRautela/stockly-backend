export class AppError extends Error {
  statusCode: number;
  explanation: string[];

  constructor(message: string, statusCode: number, explanation: string | string[] | null = null) {
    super(message);
    this.statusCode = statusCode;

    if (Array.isArray(explanation)) {
      this.explanation = explanation;
    } else if (typeof explanation === 'string' && explanation.trim()) {
      this.explanation = [explanation];
    } else {
      this.explanation = [message];
    }
  }
}

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errorsArray?: any[];

  constructor(message: string, statusCode: number, errorsArray?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorsArray = errorsArray;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

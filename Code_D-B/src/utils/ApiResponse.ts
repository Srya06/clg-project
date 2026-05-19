class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;

  constructor(
    statusCode: number,
    data: T = {} as T,
    message = 'Operation successful'
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export default ApiResponse;

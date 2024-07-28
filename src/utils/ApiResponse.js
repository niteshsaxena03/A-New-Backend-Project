class ApiResponse {
  constructor(statusCode, message = "Success", data) {
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
    this.statusCode = statusCode;
  }
}
export { ApiResponse };

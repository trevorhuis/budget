export class NotFoundException extends Error {
  constructor(message = "Resource not found") {
    super(message);
  }
}

export class AccessDeniedException extends Error {
  constructor(message = "Access denied") {
    super(message);
  }
}



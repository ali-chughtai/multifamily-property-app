export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input data') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export const handleTRPCError = (error: unknown) => {
  if (error instanceof AppError) {
    throw error;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('duplicate key')) {
      throw new ConflictError('Resource already exists with this identifier');
    }
    
    if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
      throw new DatabaseError('Database connection failed');
    }
    
    if (error.message.includes('foreign key')) {
      throw new ValidationError('Referenced resource does not exist');
    }
    
    if (error.message.includes('invalid input syntax for type uuid')) {
      throw new ValidationError('Invalid ID format provided');
    }
  }
  
  throw new AppError('Internal server error', 500);
};
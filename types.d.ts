/**
 * Represents a successful operation result with an optional response payload
 *
 * @template T The type of data returned on success (defaults to null)
 */
type ActionSuccess<T = null> = {
  success: true;
  response: T;
};

/**
 * Represents a failed operation result with an error message
 *
 */
type ActionError = {
  success: false;
  error: string;
};

/**
 * A discriminated union type representing the result of any operation
 *
 * @template T The type of data returned on success (defaults to null)
 */
type ActionResult<T = null> = ActionSuccess<T> | ActionError;

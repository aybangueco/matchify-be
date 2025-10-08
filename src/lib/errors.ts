import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HTTPResponseError } from "hono/types";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { type $ZodError, flattenError } from "zod/v4/core";
import { HttpStatus } from "./http";
import type { AppBindings } from "./types";

export class ZodValidationException extends HTTPException {
	formErrors: string[];
	fieldErrors: Record<string, unknown>;

	constructor(
		status: ContentfulStatusCode,
		formErrors: string[],
		fieldErrors: Record<string, unknown>,
	) {
		super(status);
		this.formErrors = formErrors;
		this.fieldErrors = fieldErrors;
	}
}

export const errors = {
	ZodValidationErr: (error: $ZodError<unknown>) => {
		const flattenedErrors = flattenError(error);
		return new ZodValidationException(
			HttpStatus.BadRequest.code,
			flattenedErrors.formErrors,
			flattenedErrors.fieldErrors,
		);
	},
	InvalidAuthErr: () =>
		new HTTPException(HttpStatus.Unauthorized.code, {
			message: "Invalid username or password",
		}),
};

export function handleNotFoundRoutes(): Response | Promise<Response> {
	throw new HTTPException(HttpStatus.NotFound.code, {
		message: HttpStatus.NotFound.message,
	});
}

export function handleAPIErrors(
	err: Error | HTTPResponseError,
	c: Context<AppBindings>,
): Response | Promise<Response> {
	console.error(err);

	if (err instanceof ZodValidationException) {
		return c.json(
			{
				success: false,
				message: "Validation error",
				fieldErrors: err.fieldErrors,
			},
			err.status,
		);
	} else if (err instanceof HTTPException) {
		return c.json({ success: false, message: err.message }, err.status);
	}

	return c.json(
		{ success: false, message: HttpStatus.InternalServerError.message },
		HttpStatus.InternalServerError.code,
	);
}

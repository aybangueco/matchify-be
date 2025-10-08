/**
 * A reusable map of HTTP status codes with their generic messages.
 * Provides type-safe, IntelliSense-friendly constants for standardized API responses.
 */
export const HttpStatus = {
	// --- 1xx Informational ---

	/** The server has received the request headers, and the client should proceed. */
	Continue: { code: 100, message: "Continue" },

	/** The requester has asked the server to switch protocols. */
	SwitchingProtocols: { code: 101, message: "Switching Protocols" },

	/** The server has received and is processing the request, but no response is available yet. */
	Processing: { code: 102, message: "Processing" },

	// --- 2xx Success ---

	/** The request succeeded. */
	Ok: { code: 200, message: "OK" },

	/** A new resource has been created successfully. */
	Created: { code: 201, message: "Resource created successfully" },

	/** The request has been accepted for processing, but not yet completed. */
	Accepted: { code: 202, message: "Request accepted for processing" },

	/** Returned meta-information is not from the origin server. */
	NonAuthoritativeInformation: {
		code: 203,
		message: "Non-authoritative information",
	},

	/** The request succeeded but there is no content to return. */
	NoContent: { code: 204, message: "No content to send" },

	/** The client should reset the document view. */
	ResetContent: { code: 205, message: "Reset content" },

	/** Partial content returned due to a range header request. */
	PartialContent: { code: 206, message: "Partial content" },

	// --- 3xx Redirection ---

	/** Indicates multiple options for the resource. */
	MultipleChoices: { code: 300, message: "Multiple choices available" },

	/** The resource has been moved permanently to a new URI. */
	MovedPermanently: { code: 301, message: "Resource moved permanently" },

	/** The resource temporarily resides at a different URI. */
	Found: { code: 302, message: "Resource found at another URI" },

	/** Redirect to another URI using GET. */
	SeeOther: { code: 303, message: "See other resource" },

	/** The resource has not been modified since the last request. */
	NotModified: { code: 304, message: "Resource not modified" },

	/** Temporary redirect to another URI. */
	TemporaryRedirect: { code: 307, message: "Temporary redirect" },

	/** Permanent redirect to another URI. */
	PermanentRedirect: { code: 308, message: "Permanent redirect" },

	// --- 4xx Client Errors ---

	/** The server could not understand the request due to invalid syntax. */
	BadRequest: { code: 400, message: "Bad request" },

	/** Authentication is required or has failed. */
	Unauthorized: { code: 401, message: "Unauthorized access" },

	/** Reserved for future use. */
	PaymentRequired: { code: 402, message: "Payment required" },

	/** The client does not have permission to access the resource. */
	Forbidden: { code: 403, message: "Forbidden" },

	/** The requested resource could not be found. */
	NotFound: { code: 404, message: "Resource not found" },

	/** The method specified is not allowed for the resource. */
	MethodNotAllowed: { code: 405, message: "Method not allowed" },

	/** The requested resource is not available in the format requested. */
	NotAcceptable: { code: 406, message: "Not acceptable" },

	/** The client must authenticate with a proxy. */
	ProxyAuthenticationRequired: {
		code: 407,
		message: "Proxy authentication required",
	},

	/** The server timed out waiting for the request. */
	RequestTimeout: { code: 408, message: "Request timeout" },

	/** The request could not be completed due to a conflict. */
	Conflict: { code: 409, message: "Conflict with current state" },

	/** The requested resource is no longer available. */
	Gone: { code: 410, message: "Resource no longer available" },

	/** The Content-Length header is missing. */
	LengthRequired: { code: 411, message: "Length required" },

	/** A precondition in the request headers failed. */
	PreconditionFailed: { code: 412, message: "Precondition failed" },

	/** The request entity is too large. */
	PayloadTooLarge: { code: 413, message: "Payload too large" },

	/** The URI requested is too long for the server to process. */
	URITooLong: { code: 414, message: "URI too long" },

	/** The request entity format is not supported. */
	UnsupportedMediaType: { code: 415, message: "Unsupported media type" },

	/** The requested range cannot be fulfilled. */
	RangeNotSatisfiable: { code: 416, message: "Range not satisfiable" },

	/** The server cannot meet the Expect header requirements. */
	ExpectationFailed: { code: 417, message: "Expectation failed" },

	/** Joke status indicating the server refuses to brew coffee in a teapot. */
	ImATeapot: { code: 418, message: "I'm a teapot" },

	/** The request was well-formed but could not be processed. */
	UnprocessableEntity: { code: 422, message: "Unprocessable entity" },

	/** The server is unwilling to risk processing a request that might be replayed. */
	TooEarly: { code: 425, message: "Too early" },

	/** The client should switch to a different protocol. */
	UpgradeRequired: { code: 426, message: "Upgrade required" },

	/** The origin server requires the request to be conditional. */
	PreconditionRequired: { code: 428, message: "Precondition required" },

	/** The user has sent too many requests in a given time. */
	TooManyRequests: { code: 429, message: "Too many requests" },

	/** Request header fields are too large. */
	RequestHeaderFieldsTooLarge: {
		code: 431,
		message: "Request header fields too large",
	},

	/** The resource is unavailable due to legal demands. */
	UnavailableForLegalReasons: {
		code: 451,
		message: "Unavailable for legal reasons",
	},

	// --- 5xx Server Errors ---

	/** A generic server error occurred. */
	InternalServerError: { code: 500, message: "Internal server error" },

	/** The server does not recognize the request method. */
	NotImplemented: { code: 501, message: "Not implemented" },

	/** The server received an invalid response from an upstream server. */
	BadGateway: { code: 502, message: "Bad gateway" },

	/** The server is currently unavailable (overloaded or down). */
	ServiceUnavailable: { code: 503, message: "Service unavailable" },

	/** The upstream server failed to send a request in time. */
	GatewayTimeout: { code: 504, message: "Gateway timeout" },

	/** The HTTP version is not supported by the server. */
	HTTPVersionNotSupported: { code: 505, message: "HTTP version not supported" },

	/** Content negotiation resulted in circular references. */
	VariantAlsoNegotiates: { code: 506, message: "Variant also negotiates" },

	/** The server cannot store the representation needed to complete the request. */
	InsufficientStorage: { code: 507, message: "Insufficient storage" },

	/** Infinite loop detected during request processing. */
	LoopDetected: { code: 508, message: "Loop detected" },

	/** Further extensions to the request are required for the server to fulfill it. */
	NotExtended: { code: 510, message: "Not extended" },

	/** The client needs to authenticate to gain network access. */
	NetworkAuthenticationRequired: {
		code: 511,
		message: "Network authentication required",
	},
} as const;

/** Union type of all HttpStatus keys. */
export type HttpStatusKey = keyof typeof HttpStatus;

/** Union type of all HttpStatus values. */
export type HttpStatusValue = (typeof HttpStatus)[HttpStatusKey];

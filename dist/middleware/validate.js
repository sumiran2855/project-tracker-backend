import { CustomError } from '../helpers/CustomError.js';
export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errorMsg = result.error.errors.map(e => e.message).join(', ');
            return next(new CustomError(400, errorMsg));
        }
        req.body = result.data;
        next();
    };
}

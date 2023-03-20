// currently this assumes every input is a string
export interface InputStrings {
    [everyProp: string]: string;
}

type ValidationRule = (val: string) => boolean;
type Errors<Inputs> = Partial<{ [P in keyof Inputs]: string }>;
type Validator = (val: string) => string | void;
type MakeValidator = (msg?: string) => Validator;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MakeValidatorWithArg = (arg: any, msg?: string) => Validator;

export type ValidationSchema<Inputs> = Partial<{ [P in keyof Inputs]: Validator[] }>;

export const composeValidator: (rule: ValidationRule, msg: string) => Validator = (rule, msg) => (val) => {
    if (!rule(val)) {
        return msg;
    }
};

const mobileNumberRegex = /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/;

const isValidOIB = (oib: string): boolean => {
    if (!/^[0-9]{11}$/.test(oib)) {
        return false;
    }

    let a = 10;
    for (const digit of oib.substring(0, 10)) {
        a += parseInt(digit);
        a %= 10;

        if (a === 0) {
            a = 10;
        }
        
        a *= 2;
        a %= 11;
    }

    let control = 11 - a;
    if (control === 10) {
        control = 0;
    }

    return control === parseInt(oib.substring(10, oib.length));
};

// Rules
const validateRequired: ValidationRule = (val) => val.length > 0;
const validateNumber: ValidationRule = (val) => Number.isNaN(Number.parseFloat(val));
const validateMinLength: (min: number) => ValidationRule = (min) => (val) => val.length >= min;
const validateMaxLength: (max: number) => ValidationRule = (max) => (val) => val.length <= max;
const validateMobileNumber: ValidationRule = (val) => (val.match(mobileNumberRegex) ? true : false);
const validateOIB: ValidationRule = (val) => isValidOIB(val);

// Validators from Functions
export const isRequired: MakeValidator = (msg = "Required") => composeValidator(validateRequired, msg);
export const isNumber: MakeValidator = (msg = "Number Required") => composeValidator(validateNumber, msg);
export const isMinLength: MakeValidatorWithArg = (min, msg) =>
    composeValidator(validateMinLength(min), msg || `Min Length ${min} required`);
export const isMaxLength: MakeValidatorWithArg = (max, msg) =>
    composeValidator(validateMaxLength(max), msg || `Max Length ${max} required`);
export const isMobileNumber: MakeValidator = (msg = "Invalid Mobile number") =>
    composeValidator(validateMobileNumber, msg);
export const isOibNumber: MakeValidator = (msg = "Invalid OIB number") => composeValidator(validateOIB, msg);

export class Validation<I extends InputStrings> {
    public schema: ValidationSchema<I>;
    constructor(schema: ValidationSchema<I>) {
        this.schema = schema;
    }

    validate: (inputs: I) => Errors<I> = (inputs) => {
        return Object.keys(this.schema).reduce((errors, key) => {
            const validators = this.schema[key];
            const value = inputs[key];

            if (validators?.length) {
                for (const i of Object.keys(validators)) {
                    const validator = validators[i];
                    const res = validator(value);
                    if (res) {
                        errors[key] = res;
                        break;
                    }
                }
            }

            return errors;
        }, {});
    };
}

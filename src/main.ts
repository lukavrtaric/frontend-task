import './index.css';
import { isMaxLength, isMinLength, isMobileNumber, isOibNumber, isRequired, Validation } from './utils/validation';
import helpers from './helpers';

// Navigation buttons elements
const btnPrev = document.getElementById('btn_prev') as HTMLButtonElement;
const btnNext = document.getElementById('btn_next') as HTMLButtonElement;

// Password functionality elements
const passwordToggle = document.querySelector<HTMLElement>('.js-password-toggle');
const password = document.querySelector<HTMLInputElement>('.js-password');
const passwordLabel = document.querySelector<HTMLLabelElement>('.js-password-label');

// Form elements
const form = document.getElementById('registration_form') as HTMLFormElement;
const formSteps = document.getElementsByClassName('form-step') as HTMLCollectionOf<HTMLDivElement>;
const inicatorSteps = document.getElementsByClassName('indicator-step') as HTMLCollectionOf<HTMLDivElement>;
const inputs = document.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElement>;

// Modal elements
const modal = document.getElementById('modal') as HTMLDivElement;
const modalButtonOK = document.getElementById('btn_ok') as HTMLButtonElement;

/**
 *
 * Events listeners
 */
if (passwordToggle && password && passwordLabel) {
    passwordToggle.addEventListener('change', () => helpers.passwordVisibilityHandler(password, passwordLabel));
}
modalButtonOK.addEventListener('click', () => processResetHandler());
btnPrev.addEventListener('click', () => nextPrevHandler(-1));
btnNext.addEventListener('click', () => nextPrevHandler(1));
Array.from(inputs).forEach((input) => {
    ['focusout', 'keyup'].forEach((events) =>
        input.addEventListener(events, (e: Event) => validate(e.target as HTMLInputElement)),
    );
});

/**
 *
 * Validation rules configuration
 * Each field can have single or multiple validation options
 */
const rules = {
    username: [isRequired('Username is required'), isMaxLength(30)],
    password: [isRequired('Password is required'), isMinLength(6)],
    firstName: [isRequired('First name is required'), isMaxLength(30)],
    lastName: [isRequired('Last name is required'), isMaxLength(30)],
    address: [isRequired('Address is required'), isMaxLength(50)],
    mobileNumber: [isRequired('Mobile number is required'), isMobileNumber()],
    socialSecurityNumber: [isRequired('Social security number is required'), isOibNumber()],
};

/**
 *
 * StepCounter instance for global form steps tracking
 */
function StepCounter() {
    this.value = 0;
    this.up = () => ++this.value;
    this.down = () => --this.value;
    this.reset = () => (this.value = 0);
}

/**
 *
 * Show first step at app initialization
 */
const counter = new StepCounter();
showStep(counter.value);

function showStep(step: number) {
    // Show proper step
    helpers.showHideElementDisplay(formSteps[step], true);

    // Hide Prev button on first step
    helpers.showHideElementVisibility(btnPrev, step !== 0);

    // Change button label according to step
    // On last step change label to Submit
    btnNext.innerHTML = step == formSteps.length - 1 ? "Submit" : "Next";

    // Ajdust progress bar indicator according to process
    helpers.fixStepIndicator(inicatorSteps, step);
}

/**
 * 
 * Handler for processing curent and next step
 */
function nextPrevHandler(step: number): boolean | void {
    const next = step === 1;

    // Input fields values inside current step not valid
    if (next && !isStepValid()) {
        return false;
    }

    // Submit button pressed
    // Send data to API
    if (next && counter.value >= formSteps.length - 1) {
        modalVisibilityHandler(true);
        return false;
    }

    // Hide current step
    helpers.showHideElementDisplay(formSteps[counter.value], false);

    // Show next step
    showStep(next ? counter.up() : counter.down());
}

/**
 * 
 * Simple validation for each field inside current step and progress bar handler
 */
function isStepValid(): boolean {
    const fields = helpers.getInputFieldsFromStep(formSteps, counter.value);
    const errors: boolean[] = [];

    [...fields].forEach((field) => {
        errors.push(validate(field));
    });

    const noErrors = errors.every((error) => error === false);

    if (noErrors && !inicatorSteps[counter.value].classList.contains('finish')) {
        inicatorSteps[counter.value].classList.add('finish');
    }

    if (!noErrors) {
        inicatorSteps[counter.value].classList.remove('finish');
    }

    return noErrors;
}

/**
 * 
 * Simple field validation and error processing
 */
function validate(field: HTMLInputElement) {
    // Get validation error messages with keys if exists
    const validationErrors = new Validation({ [field.name]: rules[field.name] }).validate({
        [field.name]: field.value,
    });

    const hasErrors = Object.keys(validationErrors).length !== 0;
    const htmlElement = document.getElementById(`${field.name}_error`) as HTMLElement;
    const inputElement = document.getElementById(field.name) as HTMLInputElement;

    // Show or hide error element according to hasErrors variable
    helpers.showHideError({
        htmlElement: htmlElement,
        inputElement: inputElement,
        show: hasErrors,
        message: validationErrors[field.name],
    });

    return hasErrors;
}

/**
 * 
 * Modal visibility handler
 */
function modalVisibilityHandler(visible: boolean) {
    modal.style.display = visible ? 'block' : 'none';
}

/**
 * 
 * Reset and start again
 */
function processResetHandler() {
    // Close modal
    modalVisibilityHandler(false);
    // Close current step
    helpers.showHideElementDisplay(formSteps[counter.value], false);
    // Remove .finish classes from each step
    for (let i = 0; i < inicatorSteps.length; i++) {
        inicatorSteps[i].classList.remove('finish');
    }
    // Reset form fields
    form.reset();
    // Start from 0 again
    counter.reset();
    // According to counter show proper step (step 0)
    showStep(counter.value);
}

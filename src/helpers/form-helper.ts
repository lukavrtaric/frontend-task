const showHideElementVisibility = (element: HTMLElement, show: boolean) => {
    if (show) {
        element.classList.remove('invisible');
        element.classList.add('visible');
    } else {
        element.classList.remove('visible');
        element.classList.add('invisible');
    }
};

const showHideElementDisplay = (element: HTMLElement, show: boolean) => {
    if (show) {
        element.classList.remove('hidden');
        element.classList.add('grid');
    } else {
        element.classList.remove('grid');
        element.classList.add('hidden');
    }
};

const showHideError = (htmlElement: HTMLElement, inputElement: HTMLInputElement, show: boolean, message?: string) => {
    show
        ? inputElement.classList.add('border-[#f2545b]', 'focus:border-[#f2545b]', 'focus:ring-[#f2545b]')
        : inputElement.classList.remove('border-[#f2545b]', 'focus:border-[#f2545b]', 'focus:ring-[#f2545b]');

    htmlElement.innerHTML = message ?? "Undefined error";
    showHideElementVisibility(htmlElement, show);
};

const fixStepIndicator = (inicatorSteps: HTMLCollectionOf<HTMLDivElement>, step: number) => {
    for (let i = 0; i < inicatorSteps.length; i++) {
        inicatorSteps[i].className = inicatorSteps[i].className.replace(' active', '');
    }

    inicatorSteps[step].className += ' active';
};

const passwordVisibilityHandler = (password: HTMLInputElement, passwordLabel: HTMLLabelElement) => {
    if (password.type === 'password') {
        password.type = 'text';
        passwordLabel.innerHTML = 'hide';
    } else {
        password.type = 'password';
        passwordLabel.innerHTML = 'show';
    }

    password.focus();
};

const getInputFieldsFromStep = (formSteps: HTMLCollectionOf<HTMLDivElement>, step: number) =>
    formSteps[step].querySelectorAll<HTMLInputElement>('input:not(.js-password-toggle)');

export default {
    showHideError,
    showHideElementVisibility,
    showHideElementDisplay,
    fixStepIndicator,
    passwordVisibilityHandler,
    getInputFieldsFromStep,
};

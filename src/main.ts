import "./index.css";
import { isMaxLength, isMinLength, isMobileNumber, isOibNumber, isRequired, Validation } from "./utils/validation";
import helpers from "./helpers/form-helper";
import { api } from "./api";

type ModalType = "modal-info" | "modal-table";

type UserRequest = {
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    address: string;
    mobileNumber: string;
    socialSecurityNumber: string;
};

type UserResponse = Omit<UserRequest, "password">;

interface ITable {
    users?: UserResponse[];
    error?: string;
}

// Navigation buttons elements
const btnPrev = document.getElementById("btn_prev") as HTMLButtonElement;
const btnNext = document.getElementById("btn_next") as HTMLButtonElement;

// Password functionality elements
const passwordToggle = document.querySelector(".js-password-toggle") as HTMLElement;
const password = document.querySelector(".js-password") as HTMLInputElement;
const passwordLabel = document.querySelector(".js-password-label") as HTMLLabelElement;

// Form elements
const form = document.getElementById("registration_form") as HTMLFormElement;
const formSteps = document.getElementsByClassName("form-step") as HTMLCollectionOf<HTMLDivElement>;
const inicatorSteps = document.getElementsByClassName("indicator-step") as HTMLCollectionOf<HTMLDivElement>;
const inputs = document.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>;

// Modal elements
const modalInfo = document.getElementById("modal_info") as HTMLDivElement;
const modalInfoButtonClose = document.getElementById("modal_info_btn_close") as HTMLButtonElement;
const modalTable = document.getElementById("modal_table") as HTMLDivElement;
const modalTableButtonOpen = document.getElementById("modal_table_btn_open") as HTMLButtonElement;
const modalTableButtonClose = document.getElementById("modal_table_btn_close") as HTMLButtonElement;

// Table elements
const table = document.getElementById("table_user") as HTMLTableElement;
const tBody = document.getElementById("table_user_tbody") as HTMLTableElement;

// Password visibility toggle listener
passwordToggle.addEventListener("change", () => helpers.passwordVisibilityHandler(password, passwordLabel));

// Modal info listener
modalInfoButtonClose.addEventListener("click", () => processResetHandler());

// Form action buttons listeners
btnPrev.addEventListener("click", () => nextPrevHandler(-1));
btnNext.addEventListener("click", () => nextPrevHandler(1));

// Inputs listeners
Array.from(inputs).forEach((input) => {
    ["focusin", "keyup"].forEach((events) =>
        input.addEventListener(events, (e: Event) => validate(e.target as HTMLInputElement)),
    );
});

// Modal table buttons listeners 
modalTableButtonOpen.addEventListener("click", () => modalHandler("modal-table", true));
modalTableButtonClose.addEventListener("click", () => modalHandler("modal-table", false));

/**
 *
 * Validation rules configuration
 * Each field can have single or multiple validation options
 */
const rules = {
    username: [isRequired("Username is required"), isMaxLength(30)],
    password: [isRequired("Password is required"), isMinLength(6)],
    firstName: [isRequired("First name is required"), isMaxLength(30)],
    lastName: [isRequired("Last name is required"), isMaxLength(30)],
    address: [isRequired("Address is required"), isMaxLength(50)],
    mobileNumber: [isRequired("Mobile number is required"), isMobileNumber()],
    socialSecurityNumber: [isRequired("Social security number is required"), isOibNumber()],
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
async function nextPrevHandler(step: number): Promise<boolean | void> {
    const next = step === 1;

    // Input fields values inside current step not valid
    if (next && !isStepValid()) {
        return false;
    }

    // Submit button pressed
    if (next && counter.value >= formSteps.length - 1) {
        // Send data to API
        await sendDataToApi();
        // Open modal info with result message
        modalHandler("modal-info", true);

        return false;
    }

    // Hide current step
    helpers.showHideElementDisplay(formSteps[counter.value], false);

    // Show next step
    showStep(next ? counter.up() : counter.down());
}

/**
 * 
 * Collect data from form
 * Call API method to send data
 */
async function sendDataToApi() {
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData);

    await api.post("/api/user", JSON.stringify(formObject));
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

    if (noErrors && !inicatorSteps[counter.value].classList.contains("finish")) {
        inicatorSteps[counter.value].classList.add("finish");
    }

    if (!noErrors) {
        inicatorSteps[counter.value].classList.remove("finish");
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
    helpers.showHideError(htmlElement, inputElement, hasErrors, validationErrors[field.name]);

    return hasErrors;
}

/**
 *
 * Reset process and start again
 */
function processResetHandler() {
    // Close modal
    modalHandler("modal-info", false);
    // Close current step
    helpers.showHideElementDisplay(formSteps[counter.value], false);
    // Remove .finish classes from each step
    for (let i = 0; i < inicatorSteps.length; i++) {
        inicatorSteps[i].classList.remove("finish");
    }
    // Reset form fields
    form.reset();
    // Start from 0 again
    counter.reset();
    // According to counter show proper step (step 0)
    showStep(counter.value);
}

/**
 *
 * Handle modal action for each type
 */
async function modalHandler(type: ModalType, visible: boolean) {
    switch (type) {
        case "modal-info":
            modalInfo.style.display = visible ? "block" : "none";
            break;
        case "modal-table":
            if (visible) {
                try {
                    const users = await getData();
                    populateTable({ users });
                } catch (error) {
                    populateTable({ error });
                }
            }
            modalTable.style.display = visible ? "block" : "none";
            break;
        default:
            throw new Error("Unknown modal type.");
    }
}

/**
 * 
 * Clean all rows except header row
 * Populate table with as many rows as needed
 */
function populateTable(tableData: ITable) {
    const rowCount = table.rows.length;
    for (let i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    // If users exists populate table with users
    if (tableData.users) {
        tableData.users.map((user) => {
            const row = tBody.insertRow();

            for (const [, value] of Object.entries(user)) {
                const cell = row.insertCell();
                const text = document.createTextNode(value);
                cell.appendChild(text);
            }
        });
    }

    // If error exists, populate table with error message
    if (tableData.error) {
        const row = tBody.insertRow();
        const cell = row.insertCell();
        const text = document.createTextNode(tableData.error);
        cell.appendChild(text);
    }
}

/**
 * 
 * Fetch data from database
 */
async function getData(): Promise<UserResponse[]> {
    return new Promise((resolve, reject) => {
        try {
            const users = api.get<UserResponse[]>("/api/users");
            if (users) {
                resolve(users);
            }
        } catch (error) {
            reject("Not found");
        }
    });
}

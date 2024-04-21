// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';

// TASK: import initialData
import { initialData } from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(initialData));
        localStorage.setItem('showSideBar', 'true');
    } else {
        console.log('Data already exists in localStorage');
    }
}

// TASK: Get elements from the DOM
const elements = {
    headerBoardName: document.querySelector('.header-board-name'), //both class and id
    columnDivs: document.querySelectorAll('.column-div'),
    editTaskModal: document.querySelector('.edit-task-modal-window'),
    filterDiv: document.querySelector('#filterDiv'),
    hideSideBarBtn: document.querySelector('#hide-side-bar-btn'),
    showSideBarBtn: document.querySelector('#show-side-bar-btn'),
    themeSwitch: document.querySelector('#switch'),
    createNewTaskBtn: document.querySelector('#create-task-btn'),
    modalWindow: document.querySelector('.modal-window'),
    //Elements for toggleSidebar function
    sideBar: document.querySelector('.side-bar'),
    //Element for Add New task btn
    addNewTaskBtn: document.querySelector('#add-new-task-btn'),
    //Elements for new task input fields
    titleInput: document.querySelector('#title-input'),
    descInput: document.querySelector('#desc-input'),
    selectStatus: document.querySelector('#select-status'),
    //Elements use to change theme
    body: document.querySelector('body'),
    logo: document.querySelector('#logo'),
    //Elements to edit task
    editTaskTitle: document.querySelector('#edit-task-title-input'),
    editTaskDesc: document.querySelector('#edit-task-desc-input'),
    editSelectStatus: document.querySelector('#edit-select-status'),

    saveTaskChangesBtn: document.querySelector('#save-task-changes-btn'),
    cancelEditBtn: document.querySelector('#cancel-edit-btn'),
    deleteTaskBtn: document.querySelector('#delete-task-btn'),
};

let activeBoard = '';

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
    // -- FETCH BOARDS --
    const tasks = getTasks(); // * Returns an array of task objects in local storage
    const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))]; // * Array of unique boards
    displayBoards(boards); // * Array of unique boards in local storage
    if (boards.length > 0) {
        //FIXME: Remove: const localStorageBoard = JSON.parse(localStorage.getItem('activeBoard'));
        const localStorageBoard = localStorage.getItem('activeBoard');
        activeBoard = localStorageBoard ? localStorageBoard : boards[0];
        //Used to set activeBoard when page runs initially and activeBoard is boards[0]
        localStorage.setItem('activeBoard', activeBoard);
        elements.headerBoardName.textContent = activeBoard;
        styleActiveBoard(activeBoard);
        refreshTasksUI();
    }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
    // * boards parameter is an array of unique boards in local storage
    const boardsContainer = document.getElementById('boards-nav-links-div');
    boardsContainer.innerHTML = ''; // Clears the container which holds the boards in the side-panel
    boards.forEach((board) => {
        const boardElement = document.createElement('button');
        boardElement.textContent = board;
        boardElement.classList.add('board-btn');
        boardElement.addEventListener('click', () => {
            elements.headerBoardName.textContent = board;
            filterAndDisplayTasksByBoard(board);
            activeBoard = board; //assigns active board
            localStorage.setItem('activeBoard', activeBoard);
            styleActiveBoard(activeBoard);
        });
        boardsContainer.appendChild(boardElement);
    });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks(); // Fetch tasks from a simulated local storage function
    const filteredTasks = tasks.filter((task) => task.board === boardName); // * Returns an array of all tasks with matching board value

    //TODO:
    // Ensure the column titles are set outside of this function or correctly initialized before this function runs

    //FIXME: Overrides the current innerHTML content of the status headings, dot and tasks-container
    elements.columnDivs.forEach((column) => {
        const status = column.getAttribute('data-status');
        // Reset column content while preserving the column title
        column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

        const tasksContainer = document.createElement('div');
        tasksContainer.classList.add('tasks-container');
        column.appendChild(tasksContainer);

        //New innerHTML ends here

        filteredTasks
            .filter((task) => task.status === status)
            .forEach((task) => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task-div');
                taskElement.textContent = task.title;
                taskElement.setAttribute('data-task-id', task.id);

                // Listen for a click event on each task and open a modal
                taskElement.addEventListener('click', () => {
                    openEditTaskModal(task); // task object of selected task
                    console.log(task);
                });

                tasksContainer.appendChild(taskElement);
            });
    });
}

///////
function refreshTasksUI() {
    filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
    document.querySelectorAll('.board-btn').forEach((btn) => {
        if (btn.textContent === boardName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function addTaskToUI(task) {
    //* task is the new task object
    const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
    if (!column) {
        console.error(`Column not found for status: ${task.status}`);
        return;
    }

    let tasksContainer = column.querySelector('.tasks-container');
    if (!tasksContainer) {
        console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
        tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks-container';
        column.appendChild(tasksContainer);
    }

    const taskElement = document.createElement('div');
    taskElement.className = 'task-div';
    taskElement.textContent = task.title; // Modify as needed
    taskElement.setAttribute('data-task-id', task.id);

    tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
    // Cancel editing task event listener
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    cancelEditBtn.addEventListener('click', () => {
        toggleModal(false, elements.editTaskModal);
    });

    // Cancel adding new task event listener
    const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
    cancelAddTaskBtn.addEventListener('click', () => {
        toggleModal(false);
        elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    });

    // Clicking outside the modal to close it
    elements.filterDiv.addEventListener('click', () => {
        toggleModal(false);
        elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    });

    // Show sidebar event listener
    elements.hideSideBarBtn.addEventListener('click', () => {
        toggleSidebar(false);
    });
    elements.showSideBarBtn.addEventListener('click', () => {
        toggleSidebar(true);
    });

    // Theme switch event listener
    elements.themeSwitch.addEventListener('change', toggleTheme);

    // Show Add New Task Modal event listener
    elements.addNewTaskBtn.addEventListener('click', () => {
        toggleModal(true);
        elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    });

    /* FIXME: Delete if not used later
    elements.createNewTaskBtn.addEventListener('click', () => {
        toggleModal(true);
        elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    });
*/

    // Add new task form submission event listener
    elements.modalWindow.addEventListener('submit', (event) => {
        //FIXME: Remove console.log later
        console.log(event);
        addTask(event);
    });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
    modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
    event.preventDefault();

    //Assign user input to the task object
    const task = {
        title: elements.titleInput.value,
        description: elements.descInput.value,
        status: elements.selectStatus.value,
        board: localStorage.getItem('activeBoard'),
    };

    const newTask = createNewTask(task); // Returns the newTask object with id property.
    if (newTask) {
        addTaskToUI(newTask);
        toggleModal(false);
        elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
        event.target.reset();
        refreshTasksUI();
    }
}

function toggleSidebar(show) {
    if (show) {
        elements.sideBar.style.display = 'block';
        elements.showSideBarBtn.style.display = 'none';
        localStorage.setItem('showSideBar', 'true');
    } else {
        elements.sideBar.style.display = 'none';
        elements.showSideBarBtn.style.display = 'block';
        localStorage.setItem('showSideBar', 'false');
    }
}

function toggleTheme() {
    elements.body.classList.toggle('light-theme');
    if (elements.body.classList.contains('light-theme')) {
        localStorage.setItem('light-theme', 'enabled');
        elements.logo.src = '/assets/logo-light.svg';
    } else {
        localStorage.setItem('light-theme', 'disabled');
        elements.logo.src = '/assets/logo-dark.svg';
    }
}

function openEditTaskModal(task) {
    // Set task details in modal inputs
    console.log(task.title);
    elements.editTaskTitle.defaultValue = task.title; // .value also works
    elements.editTaskDesc.defaultValue = task.description;
    elements.editSelectStatus.value = task.status;

    // Call saveTaskChanges upon click of Save Changes button
    elements.saveTaskChangesBtn.addEventListener('click', () => {
        saveTaskChanges(task.id);
        toggleModal(false, elements.editTaskModal);
    });
    // Delete task using a helper function and close the task modal
    elements.deleteTaskBtn.addEventListener('click', () => {
        deleteTask(task.id);
        toggleModal(false, elements.editTaskModal);
        refreshTasksUI();
    });

    // Show the edit task modal
    toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
    // Get new user inputs

    // Create an object with the updated task details

    // Update task using a hlper functoin

    // Close the modal and refresh the UI to reflect the changes

    refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function () {
    init(); // init is called after the DOM is fully loaded
});

function init() {
    initializeData();
    setupEventListeners();
    const showSidebar = localStorage.getItem('showSideBar') === 'true';
    toggleSidebar(showSidebar);
    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme);
    if (isLightTheme) {
        elements.themeSwitch.checked = true;
        elements.logo.src = '/assets/logo-light.svg';
    }
    fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
    //FIXME: Delete if not used later
    //initializeData();
}

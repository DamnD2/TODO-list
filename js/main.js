/*-----------------------------MODAL------------------------------------*/
const $modal = document.querySelector('.modal');
const $form = $modal.querySelector('.form');
const $formMainField = $form.querySelector('.form__main-field');
const $formDescriptionField = $form.querySelector('.form__description-field');
const $formPriorityHigh = $form.querySelector('.high');
const $formPriorityLow = $form.querySelector('.low');
const $save = $form.querySelector('.add__tasks');
const $close = $form.querySelector('.cancel');


/*-----------------------------EDIT MODAL------------------------------------*/
const $editModal = document.querySelector('.edit-modal');
const $editForm = $editModal.querySelector('.form');
const $editFormMainField = $editForm.querySelector('.form__main-field');
const $editFormDescriptionField = $editForm.querySelector('.form__description-field');
const $editFormPriorityHigh = $editForm.querySelector('.high');
const $editFormPriorityLow = $editForm.querySelector('.low');
const $editSave = $editForm.querySelector('.save');
const $editClose = $editForm.querySelector('.cancel');


/*-----------------------------CONTENT------------------------------------*/
const $currentBtn = document.querySelector('.current__link');
const $completedBtn = document.querySelector('.completed__link');
const $trashBtn = document.querySelector('.trash__link');
const $currentBlock = document.querySelector('.current');
const $completedBlock = document.querySelector('.completed');
const $trashBlock = document.querySelector('.trash');
const $openModal = $currentBlock.querySelector('.current__add-btn');
let selectedTask;

let currentTasks = [
	{
		main: "Задание по умолчанию с высоким приоритетом",
		description: "Описание задания по умолчанию с высоким приоритетом",
		priority: "high",
	},
	{
		main: "Задание по умолчанию с низким приоритетом",
		description: "Описание задания по умолчанию с низким приоритетом",
		priority: "low",
	}
];

let completedTasks = [
	{
		main: "Завершенное задание по умолчанию",
		description: "Описание завершенного задания по умолчанию",
		priority: "high",
	},
];

let trashTasks = [
	{
		main: "Удалённое задание по умолчанию",
		description: "Удалённое завершенного задания по умолчанию",
		priority: "high",
	},
];

init( currentTasks, "currentTasks" );
init( completedTasks, "completedTasks" );
init( trashTasks, "trashTasks" );


document.addEventListener( 'click', event => {
	if(event.target === $openModal) addClassActive($modal);

	if(event.target === $close || event.target === $modal){
		removeClassActive($modal);
		clearForm($form);
	}

	if(event.target === $currentBtn || event.target === $completedBtn || event.target === $trashBtn){
		document.querySelectorAll('.menu__list-link').forEach(elem => removeClassActive(elem));
		document.querySelectorAll('.content').forEach(elem => removeClassActive(elem));
		addClassActive(event.target);
		if(event.target === $currentBtn) addClassActive($currentBlock);
		if(event.target === $completedBtn) addClassActive($completedBlock);
		if(event.target === $trashBtn) addClassActive($trashBlock);
	}
	
	if(event.target === $save){
		if(validationForm($form)){
			addCurrentTask();
			clearForm($form);
			sortCurrentTasks();
			renderCurrentTasks();
			setItemLocalStorage("currentTasks", currentTasks);
			removeClassActive($modal);
		}
	}

	if(event.target.classList.contains('task-edit') && event.target.closest('.current')){
		openEditModal(event.target, currentTasks);
		selectedTask = event.target;
	}

	if(event.target.classList.contains('task-edit') && event.target.closest('.completed')){
		openEditModal(event.target, completedTasks);
		selectedTask = event.target;
	}

	if(event.target === $editClose || event.target === $editModal){
		removeClassActive($editModal);
		clearForm($editForm);
	}

	if(event.target === $editSave && selectedTask.closest('.current')){
		if(validationForm($editForm)){
			saveEditingResult(selectedTask, currentTasks);
			clearForm($editForm);
			sortCurrentTasks();
			renderCurrentTasks();
			setItemLocalStorage("currentTasks", currentTasks);
			removeClassActive($editModal);
		}
	}

	if(event.target === $editSave && selectedTask.closest('.completed')){
		if(validationForm($editForm)){
			saveEditingResult(selectedTask, completedTasks);
			clearForm($editForm);
			renderCompletedTasks();
			setItemLocalStorage("completedTasks", completedTasks);
			removeClassActive($editModal);
		}
	}

	if(event.target.classList.contains('task-completed')){
		completeThisTask(event.target);
		setItemLocalStorage("currentTasks", currentTasks);
		setItemLocalStorage("completedTasks", completedTasks);
	}
	
	if(event.target.classList.contains('task-trash') && event.target.closest('.current')){
		trashThisTask(event.target, currentTasks);
		setItemLocalStorage("currentTasks", currentTasks);
		setItemLocalStorage("trashTasks", trashTasks);
	}

	if(event.target.classList.contains('task-trash') && event.target.closest('.completed')){
		trashThisTask(event.target, completedTasks);
		setItemLocalStorage("completedTasks", completedTasks);
		setItemLocalStorage("trashTasks", trashTasks);
	}

	if(event.target.classList.contains('task-restore')){
		restoreThisTask(event.target);
		setItemLocalStorage("currentTasks", currentTasks);
		setItemLocalStorage("trashTasks", trashTasks);
	} 

	if(event.target.classList.contains('task-delete')){
		deleteThisTask(event.target);
		setItemLocalStorage("trashTasks", trashTasks);
	} 
});


function setItemLocalStorage ( localStorageKey, tasksArray ){
	localStorage.setItem(localStorageKey, JSON.stringify(tasksArray));
}

function init ( tasksArray, localStorageKey ) {
	if(localStorage.getItem(localStorageKey)){
		tasksArray.splice(0, tasksArray.length);
		JSON.parse(localStorage.getItem(localStorageKey)).forEach(elem => {
			tasksArray.push(elem);
		});
	}
}

function addClassActive ( $element ) {
	$element.classList.add('active');
}


function removeClassActive ( $element ) {
	$element.classList.remove('active');
}


function addClassError ( $element ) {
	$element.classList.add('error');
}


function removeClassError ( $element ) {
	$element.classList.remove('error');
}


function clearForm ( form = $form) {
	form.querySelectorAll('textarea').forEach(elem =>{
		elem.value = "";
		removeClassError(elem);
	});
	form.querySelectorAll('input').forEach(elem =>{
		elem.checked = false;
		removeClassError(elem);
	});
}


function renderCurrentTasks ( currentTasksArray = currentTasks ) {
	$currentBlock.querySelector('.tasks').innerHTML = currentTasksArray.reduce(function(result, elem, index) {
		return result += `<div class="task" data-id="${index}">
							<div class="task__priority ${elem.priority}"></div>
							<div class="task-text">
								<p class="task-main">${elem.main}</p>
								<p class="task-description">${elem.description}</p>
							</div>
							<div class="task-btns">
								<img class="task-edit" src="media/edit.svg"></img>
								<img class="task-completed" src="media/completed.svg"></img>
								<img class="task-trash" src="media/trash.svg">
							</div>
						</div>`;
	},"");
}
renderCurrentTasks();


function renderCompletedTasks ( completedTasksArray =  completedTasks ) {
	$completedBlock.querySelector('.tasks').innerHTML = completedTasksArray.reduce(function(result, elem, index) {
		return result += `<div class="task completed__task" data-id="${index}">
									<div class="task-text">
										<p class="task-main">${elem.main}</p>
										<p class="task-description">${elem.description}</p>
									</div>
									<div class="task-btns">
										<img class="task-edit" src="media/editCompleted.svg"></img>
										<img class="task-trash" src="media/trashCompleted.svg">
									</div>
								</div>`;
	},"");
}
renderCompletedTasks();


function renderTrashTasks ( trashTasksArray =  trashTasks ) {
	$trashBlock.querySelector('.tasks').innerHTML = trashTasksArray.reduce(function(result, elem, index) {
		return result += `<div class="task trash__task" data-id="${index}">
									<div class="task-text">
										<p class="task-main">${elem.main}</p>
										<p class="task-description">${elem.description}</p>
									</div>
									<div class="task-btns">
										<img class="task-restore" src="media/restore.svg"></img>
										<img class="task-delete" src="media/delete.svg"></img>
									</div>
								</div>`;
	},"");
}
renderTrashTasks();


function validationForm ( form ) {
	const $mainField = form.querySelector('.form__main-field');
	if($mainField.value.trim() === ""){
		addClassError($mainField);
		return false;
	}
	return true;
}


function addCurrentTask ( currentTasksArray = currentTasks ) {
	const priority = ($formPriorityHigh.checked) ? "high" : ($formPriorityLow.checked) ? "low" : null;
	currentTasksArray.push(
		{
			main : $formMainField.value.trim(),
			description : $formDescriptionField.value.trim(),
			priority : priority,
		}
	);
}


function sortCurrentTasks ( currentTasksArray = currentTasks ) {
	const sortedArray = [];
	for(let elem of currentTasksArray){
		if(elem.priority === "high") sortedArray.push(elem);
	}
	for(let elem of currentTasksArray){
		if(elem.priority === "low") sortedArray.push(elem);
	}
	for(let elem of currentTasksArray){
		if(elem.priority === null) sortedArray.push(elem);
	}
	currentTasksArray.splice(0, currentTasksArray.length);
	for(let elem of sortedArray){
		currentTasksArray.push(elem);
	}
}


function openEditModal ( target, tasksArray ) {
	const task = tasksArray[target.closest('.task').dataset.id];
	$editFormMainField.value = task.main;
	$editFormDescriptionField.value = task.description;
	if(task.priority === "high") $editFormPriorityHigh.checked = true;
	if(task.priority === "low") $editFormPriorityLow.checked = true;
	addClassActive($editModal);
}

function saveEditingResult ( target, tasksArray ) {
	const task = tasksArray[target.closest('.task').dataset.id];
	task.main = $editFormMainField.value;
	task.description = $editFormDescriptionField.value;
	task.priority = ($editFormPriorityHigh.checked) ? "high" : ($editFormPriorityLow.checked) ? "low" : null;
}

function completeThisTask ( target ) {
	const id = parseInt(target.closest('.task').dataset.id);
	completedTasks.push(currentTasks[id]);
	currentTasks.splice(id, 1);
	renderCurrentTasks();
	renderCompletedTasks();
}

function trashThisTask ( target, tasksArray ) {
	const id = parseInt(target.closest('.task').dataset.id);
	trashTasks.push(tasksArray[id]);
	tasksArray.splice(id, 1);
	renderCurrentTasks();
	renderCompletedTasks();
	renderTrashTasks();
} 

function restoreThisTask ( target ) {
	const id = parseInt(target.closest('.task').dataset.id);
	currentTasks.push(trashTasks[id]);
	trashTasks.splice(id, 1);
	renderTrashTasks();
	sortCurrentTasks();
	renderCurrentTasks();
}

function deleteThisTask ( target ) {
	const id = parseInt(target.closest('.task').dataset.id);
	trashTasks.splice(id, 1);
	renderTrashTasks();
}
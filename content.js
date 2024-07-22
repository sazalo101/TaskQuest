function checkForCompletedTasks() {
    let completedTasks = 0;
  
    if (window.location.hostname.includes('todoist.com')) {
      // Todoist integration
      const completedTaskElements = document.querySelectorAll('.task_list_item--completed');
      completedTasks = completedTaskElements.length;
    } else if (window.location.hostname.includes('trello.com')) {
      // Trello integration
      const completedCards = document.querySelectorAll('.list-card.js-member-droppable.ui-droppable.completed');
      completedTasks = completedCards.length;
    } else if (window.location.hostname.includes('asana.com')) {
      // Asana integration
      const completedTaskElements = document.querySelectorAll('.TaskRow--completed');
      completedTasks = completedTaskElements.length;
    }
  
    return completedTasks;
  }
  
  let lastCompletedTaskCount = 0;
  
  setInterval(() => {
    const currentCompletedTasks = checkForCompletedTasks();
    if (currentCompletedTasks > lastCompletedTaskCount) {
      const newCompletedTasks = currentCompletedTasks - lastCompletedTaskCount;
      chrome.runtime.sendMessage({action: "addXP", xp: newCompletedTasks * 10});
      lastCompletedTaskCount = currentCompletedTasks;
    }
  }, 60000);
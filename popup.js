document.addEventListener('DOMContentLoaded', function() {
    const levelSpan = document.getElementById('level');
    const xpSpan = document.getElementById('xp');
    const nextLevelXpSpan = document.getElementById('next-level-xp');
    const progressBar = document.getElementById('progress');
    const achievementsList = document.getElementById('achievements-list');
    const themeSelect = document.getElementById('theme-select');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
  
    function updateStats() {
      chrome.storage.sync.get(['level', 'xp', 'achievements', 'tasks'], function(result) {
        const level = result.level || 1;
        const xp = result.xp || 0;
        const nextLevelXp = level * 100;
  
        levelSpan.textContent = level;
        xpSpan.textContent = xp;
        nextLevelXpSpan.textContent = nextLevelXp;
        progressBar.style.width = `${(xp / nextLevelXp) * 100}%`;
  
        // Update achievements list
        achievementsList.innerHTML = '';
        const achievements = result.achievements || [];
        achievements.forEach(achievementId => {
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) {
            const li = document.createElement('li');
            li.textContent = `${achievement.name}: ${achievement.description}`;
            achievementsList.appendChild(li);
          }
        });
  
        // Update task list
        taskList.innerHTML = '';
        const tasks = result.tasks || [];
        tasks.forEach((task, index) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span>${task.name}</span>
            <button class="complete-task" data-index="${index}">Complete</button>
          `;
          taskList.appendChild(li);
        });
      });
    }
  
    addTaskButton.addEventListener('click', function() {
      const taskName = newTaskInput.value.trim();
      if (taskName) {
        chrome.runtime.sendMessage({action: "addTask", taskName: taskName}, function() {
          newTaskInput.value = '';
          updateStats();
        });
      }
    });
  
    taskList.addEventListener('click', function(e) {
      if (e.target.classList.contains('complete-task')) {
        const taskIndex = e.target.getAttribute('data-index');
        chrome.runtime.sendMessage({action: "completeTask", taskIndex: parseInt(taskIndex)}, function() {
          updateStats();
        });
      }
    });
  
    themeSelect.addEventListener('change', function(event) {
      const theme = event.target.value;
      document.body.className = `theme-${theme}`;
      chrome.storage.sync.set({theme: theme});
    });
  
    // Load saved theme
    chrome.storage.sync.get(['theme'], function(result) {
      const theme = result.theme || 'default';
      document.body.className = `theme-${theme}`;
      themeSelect.value = theme;
    });
  
    updateStats();
  });
  